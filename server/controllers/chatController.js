import mongoose from 'mongoose';
import ChatMessage from '../models/ChatMessage.js';
import Sponsorship from '../models/Sponsorship.js';
import Notification from '../models/Notification.js';
import HelpingCenter from '../models/HelpingCenter.js';
import Merchant from '../models/Merchant.js';

const getRoleModel = (role) => role === 'merchant' ? 'Merchant' : 'HelpingCenter';

// Helper: check if chat is allowed (only for accepted sponsorships)
const verifyChatAccess = async (conversationId, userId) => {
  // conversationId format: req_{requirementId}_{ngoId}_{merchantId}
  const parts = conversationId.split('_');
  if (parts.length < 4) return false;
  const reqId = parts[1];
  const ngoId = parts[2];
  const merchantId = parts[3];
  
  // Verify user is part of this conversation
  if (userId !== ngoId && userId !== merchantId) return false;
  
  // Check if there's an accepted sponsorship for this requirement+merchant
  const sponsorship = await Sponsorship.findOne({
    requirement: reqId,
    merchant: merchantId,
    status: 'accepted',
    chatEnabled: true,
  });
  return !!sponsorship;
};

// GET /api/chat/conversations
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    // Find all accepted sponsorships where this user is involved
    let sponsorships;
    if (req.userRole === 'merchant') {
      sponsorships = await Sponsorship.find({ merchant: userId, chatEnabled: true })
        .populate('requirement', 'ngoName ngo mealType quantityRequired requiredDate addressText')
        .sort('-updatedAt');
    } else {
      // NGO - find via requirement
      const FoodRequirement = (await import('../models/FoodRequirement.js')).default;
      const myReqs = await FoodRequirement.find({ ngo: userId }).select('_id');
      const reqIds = myReqs.map(r => r._id);
      sponsorships = await Sponsorship.find({ requirement: { $in: reqIds }, chatEnabled: true })
        .populate('requirement', 'ngoName ngo mealType quantityRequired requiredDate addressText')
        .populate('merchant', 'businessName address phone logo')
        .sort('-updatedAt');
    }
    
    // Build conversation list with latest message and unread count
    const conversations = await Promise.all(sponsorships.map(async (sp) => {
      const convId = sp.conversationId;
      const latestMessage = await ChatMessage.findOne({ conversationId: convId })
        .sort('-createdAt');
      const unreadCount = await ChatMessage.countDocuments({
        conversationId: convId,
        receiver: new mongoose.Types.ObjectId(userId),
        isRead: false,
      });
      
      // Get the other party's info
      let otherParty;
      if (req.userRole === 'merchant') {
        otherParty = await HelpingCenter.findById(sp.requirement?.ngo).select('centerName name address phone logo');
      } else {
        otherParty = sp.merchant;
      }
      
      return {
        conversationId: convId,
        sponsorship: sp,
        otherParty,
        latestMessage,
        unreadCount,
      };
    }));
    
    res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/messages/:conversationId
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;
    
    // Verify chat access
    const hasAccess = await verifyChatAccess(conversationId, userId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Chat not available. Sponsorship must be accepted first.' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Mark unread messages as read
    await ChatMessage.updateMany(
      { conversationId, receiver: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/messages
export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, receiverModel, content, type = 'text', metadata, requirementId } = req.body;
    const senderId = req.userId;
    const senderModel = getRoleModel(req.userRole);
    
    // Verify chat access
    const hasAccess = await verifyChatAccess(conversationId, senderId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Chat not available. Sponsorship must be accepted first.' });
    }
    
    const message = await ChatMessage.create({
      conversationId,
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      content,
      type,
      metadata,
      requirement: requirementId,
    });
    
    // Emit via socket
    req.io?.to(`chat:${conversationId}`).emit('chat:message', message);
    req.io?.to(`user_${receiverId}`).emit('chat:notification', {
      conversationId,
      message,
    });
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/messages/address
export const shareAddress = async (req, res, next) => {
  try {
    const { conversationId, receiverId, receiverModel, requirementId } = req.body;
    const senderId = req.userId;
    const senderModel = getRoleModel(req.userRole);
    
    const hasAccess = await verifyChatAccess(conversationId, senderId);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Chat not available.' });
    }
    
    // Get NGO address
    const ngo = await HelpingCenter.findById(senderId);
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });
    
    const metadata = {
      ngoName: ngo.centerName || ngo.name,
      address: ngo.address,
      phone: ngo.phone,
      email: ngo.email,
      location: ngo.location,
    };
    
    const message = await ChatMessage.create({
      conversationId,
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      content: `📍 Delivery Address: ${ngo.address}`,
      type: 'address_share',
      metadata,
      requirement: requirementId,
    });
    
    // Also create a system message
    await ChatMessage.create({
      conversationId,
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      content: 'NGO shared the delivery address.',
      type: 'system',
      requirement: requirementId,
    });
    
    req.io?.to(`chat:${conversationId}`).emit('chat:message', message);
    req.io?.to(`user_${receiverId}`).emit('chat:notification', { conversationId, message });
    
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// PUT /api/chat/messages/:messageId/read
export const markAsRead = async (req, res, next) => {
  try {
    const message = await ChatMessage.findOneAndUpdate(
      { _id: req.params.messageId, receiver: req.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// GET /api/chat/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await ChatMessage.countDocuments({ receiver: req.userId, isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};
