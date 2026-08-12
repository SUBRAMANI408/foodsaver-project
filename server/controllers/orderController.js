import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import Notification from '../models/Notification.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

// @desc    Create order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, deliveryType, deliveryAddress, specialInstructions } = req.body;

    // Validate and lock food items
    let subtotal = 0;
    const orderItems = [];
    let merchantId;

    for (const item of items) {
      // Atomic claim: only succeeds if enough stock exists (race-condition safe)
      const food = await FoodItem.findOneAndUpdate(
        {
          _id: item.foodItemId,
          availableQuantity: { $gte: item.quantity },
          status: { $ne: 'expired' },
        },
        { $inc: { availableQuantity: -item.quantity } },
        { new: true }
      );

      if (!food) {
        // Rollback any items already reserved in this order
        for (const reserved of orderItems) {
          await FoodItem.findByIdAndUpdate(reserved.foodItem, {
            $inc: { availableQuantity: reserved.quantity },
          });
        }
        const original = await FoodItem.findById(item.foodItemId);
        const reason = !original ? 'not found' : original.status === 'expired' ? 'expired' : 'insufficient stock';
        return res.status(400).json({ success: false, message: `Cannot claim item: ${reason}` });
      }

      // Mark as reserved if stock hit zero
      if (food.availableQuantity <= 0) {
        await FoodItem.findByIdAndUpdate(food._id, { status: 'reserved' });
      }

      merchantId = food.merchant;
      const itemTotal = food.discountedPrice * item.quantity;
      subtotal += itemTotal;
      orderItems.push({
        foodItem: food._id,
        name: food.name,
        quantity: item.quantity,
        originalPrice: food.originalPrice,
        discountedPrice: food.discountedPrice,
        discountPercentage: food.discountPercentage,
        image: food.images[0] || '',
      });

      // Broadcast real-time inventory update to all clients
      req.io?.emit('food:stock_updated', {
        foodId: food._id.toString(),
        availableQuantity: food.availableQuantity,
        status: food.availableQuantity <= 0 ? 'reserved' : food.status,
      });
    }

    const totalAmount = subtotal;
    const discountAmount = orderItems.reduce((acc, i) => acc + (i.originalPrice - i.discountedPrice) * i.quantity, 0);

    const merchant = await Merchant.findById(merchantId);

    const order = await Order.create({
      user: req.userId,
      merchant: merchantId,
      items: orderItems,
      paymentMethod,
      deliveryType,
      deliveryAddress,
      subtotal,
      discountAmount,
      totalAmount,
      expiresAt: new Date(Date.now() + 240 * 60 * 1000), // 4 hours from now
      specialInstructions,
      statusHistory: [{ status: 'pending', note: 'Order placed' }],
    });

    // Notify merchant
    await Notification.create({
      recipient: merchantId,
      recipientModel: 'Merchant',
      title: 'New Order Received! 🎉',
      message: `New order #${order.orderNumber} for ₹${totalAmount}`,
      type: 'order',
      data: { orderId: order._id },
    });

    req.io?.to(`merchant:${merchantId}`).emit('order:new', order);

    // Send confirmation email asynchronously
    const user = await User.findById(req.userId).select('email name');
    if (user && user.email) {
      sendOrderConfirmationEmail(user.email, user.name, order).catch(err => console.error(err));
    }

    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my
export const getUserOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.userId };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('merchant', 'businessName logo address')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merchant orders
// @route   GET /api/orders/merchant
export const getMerchantOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { merchant: req.userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name phone avatar')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name phone avatar email')
      .populate('merchant', 'businessName logo address phone location')
      .populate('deliveryPartner', 'name phone avatar vehicleType currentLocation');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (merchant)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, note: note || '', timestamp: new Date() });
    await order.save();

    // Notify user
    await Notification.create({
      recipient: order.user,
      recipientModel: 'User',
      title: `Order ${status.replace('_', ' ')}`,
      message: `Your order #${order.orderNumber} is now ${status}`,
      type: 'order',
      data: { orderId: order._id },
    });

    req.io?.to(`user:${order.user}`).emit('order:updated', { orderId: order._id, status });

    // Update merchant stats when order is delivered
    if (status === 'delivered') {
      await Merchant.findByIdAndUpdate(order.merchant, { $inc: { totalOrders: 1, totalRevenue: order.totalAmount } });
      await User.findByIdAndUpdate(order.user, { $inc: { totalOrdersPlaced: 1, totalAmountSaved: order.discountAmount } });
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    // Check authorization: User can only cancel their own order. Merchant can cancel orders for their shop.
    const isOwner = order.user.toString() === req.userId;
    const isMerchant = order.merchant.toString() === req.userId;
    const isAdmin = req.userRole === 'admin';
    if (!isOwner && !isMerchant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }
    // Users can only cancel before it's ready for pickup or delivered
    if (isOwner && !isMerchant && !isAdmin && ['ready_for_pickup', 'preparing'].includes(order.status)) {
       return res.status(400).json({ success: false, message: 'Order is already being prepared or ready. Cannot cancel.' });
    }

    // Restore food quantities
    for (const item of order.items) {
      const restored = await FoodItem.findByIdAndUpdate(item.foodItem, { 
        $inc: { availableQuantity: item.quantity },
        status: 'available' 
      }, { new: true });

      // Broadcast real-time inventory restoration to all clients
      if (restored) {
        req.io?.emit('food:stock_updated', {
          foodId: restored._id.toString(),
          availableQuantity: restored.availableQuantity,
          status: 'available',
        });
      }
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by user', timestamp: new Date() });
    await order.save();

    // Notifications
    if (isOwner) {
       await Notification.create({ recipient: order.merchant, recipientModel: 'Merchant', title: 'Order Cancelled 🚫', message: `Order #${order.orderNumber} was cancelled by the customer.`, type: 'order', data: { orderId: order._id } });
       req.io?.to(`merchant:${order.merchant}`).emit('order:updated', { orderId: order._id, status: 'cancelled' });
    } else {
       await Notification.create({ recipient: order.user, recipientModel: 'User', title: 'Order Cancelled 🚫', message: `Your order #${order.orderNumber} was cancelled.`, type: 'order', data: { orderId: order._id } });
       req.io?.to(`user:${order.user}`).emit('order:updated', { orderId: order._id, status: 'cancelled' });
    }

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('merchant', 'businessName')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};
