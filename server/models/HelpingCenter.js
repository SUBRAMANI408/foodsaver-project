import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const helpingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  centerName: { type: String, required: true },
  centerType: {
    type: String,
    enum: ['ngo', 'orphanage', 'old_age_home', 'food_bank', 'shelter', 'other'],
    required: true,
  },
  logo: { type: String, default: '' },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  capacity: { type: Number, default: 100 },
  totalDonationsReceived: { type: Number, default: 0 },
  totalMealsServed: { type: Number, default: 0 },
  registrationNumber: { type: String },
  otp: String,
  otpExpiry: Date,
  refreshToken: String,
  fcmToken: String,
}, { timestamps: true });

helpingCenterSchema.index({ location: '2dsphere' });

helpingCenterSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

helpingCenterSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

helpingCenterSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.refreshToken;
  return obj;
};

export default mongoose.model('HelpingCenter', helpingCenterSchema);
