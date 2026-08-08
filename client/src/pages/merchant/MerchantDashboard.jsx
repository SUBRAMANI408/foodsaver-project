import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Package, TrendingUp, DollarSign, ShoppingBag, Clock, Leaf,
  Users, Star, Plus, Eye, CheckCircle, XCircle, AlertCircle, Gift,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMerchantFood } from '../../redux/slices/foodSlice';
import { fetchMerchantOrders } from '../../redux/slices/orderSlice';

const StatCard = ({ icon: Icon, label, value, color, bg, change }) => (
  <motion.div whileHover={{ y: -2 }} className="stat-card">
    <div className={`stat-icon ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{value}</p>
      {change && <p className="text-xs text-primary-500 font-medium mt-0.5">{change}</p>}
    </div>
  </motion.div>
);

const statusConfig = {
  pending: { color: 'badge-orange', icon: Clock, label: 'Pending' },
  confirmed: { color: 'badge-blue', icon: CheckCircle, label: 'Confirmed' },
  preparing: { color: 'badge-blue', icon: AlertCircle, label: 'Preparing' },
  ready_for_pickup: { color: 'badge-green', icon: CheckCircle, label: 'Ready' },
  delivered: { color: 'badge-green', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'badge-red', icon: XCircle, label: 'Cancelled' },
};

export default function MerchantDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { merchantItems, loading: foodLoading } = useSelector((s) => s.food);
  const { orders } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMerchantFood({ limit: 6 }));
    dispatch(fetchMerchantOrders({ limit: 10 }));
  }, [dispatch]);

  const stats = [
    { icon: ShoppingBag, label: "Today's Orders", value: user?.totalOrders || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', change: '+5 new' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${(user?.totalRevenue || 0).toLocaleString()}`, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50', change: '+₹2400 today' },
    { icon: Leaf, label: 'Food Saved', value: `${user?.totalFoodSaved || 0} kg`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { icon: Gift, label: 'Donations', value: user?.totalDonations || 0, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/50', change: 'Items donated' },
  ];

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeFood = merchantItems.filter((f) => ['available', 'expiring_soon'].includes(f.status));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {user?.businessName || 'My Restaurant'} 🍽️
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your food listings and orders</p>
        </div>
        <Link to="/merchant/food/add" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Food Item
        </Link>
      </div>

      {/* Store Status */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${user?.isOpen ? 'bg-primary-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Store Status</p>
            <p className="text-xs text-slate-400">{user?.isOpen ? 'Accepting orders' : 'Closed'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white">{user?.rating || '0.0'}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> Rating</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white">{pendingOrders.length}</p>
            <p className="text-xs text-slate-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white">{activeFood.length}</p>
            <p className="text-xs text-slate-400">Active Items</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              🔔 Pending Orders ({pendingOrders.length})
            </h3>
            <Link to="/merchant/orders" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">View all</Link>
          </div>
          {pendingOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No pending orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.slice(0, 4).map((order) => (
                <motion.div key={order._id} whileHover={{ x: 2 }} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-800">
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">{order.user?.name} • ₹{order.totalAmount}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/merchant/orders/${order._id}`} className="btn-sm btn bg-primary-500 text-white text-xs">Accept</Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Food Items */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">🍽️ Active Items ({activeFood.length})</h3>
            <Link to="/merchant/food" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">Manage</Link>
          </div>
          {activeFood.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active food items</p>
              <Link to="/merchant/food/add" className="btn-primary btn-sm mt-3">Add Item</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeFood.slice(0, 4).map((food) => (
                <motion.div key={food._id} whileHover={{ x: 2 }} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-800">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-dark-700 overflow-hidden flex-shrink-0">
                    {food.images?.[0] ? (
                      <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🍛</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{food.name}</p>
                    <p className="text-xs text-slate-400">Qty: {food.availableQuantity} • ₹{food.discountedPrice}</p>
                  </div>
                  <span className={`badge text-xs ${food.status === 'expiring_soon' ? 'badge-orange' : 'badge-green'}`}>
                    {food.status === 'expiring_soon' ? '⏰ Expiring' : '✅ Available'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">📊 Revenue Overview</h3>
          <Link to="/merchant/analytics" className="btn-ghost btn-sm">View Analytics</Link>
        </div>
        <div className="flex items-end gap-2 h-32">
          {[30, 55, 40, 80, 65, 90, 75].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex-1 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ maxHeight: '100%' }}
              title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d} className="flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
