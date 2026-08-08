import Review from '../models/Review.js';
import Merchant from '../models/Merchant.js';
import Order from '../models/Order.js';
import { uploadToCloudinary } from '../middleware/upload.js';

// @desc    Create review
// @route   POST /api/reviews
export const createReview = async (req, res, next) => {
  try {
    const { merchantId, orderId, foodItemId, rating, comment } = req.body;

    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: req.userId, status: 'delivered' });
    if (!order) return res.status(400).json({ success: false, message: 'Can only review delivered orders' });

    // Check for existing review
    const existing = await Review.findOne({ user: req.userId, order: orderId });
    if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this order' });

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'savebite/reviews');
        images.push(url);
      }
    }

    const review = await Review.create({
      user: req.userId,
      merchant: merchantId,
      order: orderId,
      foodItem: foodItemId,
      rating: parseInt(rating),
      comment,
      images,
    });

    // Recalculate merchant rating
    const reviews = await Review.find({ merchant: merchantId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Merchant.findByIdAndUpdate(merchantId, { rating: avgRating.toFixed(1), totalReviews: reviews.length });

    res.status(201).json({ success: true, message: 'Review submitted', data: review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get merchant reviews
// @route   GET /api/reviews/merchant/:merchantId
export const getMerchantReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating } = req.query;
    const query = { merchant: req.params.merchantId };
    if (rating) query.rating = parseInt(rating);

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: reviews, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Merchant respond to review
// @route   PUT /api/reviews/:id/respond
export const respondToReview = async (req, res, next) => {
  try {
    const { response } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, merchant: req.userId },
      { merchantResponse: response, merchantResponseAt: new Date() },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Response added', data: review });
  } catch (error) {
    next(error);
  }
};
