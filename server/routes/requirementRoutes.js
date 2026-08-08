import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createRequirement,
  getMyRequirements,
  acceptSponsorship,
  getNearbyRequirements,
  submitSponsorship,
  getMySponsorships,
  getRequirement,
  cancelRequirement,
} from '../controllers/requirementController.js';

const router = express.Router();

// NGO Routes
router.post('/', protect, authorize('helping_center'), createRequirement);
router.get('/my', protect, authorize('helping_center'), getMyRequirements);
router.put('/:id/sponsorships/:sponsorshipId/accept', protect, authorize('helping_center'), acceptSponsorship);
router.delete('/:id', protect, authorize('helping_center'), cancelRequirement);

// Merchant Routes
router.get('/nearby', protect, authorize('merchant'), getNearbyRequirements);
router.post('/:id/sponsor', protect, authorize('merchant'), submitSponsorship);
router.get('/my-sponsorships', protect, authorize('merchant'), getMySponsorships);

// Shared
router.get('/:id', protect, getRequirement);

export default router;
