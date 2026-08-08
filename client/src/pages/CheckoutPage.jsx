import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, Banknote, Wallet, MapPin, ArrowLeft, Check, Lock } from 'lucide-react';
import { createOrder } from '../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'Pay via any UPI app' },
  { id: 'credit_card', label: 'Credit Card', icon: '💳', desc: 'Visa, Mastercard, Amex' },
  { id: 'debit_card', label: 'Debit Card', icon: '🏦', desc: 'All major banks' },
  { id: 'net_banking', label: 'Net Banking', icon: '🏧', desc: 'All major banks' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵', desc: 'Pay at pickup/delivery' },
];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.orders.cart);
  const { loading } = useSelector((s) => s.orders);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice * item.cartQuantity, 0);
  const originalTotal = cart.reduce((acc, item) => acc + item.originalPrice * item.cartQuantity, 0);
  const savings = originalTotal - subtotal;
  const deliveryFee = deliveryType === 'delivery' ? 30 : 0;
  const total = subtotal + deliveryFee;

  const merchantId = cart[0]?.merchant?._id || cart[0]?.merchant;

  const handlePlaceOrder = async () => {
    if (!merchantId) { toast.error('Invalid cart items'); return; }

    const orderData = {
      items: cart.map((item) => ({ foodItemId: item._id, quantity: item.cartQuantity })),
      paymentMethod,
      deliveryType,
      specialInstructions,
    };

    const result = await dispatch(createOrder(orderData));
    if (createOrder.fulfilled.match(result)) {
      toast.success('Order placed successfully! 🎉');
      // If online payment, initiate Razorpay
      if (paymentMethod !== 'cash_on_delivery') {
        navigate(`/dashboard/orders`);
      } else {
        navigate('/dashboard/orders');
      }
    } else {
      toast.error(result.payload || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-500 hover:text-primary-600 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-8">Checkout 🛒</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Type */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Delivery Option</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'pickup', label: 'Self Pickup', desc: 'Pick up from store', icon: '🏪' },
                { id: 'delivery', label: 'Home Delivery', desc: '+₹30 delivery charge', icon: '🚚' },
              ].map(({ id, label, desc, icon }) => (
                <button
                  key={id}
                  onClick={() => setDeliveryType(id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${deliveryType === id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-slate-200 dark:border-dark-600'}`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Payment Method</h3>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ id, label, icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all duration-200 ${paymentMethod === id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50' : 'border-slate-200 dark:border-dark-600 hover:border-slate-300'}`}
                >
                  <span className="text-2xl">{icon}</span>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</div>
                    <div className="text-xs text-slate-400">{desc}</div>
                  </div>
                  {paymentMethod === id && <Check className="w-5 h-5 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Special Instructions (optional)</h3>
            <textarea
              rows={3}
              placeholder="Any special requests or notes for the merchant..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className="input resize-none"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Order Summary</h3>

            {/* Items */}
            <div className="space-y-2.5 mb-4 max-h-40 overflow-y-auto scrollbar-hide">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded text-xs font-bold flex items-center justify-center">{item.cartQuantity}</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">₹{(item.discountedPrice * item.cartQuantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span><span>₹{originalTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-primary-600 dark:text-primary-400">
                <span>Discount</span><span>-₹{savings.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                <span>Total</span><span>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full btn-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Lock className="w-4 h-4" /> Place Order · ₹{total.toFixed(0)}</>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-400 mt-3">
              🔒 Secured by Razorpay · All transactions encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
