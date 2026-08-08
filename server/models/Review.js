import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
  isReported: { type: Boolean, default: false },
  reportReason: { type: String },
  merchantResponse: { type: String },
  merchantResponseAt: { type: Date },
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
