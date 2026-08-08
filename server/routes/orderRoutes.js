import express from 'express';
import {
  createOrder, getUserOrders, getMerchantOrders, getOrder, updateOrderStatus, cancelOrder, getAllOrders,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllOrders);
router.post('/', protect, authorize('user'), createOrder);
router.get('/my', protect, authorize('user'), getUserOrders);
router.get('/merchant', protect, authorize('merchant'), getMerchantOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('merchant', 'admin', 'delivery_partner'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

export default router;
