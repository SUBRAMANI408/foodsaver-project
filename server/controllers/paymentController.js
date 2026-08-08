import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder',
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order._id.toString() },
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.userId,
      merchant: order.merchant,
      amount: order.totalAmount,
      method: order.paymentMethod,
      gateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const payment = await Payment.findByIdAndUpdate(paymentId, {
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      status: 'completed',
      merchantPayout: 0, // Calculate after platform fee
      platformFee: 0,
    }, { new: true });

    // Update order payment status
    await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'paid' });

    res.json({ success: true, message: 'Payment verified', data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history (user)
// @route   GET /api/payments/my
export const getUserPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .populate('order', 'orderNumber totalAmount status')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
export const getAllPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
