import mongoose from 'mongoose';

const merchantPostSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true
  },
  foodDetails: {
    type: String,
    required: true,
    trim: true
  },
  postType: {
    type: String,
    enum: ['excess_food', 'food_requirement', 'general'],
    default: 'general'
  },
  scope: {
    type: String,
    enum: ['public', 'nearby', 'selected'],
    default: 'public'
  },
  targetMerchants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant'
  }],
  totalQuantity: {
    type: Number,
    min: 1
  },
  availableQuantity: {
    type: Number,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    min: 0
  },
  availableUntil: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'unavailable'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Middleware to automatically mark as unavailable if quantity is 0
merchantPostSchema.pre('save', function(next) {
  if (this.availableQuantity <= 0) {
    this.status = 'unavailable';
  }
  next();
});

const MerchantPost = mongoose.model('MerchantPost', merchantPostSchema);
export default MerchantPost;
