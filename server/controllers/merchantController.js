import Merchant from '../models/Merchant.js';
import { uploadToCloudinary } from '../middleware/upload.js';

// @desc    Get nearby merchants
// @route   GET /api/merchants/nearby
export const getNearbyMerchants = async (req, res, next) => {
  try {
    const { lat, lng, radius = 10, businessType, page = 1, limit = 20 } = req.query;
    const query = { isActive: true, isVerified: true };
    if (businessType) query.businessType = businessType;

    let merchants;
    if (lat && lng) {
      merchants = await Merchant.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
      }).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    } else {
      merchants = await Merchant.find(query).sort('-rating').skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    }

    res.json({ success: true, data: merchants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merchant profile
// @route   GET /api/merchants/:id
export const getMerchantProfile = async (req, res, next) => {
  try {
    const merchant = await Merchant.findById(req.params.id).select('-password -refreshToken -otp -otpExpiry -bankDetails');
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
    res.json({ success: true, data: merchant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update merchant profile (self)
// @route   PUT /api/merchants/profile
export const updateMerchantProfile = async (req, res, next) => {
  try {
    const { password, email, ...updates } = req.body;
    if (req.file) {
      updates.logo = await uploadToCloudinary(req.file.path, 'savebite/merchants');
    }
    const merchant = await Merchant.findByIdAndUpdate(req.userId, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', data: merchant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merchant dashboard stats
// @route   GET /api/merchants/dashboard
export const getMerchantDashboard = async (req, res, next) => {
  try {
    const merchant = await Merchant.findById(req.userId);
    const Order = (await import('../models/Order.js')).default;
    const FoodItem = (await import('../models/FoodItem.js')).default;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, pendingOrders, activeFoodItems, todayRevenue] = await Promise.all([
      Order.countDocuments({ merchant: req.userId, createdAt: { $gte: today } }),
      Order.countDocuments({ merchant: req.userId, status: 'pending' }),
      FoodItem.countDocuments({ merchant: req.userId, status: { $in: ['available', 'expiring_soon'] } }),
      Order.aggregate([
        { $match: { merchant: req.userId, createdAt: { $gte: today }, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        ...merchant.toJSON(),
        todayOrders,
        pendingOrders,
        activeFoodItems,
        todayRevenue: todayRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
