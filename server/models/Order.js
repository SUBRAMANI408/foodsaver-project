import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true },
    image: { type: String },
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'debit_card', 'credit_card', 'net_banking', 'cash_on_delivery', 'wallet'],
    required: true,
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
  deliveryAddress: {
    address: String,
    coordinates: [Number],
  },
  merchantAddress: {
    address: String,
    coordinates: [Number],
  },
  distance: { type: Number }, // in km
  estimatedPickupTime: { type: Date },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  cancellationReason: { type: String },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  rating: { type: Number },
  review: { type: String },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `SB${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
