import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag, Leaf, DollarSign, TrendingUp, Search, Clock,
  ArrowRight, Star, MapPin, Percent, Heart, Zap, Bell,
} from 'lucide-react';
import { fetchFoodItems, fetchTrending } from '../../redux/slices/foodSlice';
import { fetchUserOrders } from '../../redux/slices/orderSlice';
import FoodCard from '../../components/FoodCard';

const StatCard = ({ icon: Icon, label, value, change, color, bg }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className="stat-card"
  >
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

export default function UserDashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items, trending, loading } = useSelector((s) => s.food);
  const { orders } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchFoodItems({ limit: 8 }));
    dispatch(fetchTrending());
    dispatch(fetchUserOrders({ limit: 5 }));
  }, [dispatch]);

  const stats = [
    { icon: ShoppingBag, label: 'Total Orders', value: user?.totalOrdersPlaced || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', change: '+2 this week' },
    { icon: DollarSign, label: 'Money Saved', value: `₹${user?.totalAmountSaved || 0}`, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50', change: '₹245 this month' },
    { icon: Leaf, label: 'Food Saved', value: `${user?.totalFoodSaved || 0} kg`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50', change: 'CO₂ reduced' },
    { icon: Star, label: 'Loyalty Points', value: user?.loyaltyPoints || 0, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/50', change: 'Redeem for discounts' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Hello, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Find amazing food deals near you</p>
        </div>
        <Link to="/food" className="btn-primary">
          <Search className="w-4 h-4" /> Find Food
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Global Impact Banner */}
      <div className="card-gradient p-6 rounded-2xl bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-primary-500/10 border border-primary-200/30 dark:border-primary-700/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-1">🌍 Community Impact Today</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">SaveBite users have collectively made a difference</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {[
              { label: 'Food Saved', value: '350 kg', icon: Leaf },
              { label: 'Meals Served', value: '10,000', icon: Heart },
              { label: 'Money Saved', value: '₹1.25L', icon: DollarSign },
              { label: 'CO₂ Reduced', value: '350 kg', icon: TrendingUp },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <div className="font-bold text-slate-900 dark:text-white text-sm">{value}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Search Filters */}
      <div className="card p-4">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" /> Quick Filters
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🔥 Expiring Soon', params: '?status=expiring_soon' },
            { label: '🍛 Meals', params: '?category=meals' },
            { label: '🥐 Bakery', params: '?category=bakery' },
            { label: '💰 50%+ Off', params: '?minDiscount=50' },
            { label: '⭐ Top Rated', params: '?sort=-rating' },
            { label: '📍 Nearby', params: '?radius=2' },
          ].map(({ label, params }) => (
            <Link key={label} to={`/food${params}`} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Trending Food */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">🔥 Trending Deals</h2>
          <Link to="/food" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="shimmer h-40 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="shimmer h-4 rounded w-3/4" />
                  <div className="shimmer h-3 rounded w-1/2" />
                  <div className="shimmer h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(trending.length > 0 ? trending : items).slice(0, 4).map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
            {trending.length === 0 && items.length === 0 && (
              <div className="col-span-4 text-center py-12 text-slate-400">
                <Leaf className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No food items available yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <motion.div
                key={order._id}
                whileHover={{ x: 2 }}
                className="card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">#{order.orderNumber}</p>
                    <p className="text-xs text-slate-400">{order.merchant?.businessName || 'Merchant'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">₹{order.totalAmount}</p>
                  <span className={`badge text-xs ${
                    order.status === 'delivered' ? 'badge-green' :
                    order.status === 'cancelled' ? 'badge-red' : 'badge-orange'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
