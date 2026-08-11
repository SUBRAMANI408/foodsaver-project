import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import HelpingCenter from '../models/HelpingCenter.js';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Payment from '../models/Payment.js';
import Analytics from '../models/Analytics.js';

// @desc    Get dashboard stats (admin)
// @route   GET /api/admin/stats
export const getAdminStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalMerchants, totalCenters,
      totalOrders, totalRevenue, todayOrders, activeUsers, pendingMerchants
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Merchant.countDocuments(),
      HelpingCenter.countDocuments(),
      Order.countDocuments(),
      Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Order.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ isActive: true, role: 'user' }),
      Merchant.countDocuments({ isVerified: false }),
    ]);

    // Food saved stats
    const foodSaved = await FoodItem.aggregate([
      { $match: { status: { $in: ['sold', 'donated'] } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalMerchants,
        totalCenters,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        todayOrders,
        activeUsers,
        pendingMerchants,
        totalFoodSaved: foodSaved[0]?.total || 0,
        carbonEmissionsReduced: (foodSaved[0]?.total || 0) * 2.5, // 2.5 kg CO2 per kg food
        moneySaved: totalRevenue[0]?.total * 0.3 || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;
    const query = { role: 'user' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query).sort('-createdAt').skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all merchants
// @route   GET /api/admin/merchants
export const getAllMerchants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isVerified } = req.query;
    const query = {};
    if (search) query.$or = [{ businessName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const total = await Merchant.countDocuments(query);
    const merchants = await Merchant.find(query).sort('-createdAt').skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
    res.json({ success: true, data: merchants, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify merchant
// @route   PUT /api/admin/merchants/:id/verify
export const verifyMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
    res.json({ success: true, message: 'Merchant verified', data: merchant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '7days' } = req.query;
    const days = period === '30days' ? 30 : period === '90days' ? 90 : 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const ordersByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categoryBreakdown = await FoodItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalSold: { $sum: '$totalSold' } } },
    ]);

    res.json({ success: true, data: { ordersByDay, categoryBreakdown } });
  } catch (error) {
    next(error);
  }
};
