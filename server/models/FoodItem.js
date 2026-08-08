import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['meals', 'snacks', 'bakery', 'beverages', 'desserts', 'vegetables', 'fruits', 'dairy', 'other'],
    required: true,
  },
  images: [{ type: String }],
  originalPrice: { type: Number, required: true },
  discountPercentage: { type: Number, required: true, min: 0, max: 100 },
  discountedPrice: { type: Number },
  quantity: { type: Number, required: true, min: 1 },
  availableQuantity: { type: Number },
  unit: { type: String, enum: ['kg', 'g', 'pieces', 'portions', 'liters', 'ml'], default: 'pieces' },
  expiryTime: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'reserved', 'processing', 'ready_for_pickup', 'sold', 'expiring_soon', 'expired', 'donated'],
    default: 'available',
  },
  isVeg: { type: Boolean, default: true },
  isGlutenFree: { type: Boolean, default: false },
  allergens: [{ type: String }],
  isDynamicPricing: { type: Boolean, default: false },
  donatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpingCenter' },
  donatedAt: { type: Date },
  totalSold: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate discounted price
foodItemSchema.pre('save', function (next) {
  this.discountedPrice = this.originalPrice - (this.originalPrice * this.discountPercentage / 100);
  if (this.availableQuantity === undefined) {
    this.availableQuantity = this.quantity;
  }
  next();
});

// Auto-update status based on expiry
foodItemSchema.pre('save', function (next) {
  const now = new Date();
  const expiryBuffer = new Date(this.expiryTime.getTime() - 60 * 60 * 1000); // 1 hour before expiry
  if (this.expiryTime < now && this.status === 'available') {
    this.status = 'expired';
  } else if (expiryBuffer < now && this.status === 'available') {
    this.status = 'expiring_soon';
  }
  next();
});

export default mongoose.model('FoodItem', foodItemSchema);
