import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Users, Store, DollarSign, Leaf, ShoppingBag, TrendingUp, Heart,
  Shield, AlertTriangle, CheckCircle, XCircle, Eye, Search, Filter,
  Truck, BarChart3, MessageSquare, Bell,
} from 'lucide-react';
import { adminService } from '../../services';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6'];

const StatCard = ({ icon: Icon, label, value, change, color, bg }) => (
  <motion.div whileHover={{ y: -2 }} className="stat-card">
    <div className={`stat-icon ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white font-display">{value}</p>
      {change && <p className="text-xs text-primary-500 mt-0.5">{change}</p>}
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getAnalytics({ period }),
        ]);
        setStats(statsRes.data.data);
        setAnalytics(analyticsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [period]);

  const statCards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString(), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50', change: `${stats.newUsersToday || 0} new today` },
    { icon: Store, label: 'Merchants', value: stats.totalMerchants?.toLocaleString(), color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-950/50', change: `${stats.pendingMerchants || 0} pending verification` },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders?.toLocaleString(), color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/50', change: `${stats.todayOrders || 0} today` },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50' },
    { icon: Leaf, label: 'Food Saved', value: `${(stats.totalFoodSaved || 0).toLocaleString()} kg`, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { icon: TrendingUp, label: 'CO₂ Reduced', value: `${Math.round(stats.carbonEmissionsReduced || 0)} kg`, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-950/50' },
  ] : [];

  const quickActions = [
    { icon: Users, label: 'Manage Users', to: '/admin/users', color: 'from-blue-500 to-blue-600' },
    { icon: Store, label: 'Verify Merchants', to: '/admin/merchants', color: 'from-accent-500 to-orange-500', badge: stats?.pendingMerchants },
    { icon: CreditCard, label: 'Payments', to: '/admin/payments', color: 'from-primary-500 to-primary-600' },
    { icon: Shield, label: 'Fraud Detection', to: '/admin/fraud', color: 'from-red-500 to-red-600' },
    { icon: MessageSquare, label: 'Complaints', to: '/admin/complaints', color: 'from-purple-500 to-purple-600' },
    { icon: Bell, label: 'Notifications', to: '/notifications', color: 'from-yellow-500 to-yellow-600' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="shimmer w-12 h-12 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <div className="shimmer h-3 w-20 rounded" />
                <div className="shimmer h-5 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard 🛡️</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          {['7days', '30days', '90days'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`btn-sm btn ${period === p ? 'btn-primary' : 'btn-ghost'}`}
            >
              {p === '7days' ? '7D' : p === '30days' ? '30D' : '90D'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Impact Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 rounded-2xl p-6 text-white">
        <h3 className="font-display font-bold text-xl mb-4">🌍 Platform Impact Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: 'Food Saved Today', value: '350 kg', icon: Leaf },
            { label: 'Total Meals Served', value: '10,000', icon: Heart },
            { label: 'Money Saved by Users', value: '₹1.25L', icon: DollarSign },
            { label: 'CO₂ Reduced', value: '350 kg', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="font-display font-bold text-2xl">{value}</div>
              <div className="text-white/70 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Day */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">📊 Orders Over Time</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.ordersByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="orders" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">🍛 Category Breakdown</h3>
            {analytics.categoryBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data available yet</div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity / Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">⚠️ Pending Actions</h3>
          <div className="space-y-3">
            {[
              { type: 'warning', icon: Store, message: `${stats?.pendingMerchants || 0} merchants pending verification`, action: 'Review', to: '/admin/merchants?isVerified=false' },
              { type: 'info', icon: AlertTriangle, message: 'Fraud detection scan due', action: 'Run Scan', to: '/admin/fraud' },
              { type: 'success', icon: CheckCircle, message: 'All payments processed', action: 'View', to: '/admin/payments' },
            ].map(({ type, icon: Icon, message, action, to }) => (
              <div key={message} className={`flex items-center gap-3 p-3 rounded-xl ${
                type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/20' :
                type === 'info' ? 'bg-blue-50 dark:bg-blue-950/20' : 'bg-primary-50 dark:bg-primary-950/20'
              }`}>
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  type === 'warning' ? 'text-yellow-500' : type === 'info' ? 'text-blue-500' : 'text-primary-500'
                }`} />
                <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">{message}</p>
                <a href={to} className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">{action}</a>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">🚀 Quick Actions</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: 'Users', to: '/admin/users', color: 'from-blue-500 to-blue-600' },
              { icon: Store, label: 'Merchants', to: '/admin/merchants', color: 'from-accent-500 to-orange-500' },
              { icon: Shield, label: 'Fraud', to: '/admin/fraud', color: 'from-amber-500 to-amber-600' },
              { icon: CreditCard, label: 'Payments', to: '/admin/payments', color: 'from-primary-500 to-primary-600' },
              { icon: BarChart3, label: 'Analytics', to: '/admin/analytics', color: 'from-primary-500 to-primary-600' },
              { icon: MessageSquare, label: 'Complaints', to: '/admin/complaints', color: 'from-red-500 to-red-600' },
            ].map(({ icon: Icon, label, to, color }) => (
              <a
                key={label}
                href={to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-dark-800 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import fix
import { CreditCard } from 'lucide-react';
