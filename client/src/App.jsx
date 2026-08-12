import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { getMe, setInitialized } from './redux/slices/authSlice';
import { addNotification } from './redux/slices/uiSlice';
import { connectSocket, getSocket, disconnectSocket } from './services/socket';
import toast from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages - Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FoodListPage from './pages/FoodListPage';
import FoodDetailPage from './pages/FoodDetailPage';
import WishlistPage from './pages/user/WishlistPage';
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
import CommunityFeed from './pages/merchant/CommunityFeed';
import ManageRequests from './pages/merchant/ManageRequests';
import MerchantDirectory from './pages/merchant/MerchantDirectory';
import MerchantChat from './pages/merchant/MerchantChat';
import MerchantReviews from './pages/merchant/MerchantReviews';

// Pages - Admin Dashboard
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMerchants from './pages/admin/AdminMerchants';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminPayments from './pages/admin/AdminPayments';
import AdminFraud from './pages/admin/AdminFraud';
import AdminComplaints from './pages/admin/AdminComplaints';

// Pages - Helping Center
import HelpingCenterDashboard from './pages/helpingcenter/HelpingCenterDashboard';
import HelpingCenterRequirements from './pages/helpingcenter/HelpingCenterRequirements';
import HelpingCenterReports from './pages/helpingcenter/HelpingCenterReports';
import MerchantSponsorships from './pages/merchant/MerchantSponsorships';

// Misc
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import MerchantsPage from './pages/MerchantsPage';
import ChatPage from './pages/ChatPage';

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
  }, [dispatch, darkMode]); // removing undefined dependencies

  const pushEnabled = useSelector((s) => s.ui.pushEnabled);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user && user._id) {
      const socket = connectSocket();
      if (socket) {
        const handleNotification = (notif) => {
          if (pushEnabled) {
            toast.success(notif.message || 'New notification', { icon: '🔔' });
          }
          dispatch(addNotification(notif));
        };

        const handleOrderUpdate = (data) => {
          if (pushEnabled) {
            toast(data.message || 'Order update', { icon: '📦' });
          }
          // Also add to notifications list if needed
        };

        const handleStockUpdate = (data) => {
          // Dispatch a custom event so any mounted FoodCard can react
          window.dispatchEvent(new CustomEvent('food:stock_updated', { detail: data }));
        };

        socket.on('notification:new', handleNotification);
        socket.on('order:update', handleOrderUpdate);
        socket.on('order:new', handleOrderUpdate);
        socket.on('food:stock_updated', handleStockUpdate);

        return () => {
          socket.off('notification:new', handleNotification);
          socket.off('order:update', handleOrderUpdate);
          socket.off('order:new', handleOrderUpdate);
          socket.off('food:stock_updated', handleStockUpdate);
        };
      }
    }
  }, [user, pushEnabled, dispatch]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-dummy.apps.googleusercontent.com'}>
      <Toaster
        position="bottom-right"
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
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        </Route>

        {/* Dashboard Layout Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/food" element={<FoodListPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
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
          <Route path="donations" element={<MerchantSponsorships />} />
          <Route path="community" element={<CommunityFeed />} />
          <Route path="requests" element={<ManageRequests />} />
          <Route path="directory" element={<MerchantDirectory />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="community-chat" element={<MerchantChat />} />
          <Route path="community-chat/:conversationId" element={<MerchantChat />} />
          <Route path="reviews" element={<MerchantReviews />} />
        </Route>

        {/* Admin Dashboard */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="merchants" element={<AdminMerchants />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="delivery" element={<div className="text-slate-400 p-4">Delivery management coming soon...</div>} />
          <Route path="centers" element={<div className="text-slate-400 p-4">Helping centers coming soon...</div>} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="fraud" element={<AdminFraud />} />
          <Route path="complaints" element={<AdminComplaints />} />
        </Route>

        {/* Helping Center Dashboard */}
        <Route path="/helping-center" element={<PrivateRoute allowedRoles={['helping_center']}><DashboardLayout /></PrivateRoute>}>
          <Route index element={<HelpingCenterDashboard />} />
          <Route path="donations" element={<HelpingCenterRequirements />} />
          <Route path="requirements" element={<HelpingCenterRequirements />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="chat/:conversationId" element={<ChatPage />} />
          <Route path="reports" element={<HelpingCenterReports />} />
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
    </GoogleOAuthProvider>
  );
}
