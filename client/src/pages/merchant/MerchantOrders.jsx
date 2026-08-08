import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { fetchMerchantOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_ACTIONS = {
  pending: [{ label: 'Accept', next: 'confirmed', color: 'btn-primary' }, { label: 'Reject', next: 'cancelled', color: 'btn-danger' }],
  confirmed: [{ label: 'Mark Preparing', next: 'preparing', color: 'btn-primary' }],
  preparing: [{ label: 'Ready for Pickup', next: 'ready_for_pickup', color: 'btn-primary' }],
  ready_for_pickup: [{ label: 'Mark Delivered', next: 'delivered', color: 'btn-primary' }],
};

export default function MerchantOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchMerchantOrders({})); }, [dispatch]);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleStatusUpdate = async (orderId, status, note) => {
    const result = await dispatch(updateOrderStatus({ id: orderId, status, note }));
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order ${status.replace('_', ' ')}`);
    } else {
      toast.error('Failed to update order');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Orders Management 📦</h1>
        <div className="flex gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-orange-400 rounded-full" /> Pending: {orders.filter((o) => o.status === 'pending').length}</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-primary-500 rounded-full" /> Active: {orders.filter((o) => ['confirmed', 'preparing', 'ready_for_pickup'].includes(o.status)).length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'pending', label: '🔔 Pending' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready_for_pickup', label: 'Ready' },
          { key: 'delivered', label: '✅ Delivered' },
          { key: 'cancelled', label: '❌ Cancelled' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filter === key ? 'bg-primary-500 text-white border-primary-500 shadow-glow-green' : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-24 shimmer" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <p className="text-slate-500 dark:text-slate-400">No {filter !== 'all' ? filter : ''} orders</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <motion.div key={order._id} whileHover={{ x: 2 }} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-bold text-slate-900 dark:text-white">#{order.orderNumber}</p>
                    <span className={`badge text-xs ${
                      order.status === 'pending' ? 'badge-orange' :
                      order.status === 'delivered' ? 'badge-green' :
                      order.status === 'cancelled' ? 'badge-red' : 'badge-blue'
                    }`}>{order.status?.replace('_', ' ')}</span>
                    <span className={`badge text-xs ${order.paymentStatus === 'paid' ? 'badge-green' : 'badge-orange'}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>👤 {order.user?.name}</span>
                    <span>📞 {order.user?.phone}</span>
                    <span>🛒 {order.items?.length} items</span>
                    <span>💰 ₹{order.totalAmount}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {STATUS_ACTIONS[order.status]?.map(({ label, next, color }) => (
                    <button
                      key={next}
                      onClick={() => handleStatusUpdate(order._id, next)}
                      className={`btn btn-sm ${color}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-dark-700">
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-dark-800 rounded-lg px-3 py-1.5 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-slate-400">×{item.quantity}</span>
                      <span className="text-primary-600 dark:text-primary-400 font-bold">₹{item.discountedPrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
