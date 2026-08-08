import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const merchantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  businessName: { type: String, required: true },
  businessType: {
    type: String,
    enum: ['restaurant', 'bakery', 'hotel', 'supermarket', 'cafe', 'food_vendor', 'other'],
    required: true,
  },
  logo: { type: String, default: '' },
  images: [{ type: String }],
  description: { type: String },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalFoodSaved: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
    bankName: String,
  },
  documents: {
    fssai: String,
    gst: String,
    pan: String,
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  refreshToken: { type: String },
  fcmToken: { type: String },
}, { timestamps: true });

merchantSchema.index({ location: '2dsphere' });

merchantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

merchantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

merchantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model('Merchant', merchantSchema);
