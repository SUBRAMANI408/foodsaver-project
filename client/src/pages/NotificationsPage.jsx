import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Bell, Check, Trash2, Box, Store, DollarSign, Info } from 'lucide-react';
import { notificationService } from '../services';
import { setNotifications, markNotificationRead } from '../redux/slices/uiSlice';
import { format } from 'date-fns';

const iconMap = {
  order: Box,
  system: Info,
  merchant: Store,
  payment: DollarSign,
};

const colorMap = {
  info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
  success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
  warning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/50',
  error: 'text-red-500 bg-red-50 dark:bg-red-950/50',
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.ui);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService.getAll().then((res) => {
      dispatch(setNotifications({ data: res.data.data, unreadCount: res.data.data.filter((n) => !n.isRead).length }));
    }).finally(() => setLoading(false));
  }, [dispatch]);

  const handleMarkRead = (id) => {
    notificationService.markAsRead(id).then(() => {
      dispatch(markNotificationRead(id));
    });
  };

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead().then(() => {
      notificationService.getAll().then((res) => {
        dispatch(setNotifications({ data: res.data.data, unreadCount: 0 }));
      });
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-500" /> Notifications
          </h1>
        </div>
        <button onClick={handleMarkAllRead} className="btn-ghost btn-sm">
          <Check className="w-4 h-4" /> Mark all read
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-20 shimmer" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] || Info;
            const colors = colorMap[notif.priority] || colorMap.info;
            return (
              <motion.div
                key={notif._id}
                whileHover={{ x: 2 }}
                onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                className={`card p-4 flex gap-4 cursor-pointer transition-colors ${!notif.isRead ? 'bg-primary-50/50 dark:bg-primary-950/20 border-l-4 border-l-primary-500' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-800 dark:text-slate-200'}`}>
                    {notif.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{format(new Date(notif.createdAt), 'MMM d, h:mm a')}</p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
