import express from 'express';
import {
  getFoodItems, getFoodItem, createFoodItem, updateFoodItem, deleteFoodItem,
  getMerchantFoodItems, donateFoodItem, getTrendingFood,
} from '../controllers/foodController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', getFoodItems);
router.get('/trending', getTrendingFood);
router.get('/merchant/my', protect, authorize('merchant'), getMerchantFoodItems);
router.get('/:id', getFoodItem);
router.post('/', protect, authorize('merchant'), upload.array('images', 5), createFoodItem);
router.put('/:id', protect, authorize('merchant'), upload.array('images', 5), updateFoodItem);
router.delete('/:id', protect, authorize('merchant'), deleteFoodItem);
router.post('/:id/donate', protect, authorize('merchant'), donateFoodItem);

export default router;
