import Notification from '../models/Notification.js';

// @desc    Get notifications for logged-in user
// @route   GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const roleModelMap = {
      user: 'User',
      merchant: 'Merchant',
      helping_center: 'HelpingCenter',
      admin: 'Admin',
    };

    const total = await Notification.countDocuments({ recipient: req.userId });
    const notifications = await Notification.find({ recipient: req.userId })
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: req.userId, isRead: false });

    res.json({ success: true, data: notifications, unreadCount, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.userId });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
