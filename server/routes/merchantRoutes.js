import express from 'express';
import { getNearbyMerchants, getMerchantProfile, updateMerchantProfile, getMerchantDashboard } from '../controllers/merchantController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/nearby', getNearbyMerchants);
router.get('/dashboard', protect, authorize('merchant'), getMerchantDashboard);
router.put('/profile', protect, authorize('merchant'), upload.single('logo'), updateMerchantProfile);
router.get('/:id', getMerchantProfile);

export default router;
