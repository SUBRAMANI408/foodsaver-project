import ChatMessage from '../models/ChatMessage.js';
import Notification from '../models/Notification.js';
import HelpingCenter from '../models/HelpingCenter.js';
import Merchant from '../models/Merchant.js';

const getModelName = (role) => {
  return role === 'merchant' ? 'Merchant' : 'HelpingCenter';
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const modelName = getModelName(req.userRole);

    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(userId), senderModel: modelName },
            { receiver: mongoose.Types.ObjectId(userId), receiverModel: modelName }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          latestMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', mongoose.Types.ObjectId(userId)] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    await ChatMessage.populate(conversations, {
      path: 'latestMessage.sender latestMessage.receiver',
      select: 'name profilePicture email phone'
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture');

    // Mark as read when fetched by receiver
    await ChatMessage.updateMany(
      { conversationId, receiver: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, receiverModel, content, type = 'text', metadata, requirementId } = req.body;
    const senderId = req.userId;
    const senderModel = getModelName(req.userRole);

    const message = new ChatMessage({
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

    await message.save();

    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');

    // Emit socket event if io is accessible, assuming it might be on app setup
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${conversationId}`).emit('chat:message', message);
      io.to(`user_${receiverId}`).emit('chat:notification', message);
    }

    // Create Notification
    const notification = new Notification({
      user: receiverId,
      userModel: receiverModel,
      type: 'chat_message',
      title: 'New Message',
      message: `You have a new message from ${message.sender.name}`,
      relatedId: message._id,
      onModel: 'ChatMessage'
    });
    await notification.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const shareAddress = async (req, res) => {
  try {
    const { conversationId, receiverId, receiverModel, requirementId } = req.body;
    const senderId = req.userId;
    const senderModel = getModelName(req.userRole);

    if (senderModel !== 'HelpingCenter') {
      return res.status(403).json({ message: 'Only Helping Centers can share addresses' });
    }

    const ngo = await HelpingCenter.findById(senderId);
    if (!ngo) {
      return res.status(404).json({ message: 'Helping Center not found' });
    }

    const metadata = {
      address: ngo.address,
      contactPerson: ngo.contactPerson,
      phone: ngo.phone,
    };

    const message = new ChatMessage({
      conversationId,
      sender: senderId,
      senderModel,
      receiver: receiverId,
      receiverModel,
      content: 'Shared address for food pickup/delivery.',
      type: 'address_share',
      metadata,
      requirement: requirementId,
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');
    
    const io = req.app.get('io');
    if (io) {
      io.to(`chat:${conversationId}`).emit('chat:message', message);
      io.to(`user_${receiverId}`).emit('chat:notification', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sharing address:', error);
    res.status(500).json({ message: 'Failed to share address' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await ChatMessage.findOneAndUpdate(
      { _id: messageId, receiver: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const unreadCount = await ChatMessage.countDocuments({
      receiver: userId,
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};
