import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getConversations, getMessages, sendMessage, shareAddress, markAsRead, getUnreadCount } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('merchant', 'helping_center'));

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);
router.post('/messages/address', shareAddress);
router.put('/messages/:messageId/read', markAsRead);
router.get('/unread-count', getUnreadCount);

export default router;
