import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true }, // format: 'req_{requirementId}_{ngoId}_{merchantId}'
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['Merchant', 'HelpingCenter'] },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
  receiverModel: { type: String, required: true, enum: ['Merchant', 'HelpingCenter'] },
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequirement' },
  type: {
    type: String,
    enum: ['text', 'system', 'address_share', 'delivery_schedule', 'food_details'],
    default: 'text',
  },
  content: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed }, // for address cards, delivery details, etc.
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
}, { timestamps: true });

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ receiver: 1, isRead: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
