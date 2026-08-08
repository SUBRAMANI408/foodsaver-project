import mongoose from 'mongoose';

const sponsorshipSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequirement', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  quantityOffered: { type: Number, required: true, min: 1 },
  notes: { type: String, default: '' }, // e.g. "I can provide Veg Biryani"
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

sponsorshipSchema.index({ requirement: 1, merchant: 1 }, { unique: true });
sponsorshipSchema.index({ merchant: 1, status: 1 });

export default mongoose.model('Sponsorship', sponsorshipSchema);
