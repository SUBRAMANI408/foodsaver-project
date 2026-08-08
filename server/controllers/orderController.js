import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import Notification from '../models/Notification.js';

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
      const food = await FoodItem.findById(item.foodItemId);
      if (!food) return res.status(404).json({ success: false, message: `Food item ${item.foodItemId} not found` });
      if (food.availableQuantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient quantity for ${food.name}` });
      }
      if (food.status === 'expired') {
        return res.status(400).json({ success: false, message: `${food.name} has expired` });
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

      // Reserve the food
      await FoodItem.findByIdAndUpdate(food._id, {
        $inc: { availableQuantity: -item.quantity },
        status: food.availableQuantity - item.quantity <= 0 ? 'reserved' : food.status,
      });
    }

    const deliveryFee = deliveryType === 'delivery' ? 30 : 0;
    const totalAmount = subtotal + deliveryFee;
    const discountAmount = orderItems.reduce((acc, i) => acc + (i.originalPrice - i.discountedPrice) * i.quantity, 0);

    const merchant = await Merchant.findById(merchantId);

    const order = await Order.create({
      user: req.userId,
      merchant: merchantId,
      items: orderItems,
      paymentMethod,
      deliveryType,
      deliveryAddress,
      merchantAddress: { address: merchant.address, coordinates: merchant.location.coordinates },
      subtotal,
      discountAmount,
      deliveryFee,
      totalAmount,
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
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }

    // Restore food quantities
    for (const item of order.items) {
      await FoodItem.findByIdAndUpdate(item.foodItem, { $inc: { availableQuantity: item.quantity } });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({ status: 'cancelled', note: reason });
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
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
