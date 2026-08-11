import express from 'express';
import {
  register, login, logout, refreshToken, verifyOTP, getMe, updateProfile, changePassword, googleAuth,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
