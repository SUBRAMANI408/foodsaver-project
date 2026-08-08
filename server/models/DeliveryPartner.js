import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  vehicleType: { type: String, enum: ['bicycle', 'motorcycle', 'car', 'van'], required: true },
  vehicleNumber: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: false },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  otp: String,
  otpExpiry: Date,
  refreshToken: String,
  fcmToken: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
  },
}, { timestamps: true });

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

deliveryPartnerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

deliveryPartnerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

deliveryPartnerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
