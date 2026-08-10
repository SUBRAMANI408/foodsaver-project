import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createRequirement,
  getMyRequirements,
  acceptSponsorship,
  rejectSponsorship,
  getNearbyRequirements,
  submitSponsorship,
  editSponsorship,
  getMySponsorships,
  getRequirement,
  cancelRequirement,
} from '../controllers/requirementController.js';

const router = express.Router();

// NGO Routes
router.post('/', protect, authorize('helping_center'), createRequirement);
router.get('/my', protect, authorize('helping_center'), getMyRequirements);
router.put('/:id/sponsorships/:sponsorshipId/accept', protect, authorize('helping_center'), acceptSponsorship);
router.put('/:id/sponsorships/:sponsorshipId/reject', protect, authorize('helping_center'), rejectSponsorship);
router.delete('/:id', protect, authorize('helping_center'), cancelRequirement);

// Merchant Routes
router.get('/nearby', protect, authorize('merchant'), getNearbyRequirements);
router.post('/:id/sponsor', protect, authorize('merchant'), submitSponsorship);
router.put('/:id/sponsor/edit', protect, authorize('merchant'), editSponsorship);
router.get('/my-sponsorships', protect, authorize('merchant'), getMySponsorships);

// Shared
router.get('/:id', protect, getRequirement);

export default router;
