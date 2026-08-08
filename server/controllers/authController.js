import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import DeliveryPartner from '../models/DeliveryPartner.js';
import HelpingCenter from '../models/HelpingCenter.js';

const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
  return { accessToken, refreshToken };
};

const getModelByRole = (role) => {
  const models = {
    user: User,
    merchant: Merchant,
    delivery_partner: DeliveryPartner,
    helping_center: HelpingCenter,
    admin: User,
  };
  return models[role];
};

// @desc    Register user/merchant/delivery/helping center
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { role = 'user', ...data } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid role' });

    const existing = await Model.findOne({ email: data.email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const entity = await Model.create({ ...data, role: role === 'admin' ? 'admin' : undefined, otp, otpExpiry });
    const { accessToken, refreshToken } = generateTokens(entity._id, role);

    entity.refreshToken = refreshToken;
    await entity.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify OTP.',
      data: entity,
      accessToken,
      refreshToken,
      otp, // In production, send via email/SMS
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password, role = 'user' } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ success: false, message: 'Invalid role' });

    const entity = await Model.findOne({ email });
    if (!entity) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // Ensure the requested login role matches the entity's actual role (prevents admin logging in as user and vice versa)
    if (entity.role && entity.role !== role) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!entity.isActive) return res.status(401).json({ success: false, message: 'Account is deactivated' });

    const isMatch = await entity.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(entity._id, role);
    entity.refreshToken = refreshToken;
    await entity.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: entity,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { token, role } = req.body;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const Model = getModelByRole(role || decoded.role);
    const entity = await Model.findById(decoded.id);

    if (!entity || entity.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(entity._id, decoded.role);
    entity.refreshToken = newRefresh;
    await entity.save();

    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, role = 'user' } = req.body;
    const Model = getModelByRole(role);
    const entity = await Model.findOne({ email });

    if (!entity) return res.status(404).json({ success: false, message: 'User not found' });
    if (entity.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (entity.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });

    entity.isVerified = true;
    entity.otp = undefined;
    entity.otpExpiry = undefined;
    await entity.save();

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user, role: req.userRole });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { password, email, role, ...updateData } = req.body;
    const updated = await req.user.constructor.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const entity = await req.user.constructor.findById(req.userId);
    const isMatch = await entity.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    entity.password = newPassword;
    await entity.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
