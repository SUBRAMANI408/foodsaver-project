import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

export default function DashboardLayout() {
  const { sidebarOpen } = useSelector((s) => s.ui);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-dark-950">
      <Sidebar />
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-1 min-h-screen"
      >
        <div className="p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
}
