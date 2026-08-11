import cron from 'node-cron';
import Order from './models/Order.js';
import FoodItem from './models/FoodItem.js';
import { sendOrderExpiringEmail } from './utils/emailService.js';

export const initCronJobs = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 1. Find orders that are expiring in <= 15 minutes, where alert hasn't been sent
      const fifteenMinsFromNow = new Date(now.getTime() + 15 * 60 * 1000);
      
      const expiringSoon = await Order.find({
        status: 'pending',
        expiresAt: { $lte: fifteenMinsFromNow, $gt: now },
        expiryAlertSent: false
      }).populate('user');

      for (const order of expiringSoon) {
        order.expiryAlertSent = true;
        await order.save();
        
        if (order.user && order.user.email) {
          sendOrderExpiringEmail(
            order.user.email,
            order.user.name || 'User',
            order
          ).catch(err => console.error('Failed to send expiry alert:', err));
        }
      }

      // 2. Find orders that have expired
      const expiredOrders = await Order.find({
        status: 'pending',
        expiresAt: { $lte: now }
      }).populate('user').populate('items.foodItemId');

      for (const order of expiredOrders) {
        order.status = 'cancelled';
        order.cancellationReason = 'Token expired due to no pickup';
        order.statusHistory.push({ status: 'cancelled', note: 'Token expired automatically' });
        await order.save();

        // Restore food item quantities
        for (const item of order.items) {
          const food = await FoodItem.findById(item.foodItemId._id);
          if (food) {
            food.availableQuantity += item.quantity;
            if (food.status === 'unavailable' && food.availableQuantity > 0) {
              food.status = 'active';
            }
            await food.save();
          }
        }
        
        // Notify user of expiry
        // Assuming we could add sendOrderExpiredEmail, but we can reuse expiring with a slight modification or just not send it if not strictly required
      }

      // if (expiringSoon.length > 0 || expiredOrders.length > 0) {
      //   console.log(`[CRON] Processed ${expiringSoon.length} alerts and ${expiredOrders.length} expirations.`);
      // }

    } catch (error) {
      console.error('[CRON Error]:', error);
    }
  });

  console.log('[CRON] Jobs initialized');
};
