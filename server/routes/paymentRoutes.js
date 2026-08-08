import express from 'express';
import { createPaymentOrder, verifyPayment, getUserPayments, getAllPayments } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, authorize('user'), createPaymentOrder);
router.post('/verify', protect, authorize('user'), verifyPayment);
router.get('/my', protect, authorize('user'), getUserPayments);
router.get('/', protect, authorize('admin'), getAllPayments);

export default router;
