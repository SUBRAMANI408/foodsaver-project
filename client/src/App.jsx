import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { getMe, setInitialized } from './redux/slices/authSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FoodListPage from './pages/FoodListPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';

// Pages - User Dashboard
import UserDashboard from './pages/user/UserDashboard';
import UserOrders from './pages/user/UserOrders';
import UserPayments from './pages/user/UserPayments';

// Pages - Merchant Dashboard
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantFood from './pages/merchant/MerchantFood';
import MerchantOrders from './pages/merchant/MerchantOrders';
import MerchantAnalytics from './pages/merchant/MerchantAnalytics';
import MerchantProfile from './pages/merchant/MerchantProfile';

// Pages - Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMerchants from './pages/admin/AdminMerchants';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Pages - Delivery Partner
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Pages - Helping Center
import HelpingCenterDashboard from './pages/helpingcenter/HelpingCenterDashboard';

// Misc
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import MerchantsPage from './pages/MerchantsPage';

// Route Guards
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, initialized } = useSelector((s) => s.auth);
  if (!initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-slate-500 text-sm">
          Debug: initialized={String(initialized)}, auth={String(isAuthenticated)}, role={String(role)}
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  if (isAuthenticated) {
    const paths = { admin: '/admin', merchant: '/merchant', delivery_partner: '/delivery', helping_center: '/helping-center', user: '/dashboard' };
    return <Navigate to={paths[role] || '/dashboard'} replace />;
  }
  return children;
};

export default function App() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);

  useEffect(() => {
    // Apply dark mode on mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Fetch user profile on mount if token exists
    const token = localStorage.getItem('savebite_token');
    if (token) {
      dispatch(getMe());
    } else {
      // Set initialized to skip loading state
      dispatch(setInitialized());
    }
  }, [dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#f8fafc' : '#0f172a',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/food" element={<FoodListPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/cart" element={<CartPage />} />

          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        </Route>

        {/* Checkout */}
        <Route path="/checkout" element={<PrivateRoute allowedRoles={['user']}><CheckoutPage /></PrivateRoute>} />

        {/* User Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute allowedRoles={['user']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<UserDashboard />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="payments" element={<UserPayments />} />
          <Route path="reviews" element={<div className="text-slate-400 p-4">Reviews page coming soon...</div>} />
          <Route path="stats" element={<div className="text-slate-400 p-4">Statistics page coming soon...</div>} />
        </Route>

        {/* Merchant Dashboard */}
        <Route path="/merchant" element={<PrivateRoute allowedRoles={['merchant']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<MerchantDashboard />} />
          <Route path="food" element={<MerchantFood />} />
          <Route path="food/add" element={<MerchantFood showAddForm />} />
          <Route path="orders" element={<MerchantOrders />} />
          <Route path="analytics" element={<MerchantAnalytics />} />
          <Route path="profile" element={<MerchantProfile />} />
          <Route path="donations" element={<div className="text-slate-400 p-4">Donations page coming soon...</div>} />
          <Route path="reviews" element={<div className="text-slate-400 p-4">Reviews page coming soon...</div>} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="merchants" element={<AdminMerchants />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="delivery" element={<div className="text-slate-400 p-4">Delivery management coming soon...</div>} />
          <Route path="centers" element={<div className="text-slate-400 p-4">Helping centers coming soon...</div>} />
          <Route path="payments" element={<div className="text-slate-400 p-4">Payments management coming soon...</div>} />
          <Route path="fraud" element={<div className="text-slate-400 p-4">Fraud detection coming soon...</div>} />
          <Route path="complaints" element={<div className="text-slate-400 p-4">Complaints coming soon...</div>} />
        </Route>

        {/* Delivery Dashboard */}
        <Route path="/delivery" element={<PrivateRoute allowedRoles={['delivery_partner']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="active" element={<div className="text-slate-400 p-4">Active deliveries coming soon...</div>} />
          <Route path="history" element={<div className="text-slate-400 p-4">Delivery history coming soon...</div>} />
          <Route path="earnings" element={<div className="text-slate-400 p-4">Earnings coming soon...</div>} />
          <Route path="map" element={<div className="text-slate-400 p-4">Route tracking coming soon...</div>} />
        </Route>

        {/* Helping Center Dashboard */}
        <Route path="/helping-center" element={<PrivateRoute allowedRoles={['helping_center']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<HelpingCenterDashboard />} />
          <Route path="donations" element={<div className="text-slate-400 p-4">Donations coming soon...</div>} />
          <Route path="inventory" element={<div className="text-slate-400 p-4">Inventory coming soon...</div>} />
          <Route path="reports" element={<div className="text-slate-400 p-4">Reports coming soon...</div>} />
        </Route>

        {/* Shared Routes */}
        <Route path="/notifications" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<NotificationsPage />} />
        </Route>
        <Route path="/settings" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index element={<SettingsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
