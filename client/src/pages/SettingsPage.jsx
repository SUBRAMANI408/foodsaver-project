import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun, Bell, Shield, Key, MapPin, Globe, User, Upload, X, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { toggleDarkMode, togglePushNotifications } from '../redux/slices/uiSlice';
import { getMe } from '../redux/slices/authSlice';
import { authService, merchantService } from '../services';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { darkMode, pushEnabled } = useSelector((s) => s.ui);
  const { user, role } = useSelector((s) => s.auth);

  const [name, setName] = useState(user?.name || user?.businessName || user?.centerName || '');
  const [phone, setPhone] = useState(user?.phone || user?.contactPhone || '');
  const [avatar, setAvatar] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const formData = new FormData();
      if (role === 'merchant') {
        formData.append('businessName', name);
        formData.append('contactPhone', phone);
      } else if (role === 'helping_center') {
        formData.append('centerName', name);
        formData.append('contactPhone', phone);
      } else {
        formData.append('name', name);
        formData.append('phone', phone);
      }
      
      if (avatar) formData.append('avatar', avatar);

      if (role === 'merchant') {
        await merchantService.updateProfile(formData);
      } else {
        await authService.updateProfile(formData);
      }
      
      toast.success('Profile updated successfully');
      dispatch(getMe());
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings ⚙️</h1>

      {/* Profile Section */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-500" /> Public Profile
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-800 overflow-hidden border border-slate-200 dark:border-dark-700">
              {avatar ? (
                <img src={URL.createObjectURL(avatar)} className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id="avatar-upload"
                hidden
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
              <label htmlFor="avatar-upload" className="btn btn-sm btn-outline cursor-pointer inline-flex items-center gap-2">
                <Upload className="w-4 h-4" /> Change Photo
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Name / Business Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1" />
            </div>
          </div>
          <button type="submit" disabled={updating} className="btn-primary">
            {updating ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" /> Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</p>
              <p className="text-xs text-slate-500">Toggle dark theme</p>
            </div>
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-700 dark:text-slate-300">Push Notifications</p>
              <p className="text-xs text-slate-500">Get alerts for new deals</p>
            </div>
            <button
              onClick={() => dispatch(togglePushNotifications())}
              className={`w-12 h-6 rounded-full transition-colors ${pushEnabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${pushEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> Security
        </h3>
        <div className="space-y-3">
          <button onClick={() => setShowPasswordModal(true)} className="btn w-full justify-start border-2 border-slate-200 dark:border-dark-700 hover:border-primary-500">
            <Key className="w-4 h-4 text-slate-400" /> Change Password
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    
    try {
      setLoading(true);
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">Change Password</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input mt-1" required />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input mt-1" required minLength="6" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input mt-1" required minLength="6" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center mt-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
