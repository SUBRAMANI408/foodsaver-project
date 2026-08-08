import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun, Bell, Shield, Key, MapPin, Globe } from 'lucide-react';
import { toggleDarkMode } from '../redux/slices/uiSlice';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((s) => s.ui);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Settings ⚙️</h1>

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
              onClick={() => { setNotifications(!notifications); toast.success('Preference updated'); }}
              className={`w-12 h-6 rounded-full transition-colors ${notifications ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" /> Security
        </h3>
        <div className="space-y-3">
          <button className="btn w-full justify-start border-2 border-slate-200 dark:border-dark-700 hover:border-primary-500">
            <Key className="w-4 h-4 text-slate-400" /> Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
