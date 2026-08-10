import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Bell, ShoppingCart, Search, Moon, Sun, Menu, X,
  User, Settings, LogOut, ChevronDown, MapPin,
} from 'lucide-react';
import { toggleDarkMode, toggleMobileSidebar } from '../redux/slices/uiSlice';
import { logout } from '../redux/slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useSelector((s) => s.auth);
  const { darkMode, unreadCount, mobileSidebarOpen } = useSelector((s) => s.ui);
  const cartItems = useSelector((s) => s.orders.cart);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getDashboardPath = () => {
    const paths = {
      admin: '/admin',
      merchant: '/merchant',
      delivery_partner: '/delivery',
      helping_center: '/helping-center',
      user: '/dashboard',
    };
    return paths[role] || '/dashboard';
  };

  const handleImpactClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/#impact');
    } else {
      document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-slate-200/50 dark:border-dark-700/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow-green group-hover:shadow-glow-green transition-all duration-300">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl gradient-text">SaveBite</span>
              <div className="text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 font-medium tracking-wider uppercase">Smart Food Rescue</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Home', to: '/' },
              { label: 'Find Food', to: '/food' },
              { label: 'Merchants', to: '/merchants' },
            ].map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-dark-800'
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href="#impact"
              onClick={handleImpactClick}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-dark-800 cursor-pointer"
            >
              Impact
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="btn-icon text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-400"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link to="/notifications" className="btn-icon relative text-slate-500 dark:text-slate-400 hover:text-primary-500">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="notification-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>

                {/* Cart (user only) */}
                {role === 'user' && (
                  <Link to="/cart" className="btn-icon relative text-slate-500 dark:text-slate-400 hover:text-primary-500">
                    <ShoppingCart className="w-5 h-5" />
                    {cartItems.length > 0 && (
                      <span className="notification-dot">{cartItems.length}</span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        (user.name || user.businessName || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {user.name || user.businessName}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 card shadow-card-hover z-50 overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-100 dark:border-dark-700">
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{user.name || user.businessName}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <span className="badge-green mt-1 text-[10px]">{role}</span>
                        </div>
                        <div className="p-1">
                          <Link
                            to={getDashboardPath()}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <User className="w-4 h-4" /> Dashboard
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <Settings className="w-4 h-4" /> Settings
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleMobileSidebar())}
              className="md:hidden btn-icon text-slate-500"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
