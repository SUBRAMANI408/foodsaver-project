import express from 'express';
import { createReview, getMerchantReviews, respondToReview } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, authorize('user'), upload.array('images', 3), createReview);
router.get('/merchant/:merchantId', getMerchantReviews);
router.put('/:id/respond', protect, authorize('merchant'), respondToReview);

export default router;
