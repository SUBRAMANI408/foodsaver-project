import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Merchant from '../models/Merchant.js';
import HelpingCenter from '../models/HelpingCenter.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    let user;
    switch (decoded.role) {
      case 'user':
        user = await User.findById(decoded.id);
        break;
      case 'merchant':
        user = await Merchant.findById(decoded.id);
        break;

      case 'helping_center':
        user = await HelpingCenter.findById(decoded.id);
        break;
      case 'admin':
        user = await User.findById(decoded.id);
        break;
      default:
        return res.status(401).json({ success: false, message: 'Invalid role' });
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ success: false, message: `Role ${req.userRole} is not authorized` });
    }
    next();
  };
};
