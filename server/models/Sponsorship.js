import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'meals' }, // meals, kg, packets, etc.
  description: { type: String, default: '' },
}, { _id: true });

const sponsorshipSchema = new mongoose.Schema({
  requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequirement', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  quantityOffered: { type: Number, required: true, min: 1 },
  foodItems: [foodItemSchema], // Multiple food items support
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  rejectedAt: { type: Date },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
  chatEnabled: { type: Boolean, default: false },
  conversationId: { type: String, default: '' }, // format: req_{requirementId}_{ngoId}_{merchantId}
}, { timestamps: true });

sponsorshipSchema.index({ requirement: 1, merchant: 1 }, { unique: true });
sponsorshipSchema.index({ merchant: 1, status: 1 });

export default mongoose.model('Sponsorship', sponsorshipSchema);
