import express from 'express';
import { getAdminStats, getAllUsers, toggleUserStatus, getAllMerchants, verifyMerchant, getAnalytics } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/analytics', getAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/merchants', getAllMerchants);
router.put('/merchants/:id/verify', verifyMerchant);

export default router;
