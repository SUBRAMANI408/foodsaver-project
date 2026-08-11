import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendOrderExpiringEmail } from '../utils/emailService.js';

export const startExpireOrdersCron = (io) => {
  // Run every 1 minute
  setInterval(async () => {
    try {
      const expiredOrders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready_for_pickup'] },
        expiresAt: { $lt: new Date() },
      }).populate('items.foodItem');

      for (const order of expiredOrders) {
        order.status = 'cancelled';
        order.cancellationReason = 'Token expired due to non-pickup within the time limit.';
        order.statusHistory.push({
          status: 'cancelled',
          note: 'Expired due to non-pickup',
        });
        await order.save();

        // Restore food quantities
        for (const item of order.items) {
          if (item.foodItem) {
            await FoodItem.findByIdAndUpdate(item.foodItem._id, {
              $inc: { availableQuantity: item.quantity },
              status: 'available', // if it was reserved, make it available again
            });
          }
        }

        // Notify User
        await Notification.create({
          recipient: order.user,
          recipientModel: 'User',
          title: 'Order Expired ❌',
          message: `Your order #${order.orderNumber} has expired because it was not picked up in time.`,
          type: 'order',
          data: { orderId: order._id },
        });

        // Notify Merchant
        await Notification.create({
          recipient: order.merchant,
          recipientModel: 'Merchant',
          title: 'Order Expired ❌',
          message: `Order #${order.orderNumber} expired due to customer non-pickup. Quantities have been restored.`,
          type: 'order',
          data: { orderId: order._id },
        });

        // Emit socket events to update client state immediately
        if (io) {
          io.to(`user:${order.user}`).emit('order:update', order);
          io.to(`merchant:${order.merchant}`).emit('order:update', order);
        }
      }
      
      if (expiredOrders.length > 0) {
        console.log(`[Cron] Expired ${expiredOrders.length} orders due to non-pickup.`);
      }

      // Check for orders nearing expiration (within 15 minutes)
      const nearingExpirationOrders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'preparing', 'ready_for_pickup'] },
        expiresAt: {
          $gt: new Date(),
          $lte: new Date(Date.now() + 15 * 60 * 1000), // 15 mins from now
        },
        expiryAlertSent: { $ne: true },
      });

      for (const order of nearingExpirationOrders) {
        order.expiryAlertSent = true;
        await order.save();

        // Notify User
        await Notification.create({
          recipient: order.user,
          recipientModel: 'User',
          title: 'Order Expiring Soon ⏰',
          message: `Hurry! Your order #${order.orderNumber} will expire in less than 15 minutes. Please pick it up!`,
          type: 'order',
          data: { orderId: order._id },
        });

        if (io) {
          // Emit socket event if we want to show a toast immediately
          io.to(`user:${order.user}`).emit('notification:new', {
            title: 'Order Expiring Soon ⏰',
            message: `Hurry! Your order #${order.orderNumber} will expire in less than 15 minutes. Please pick it up!`,
          });
        }

        // Send email
        const user = await User.findById(order.user).select('email name');
        if (user && user.email) {
          sendOrderExpiringEmail(user.email, user.name, order).catch(err => console.error(err));
        }
      }

      if (nearingExpirationOrders.length > 0) {
        console.log(`[Cron] Sent ${nearingExpirationOrders.length} expiration alerts.`);
      }
    } catch (error) {
      console.error('[Cron] Error expiring orders:', error);
    }
  }, 60 * 1000); // 1 minute interval
};
