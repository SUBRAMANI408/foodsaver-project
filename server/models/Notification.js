import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'recipientModel' },
  recipientModel: { type: String, required: true, enum: ['User', 'Merchant', 'DeliveryPartner', 'HelpingCenter', 'Admin'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['order', 'payment', 'discount', 'donation', 'delivery', 'review', 'system', 'promotion', 'requirement', 'sponsorship'],
    required: true,
  },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
