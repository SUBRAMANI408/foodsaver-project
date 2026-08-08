import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, XCircle, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '../../redux/slices/orderSlice';
import { format } from 'date-fns';

const statusConfig = {
  pending: { color: 'badge-orange', label: 'Pending', icon: Clock },
  confirmed: { color: 'badge-blue', label: 'Confirmed', icon: CheckCircle },
  preparing: { color: 'badge-blue', label: 'Preparing', icon: Clock },
  ready_for_pickup: { color: 'badge-green', label: 'Ready for Pickup', icon: CheckCircle },
  out_for_delivery: { color: 'badge-blue', label: 'Out for Delivery', icon: MapPin },
  delivered: { color: 'badge-green', label: 'Delivered', icon: CheckCircle },
  cancelled: { color: 'badge-red', label: 'Cancelled', icon: XCircle },
};

export default function UserOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchUserOrders({ limit: 20 })); }, [dispatch]);

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
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className={`badge text-xs ${cfg.color}`}>{cfg.label}</span>
                    <p className="font-bold text-slate-900 dark:text-white">₹{order.totalAmount}</p>
                    <Link to={`/food`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </Link>
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
                              {s.replace(/_/g, ' ')}
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
    </div>
  );
}
