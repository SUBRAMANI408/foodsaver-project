import mongoose from 'mongoose';

const foodRequirementSchema = new mongoose.Schema({
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'HelpingCenter', required: true },
  ngoName: { type: String, required: true },
  ngoType: { type: String, required: true },
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String },
  addressText: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  peopleCount: { type: Number, required: true, min: 1 },
  quantityRequired: { type: Number, required: true, min: 1 }, // in meals/units
  quantityFulfilled: { type: Number, default: 0 },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Any Food'],
    required: true,
  },
  foodCategory: {
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Any Suitable Food', 'Both (Veg & Non-Veg)'],
    default: 'Any Suitable Food',
  },
  vegQuantity: { type: Number, default: 0 },
  nonVegQuantity: { type: Number, default: 0 },
  specificFood: { type: String, default: '' }, // Optional: e.g. "Idli, Sambar"
  requiredDate: { type: Date, required: true },
  requiredTime: { type: String, required: true }, // e.g. "12:30 PM"
  availableUntil: { type: String, required: true }, // e.g. "2:00 PM"
  additionalRequirements: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
    default: 'open',
  },
  notifiedMerchants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' }],
}, { timestamps: true });

foodRequirementSchema.index({ location: '2dsphere' });
foodRequirementSchema.index({ status: 1, requiredDate: 1 });

export default mongoose.model('FoodRequirement', foodRequirementSchema);
