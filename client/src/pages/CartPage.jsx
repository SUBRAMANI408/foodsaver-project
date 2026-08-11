import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Leaf, Tag } from 'lucide-react';
import { removeFromCart, updateCartQuantity, clearCart } from '../redux/slices/orderSlice';
import toast from 'react-hot-toast';

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((s) => s.orders.cart);

  const subtotal = cart.reduce((acc, item) => acc + item.discountedPrice * item.cartQuantity, 0);
  const originalTotal = cart.reduce((acc, item) => acc + item.originalPrice * item.cartQuantity, 0);
  const totalSavings = originalTotal - subtotal;

  const handleQuantityChange = (id, qty) => {
    if (qty < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity: qty }));
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // Group by merchant check
    const merchants = [...new Set(cart.map((i) => i.merchant?._id || i.merchant))];
    if (merchants.length > 1) {
      toast.error('Please order from one merchant at a time');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-dark-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Add some amazing discounted food items to get started!</p>
        <Link to="/food" className="btn-primary btn-lg">
          <Leaf className="w-5 h-5" /> Browse Food Deals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          Your Cart 🛒 <span className="text-slate-400 text-lg">({cart.length} items)</span>
        </h1>
        <button onClick={() => dispatch(clearCart())} className="btn-ghost btn-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="card p-4 flex gap-4"
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-dark-700 overflow-hidden flex-shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍛</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{item.merchant?.businessName || 'Merchant'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary-600 dark:text-primary-400">₹{item.discountedPrice?.toFixed(0)}</span>
                    <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>
                    <span className="badge-green text-xs">{item.discountPercentage}% off</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-700 rounded-xl p-1">
                    <button onClick={() => handleQuantityChange(item._id, item.cartQuantity - 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-dark-600 flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm text-slate-900 dark:text-white">{item.cartQuantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.cartQuantity + 1)}
                      disabled={item.cartQuantity >= item.availableQuantity}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-dark-600 flex items-center justify-center shadow-sm hover:bg-primary-50 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(item.discountedPrice * item.cartQuantity).toFixed(0)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Order Summary</h3>

            {/* Savings Banner */}
            <div className="bg-primary-50 dark:bg-primary-950/50 rounded-xl p-3 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">You're saving ₹{totalSavings.toFixed(0)}!</p>
                <p className="text-xs text-primary-500">On this order</p>
              </div>
            </div>

            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{originalTotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-primary-600 dark:text-primary-400 font-medium">
                <span>Discount</span>
                <span>- ₹{totalSavings.toFixed(0)}</span>
              </div>

              <div className="divider" />
              <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary w-full btn-lg">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-center text-slate-400 mt-3">
              🔒 Secured by Razorpay · 256-bit SSL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
