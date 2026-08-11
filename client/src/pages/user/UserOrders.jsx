import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, XCircle, MapPin, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../../redux/slices/orderSlice';
import { reviewService, orderService } from '../../services';
import toast from 'react-hot-toast';
import { format, differenceInSeconds } from 'date-fns';

const OrderTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const diff = differenceInSeconds(new Date(expiresAt), new Date());
      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        return;
      }
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft) return null;
  const isExpiringSoon = timeLeft !== 'Expired' && differenceInSeconds(new Date(expiresAt), new Date()) < 15 * 60;
  
  return (
    <div className={`text-xs font-semibold flex items-center gap-1 mt-1 ${timeLeft === 'Expired' ? 'text-red-500' : isExpiringSoon ? 'text-orange-500' : 'text-slate-500'}`}>
      <Clock className="w-3 h-3" />
      {timeLeft === 'Expired' ? 'Token Expired' : `Expires in: ${timeLeft}`}
    </div>
  );
};

const statusConfig = {
  pending: { color: 'badge-orange', label: 'Pending', icon: Clock },
  confirmed: { color: 'badge-blue', label: 'Confirmed', icon: CheckCircle },
  preparing: { color: 'badge-blue', label: 'Preparing', icon: Clock },
  ready_for_pickup: { color: 'badge-green', label: 'Ready for Pickup', icon: CheckCircle },
  delivered: { color: 'badge-green', label: 'Picked Up', icon: CheckCircle },
  cancelled: { color: 'badge-red', label: 'Cancelled', icon: XCircle },
};

export default function UserOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { dispatch(fetchUserOrders({ limit: 20 })); }, [dispatch]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancel(orderId, { reason: 'User cancelled via app' });
      toast.success('Order cancelled successfully');
      dispatch(fetchUserOrders({ limit: 20 }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleConfirmPickup = async (order) => {
    try {
      await orderService.updateStatus(order._id, { status: 'delivered', note: 'Customer confirmed pickup' });
      toast.success("You've picked up your order, thanks for purchasing!");
      dispatch(fetchUserOrders({ limit: 20 }));
      handleOpenReview(order);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm pickup');
    }
  };

  const handleOpenReview = (order) => {
    setSelectedOrder(order);
    setRating(5);
    setComment('');
    setImage(null);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;
    try {
      setSubmittingReview(true);
      const formData = new FormData();
      formData.append('merchantId', selectedOrder.merchant._id);
      formData.append('orderId', selectedOrder._id);
      formData.append('rating', rating);
      formData.append('comment', comment);
      if (image) formData.append('image', image);

      await reviewService.create(formData);
      toast.success('Review submitted successfully!');
      setReviewModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Orders 📦</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card p-4 h-24 shimmer" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Start exploring amazing food deals near you!</p>
          <Link to="/food" className="btn-primary">Browse Food Deals</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg = statusConfig[order.status] || statusConfig.pending;
            return (
              <motion.div key={order._id} whileHover={{ x: 2 }} className="card p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">#{order.orderNumber}</p>
                      <p className="text-xs text-slate-400">{order.merchant?.businessName} • {order.items?.length} items</p>
                      <p className="text-xs text-slate-400 mt-0.5">{format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                      {['pending', 'confirmed', 'preparing', 'ready_for_pickup'].includes(order.status) && order.expiresAt && (
                        <OrderTimer expiresAt={order.expiresAt} />
                      )}
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                    <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount}</p>
                    <Link to={`/food`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
                    {['pending', 'confirmed'].includes(order.status) && (
                      <button onClick={() => handleCancelOrder(order._id)} className="mt-2 text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Cancel Order
                      </button>
                    )}
                    {['ready_for_pickup'].includes(order.status) && (
                      <button onClick={() => handleConfirmPickup(order)} className="mt-2 text-xs font-semibold text-green-500 hover:text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Confirm Pickup
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button onClick={() => handleOpenReview(order)} className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Leave Review
                      </button>
                    )}
                  </div>
                </div>
                {/* Status Timeline */}
                {order.statusHistory?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-700">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered'].map((s, i, arr) => {
                        const reached = arr.indexOf(order.status) >= i;
                        return (
                          <div key={s} className="flex items-center gap-1 flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${reached ? 'bg-primary-500' : 'bg-slate-200 dark:bg-dark-700'}`} />
                            <span className={`text-[10px] ${reached ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'} font-medium`}>
                              {s === 'delivered' ? 'picked up' : s.replace(/_/g, ' ')}
                            </span>
                            {i < arr.length - 1 && <div className={`w-6 h-px ${reached ? 'bg-primary-300' : 'bg-slate-200 dark:bg-dark-700'}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6">
                <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">Leave a Review</h3>
                <p className="text-sm text-slate-500 mb-6">How was your experience with {selectedOrder?.merchant?.businessName}?</p>
                
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                      <Star className={`w-10 h-10 ${star <= rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200 dark:text-dark-700'}`} />
                    </button>
                  ))}
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Comment</label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share details of your own experience at this place"
                      className="input resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Add a Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files[0])}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setReviewModalOpen(false)} className="btn-ghost flex-1">Cancel</button>
                  <button onClick={handleSubmitReview} disabled={submittingReview} className="btn-primary flex-1">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
