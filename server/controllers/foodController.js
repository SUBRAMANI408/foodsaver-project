import FoodItem from '../models/FoodItem.js';
import Merchant from '../models/Merchant.js';
import { uploadToCloudinary } from '../middleware/upload.js';

// @desc    Get all food items (with filters)
// @route   GET /api/food
export const getFoodItems = async (req, res, next) => {
  try {
    const {
      category, status, minPrice, maxPrice, minDiscount,
      lat, lng, radius = 10, search, sort = '-createdAt', page = 1, limit = 20
    } = req.query;

    const query = { status: { $in: ['available', 'expiring_soon'] } };

    if (status && status !== 'all') query.status = status;
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.discountedPrice = {};
      if (minPrice) query.discountedPrice.$gte = Number(minPrice);
      if (maxPrice) query.discountedPrice.$lte = Number(maxPrice);
    }
    if (minDiscount) query.discountPercentage = { $gte: Number(minDiscount) };
    if (search) query.$text = { $search: search };

    // Geo-based merchant filter
    let merchantIds;
    if (lat && lng) {
      const nearbyMerchants = await Merchant.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
        isActive: true,
        isVerified: true,
      }).select('_id');
      merchantIds = nearbyMerchants.map((m) => m._id);
      query.merchant = { $in: merchantIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await FoodItem.countDocuments(query);
    const items = await FoodItem.find(query)
      .populate('merchant', 'businessName logo address rating location isOpen')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food item
// @route   GET /api/food/:id
export const getFoodItem = async (req, res, next) => {
  try {
    const item = await FoodItem.findById(req.params.id).populate('merchant', 'businessName logo address rating location phone isOpen openingTime closingTime');
    if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create food item (merchant only)
// @route   POST /api/food
export const createFoodItem = async (req, res, next) => {
  try {
    const { name, description, category, originalPrice, discountPercentage, quantity, unit, expiryTime, isVeg, allergens, isDynamicPricing } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'savebite/food');
        images.push(url);
      }
    }

    const foodItem = await FoodItem.create({
      merchant: req.userId,
      name, description, category, originalPrice: parseFloat(originalPrice),
      discountPercentage: parseFloat(discountPercentage),
      quantity: parseInt(quantity),
      unit, expiryTime, isVeg: isVeg === 'true',
      allergens: allergens ? JSON.parse(allergens) : [],
      isDynamicPricing: isDynamicPricing === 'true',
      images,
    });

    // Update merchant stats
    await Merchant.findByIdAndUpdate(req.userId, { $inc: { totalFoodSaved: parseInt(quantity) } });

    req.io?.emit('food:new', foodItem);

    res.status(201).json({ success: true, message: 'Food item created', data: foodItem });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item
// @route   PUT /api/food/:id
export const updateFoodItem = async (req, res, next) => {
  try {
    const item = await FoodItem.findOne({ _id: req.params.id, merchant: req.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });

    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'savebite/food');
        newImages.push(url);
      }
      updates.images = [...item.images, ...newImages];
    }

    const updated = await FoodItem.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, message: 'Food item updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item
// @route   DELETE /api/food/:id
export const deleteFoodItem = async (req, res, next) => {
  try {
    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, merchant: req.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Food item not found' });
    res.json({ success: true, message: 'Food item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merchant's own food items
// @route   GET /api/food/merchant/my
export const getMerchantFoodItems = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { merchant: req.userId };
    if (status) query.status = status;

    const total = await FoodItem.countDocuments(query);
    const items = await FoodItem.find(query)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: items, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Donate unsold food
// @route   POST /api/food/:id/donate
export const donateFoodItem = async (req, res, next) => {
  try {
    const { helpingCenterId } = req.body;
    const item = await FoodItem.findOne({ _id: req.params.id, merchant: req.userId, status: { $in: ['available', 'expiring_soon', 'expired'] } });
    if (!item) return res.status(404).json({ success: false, message: 'Food item not found or not eligible for donation' });

    item.status = 'donated';
    item.donatedTo = helpingCenterId;
    item.donatedAt = new Date();
    await item.save();

    await Merchant.findByIdAndUpdate(req.userId, { $inc: { totalDonations: 1 } });

    res.json({ success: true, message: 'Food donated successfully', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending food items
// @route   GET /api/food/trending
export const getTrendingFood = async (req, res, next) => {
  try {
    const items = await FoodItem.find({ status: { $in: ['available', 'expiring_soon'] } })
      .sort('-totalSold -rating')
      .limit(10)
      .populate('merchant', 'businessName logo rating');
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
