import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalFoodSaved: { type: Number, default: 0 }, // in kg
  totalMealsServed: { type: Number, default: 0 },
  totalDonations: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  totalMerchants: { type: Number, default: 0 },
  carbonEmissionsReduced: { type: Number, default: 0 }, // in kg CO2
  moneySaved: { type: Number, default: 0 },
  categoryBreakdown: { type: mongoose.Schema.Types.Mixed },
  topMerchants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' }],
  newUsersToday: { type: Number, default: 0 },
  newMerchantsToday: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Analytics', analyticsSchema);
