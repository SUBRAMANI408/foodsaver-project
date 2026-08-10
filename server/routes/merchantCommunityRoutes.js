import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getPosts,
  createPost,
  updatePost,
  createRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
  completeRequest
} from '../controllers/merchantCommunityController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('merchant'));

// Posts
router.route('/posts')
  .get(getPosts)
  .post(createPost);

router.route('/posts/:id')
  .put(updatePost);

// Requests
router.route('/requests')
  .post(createRequest);

router.route('/requests/received')
  .get(getReceivedRequests);

router.route('/requests/sent')
  .get(getSentRequests);

router.route('/requests/:id/status')
  .patch(updateRequestStatus);

router.route('/requests/:id/complete')
  .post(completeRequest);

export default router;
