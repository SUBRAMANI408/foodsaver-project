import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Leaf, LayoutDashboard, Search, ShoppingBag, Bell, Star,
  Settings, LogOut, ChevronLeft, ChevronRight, Home, Package,
  TrendingUp, Gift, Truck, Users, Shield, Heart, BarChart3,
  Store, CreditCard, MessageSquare, MapPin, Inbox
} from 'lucide-react';
import { toggleSidebar } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';

const menuByRole = {
  user: [
    { icon: Home, label: 'Home', to: '/dashboard' },
    { icon: Search, label: 'Find Food', to: '/food' },
    { icon: ShoppingBag, label: 'My Orders', to: '/dashboard/orders' },
    { icon: CreditCard, label: 'Payments', to: '/dashboard/payments' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Star, label: 'Reviews', to: '/dashboard/reviews' },
    { icon: TrendingUp, label: 'Analytics', to: '/dashboard/stats' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  merchant: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/merchant' },
    { icon: Users, label: 'Community Feed', to: '/merchant/community' },
    { icon: Inbox, label: 'Food Requests', to: '/merchant/requests' },
    { icon: Package, label: 'My Food', to: '/merchant/food' },
    { icon: ShoppingBag, label: 'Orders', to: '/merchant/orders' },
    { icon: Gift, label: 'NGO Sponsorships', to: '/merchant/donations' },
    { icon: MessageSquare, label: 'Chat', to: '/merchant/chat', badge: 'chat' },
    { icon: Store, label: 'Store Profile', to: '/merchant/profile' },
    { icon: Star, label: 'Reviews', to: '/merchant/reviews' },
    { icon: BarChart3, label: 'Analytics', to: '/merchant/analytics' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  delivery_partner: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/delivery' },
    { icon: Truck, label: 'Active Deliveries', to: '/delivery/active' },
    { icon: MapPin, label: 'Route Tracking', to: '/delivery/map' },
    { icon: ShoppingBag, label: 'History', to: '/delivery/history' },
    { icon: CreditCard, label: 'Earnings', to: '/delivery/earnings' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  helping_center: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/helping-center' },
    { icon: Heart, label: 'Food Requirements', to: '/helping-center/donations' },
    { icon: MessageSquare, label: 'Chat', to: '/helping-center/chat', badge: 'chat' },
    { icon: Package, label: 'Inventory', to: '/helping-center/inventory' },
    { icon: BarChart3, label: 'Reports', to: '/helping-center/reports' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/admin' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: Store, label: 'Merchants', to: '/admin/merchants' },
    { icon: Truck, label: 'Delivery', to: '/admin/delivery' },
    { icon: Heart, label: 'Helping Centers', to: '/admin/centers' },
    { icon: CreditCard, label: 'Payments', to: '/admin/payments' },
    { icon: Shield, label: 'Fraud Detection', to: '/admin/fraud' },
    { icon: BarChart3, label: 'Analytics', to: '/admin/analytics' },
    { icon: MessageSquare, label: 'Complaints', to: '/admin/complaints' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ],
};

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);
  const chatUnreadCount = useSelector((s) => s.chat?.unreadCount || 0);

  const menuItems = menuByRole[role] || menuByRole.user;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-white dark:bg-dark-900 border-r border-slate-100 dark:border-dark-700 flex flex-col fixed left-0 top-0 z-40 overflow-hidden shadow-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100 dark:border-dark-700">
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-glow-green">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="font-display font-bold text-lg gradient-text leading-none">SaveBite</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider truncate">
              {role?.replace('_', ' ')}
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
        {menuItems.map(({ icon: Icon, label, to, badge }) => {
          const badgeCount = badge === 'chat' ? chatUnreadCount : 0;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard' || to === '/merchant' || to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              <div className="relative flex-shrink-0">
                <Icon className="w-5 h-5" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium truncate flex-1">
                  {label}
                </motion.span>
              )}
              {sidebarOpen && badgeCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Collapse */}
      <div className="border-t border-slate-100 dark:border-dark-700 p-3 space-y-2">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : (user.name || user.businessName || '?').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name || user.businessName}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
