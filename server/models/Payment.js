import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String, enum: ['upi', 'debit_card', 'credit_card', 'net_banking', 'cash', 'wallet'], required: true },
  gateway: { type: String, enum: ['razorpay', 'stripe', 'cash'], required: true },
  gatewayOrderId: { type: String },
  gatewayPaymentId: { type: String },
  gatewaySignature: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'], default: 'pending' },
  refundAmount: { type: Number, default: 0 },
  refundReason: { type: String },
  refundedAt: { type: Date },
  merchantPayout: { type: Number },
  platformFee: { type: Number },
  payoutStatus: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
