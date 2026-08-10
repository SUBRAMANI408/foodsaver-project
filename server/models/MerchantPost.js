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
  totalQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  finalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  availableUntil: {
    type: Date,
    required: true
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
