import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, ShoppingBag, Leaf, DollarSign } from 'lucide-react';
import { adminService } from '../../services';

export default function AdminPayments() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-500" /> Pay-at-Pickup Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor the platform's financial impact. Note: SaveBite uses a 100% pay-at-pickup model directly to merchants.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Value Generated</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">₹{(stats?.totalRevenue || 0).toLocaleString()}</h3>
              </div>
            </div>
            <p className="text-xs text-slate-400">Total value of all picked-up orders.</p>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Orders</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.totalOrders?.toLocaleString() || 0}</h3>
              </div>
            </div>
            <p className="text-xs text-slate-400">Number of completed transactions.</p>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Food Saved</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{(stats?.totalFoodSaved || 0).toLocaleString()} kg</h3>
              </div>
            </div>
            <p className="text-xs text-slate-400">Estimated weight of rescued food.</p>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Merchants</p>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats?.totalMerchants?.toLocaleString() || 0}</h3>
              </div>
            </div>
            <p className="text-xs text-slate-400">Merchants generating revenue on platform.</p>
          </div>
        </div>
      )}

      <div className="card p-8 text-center bg-slate-50 dark:bg-dark-800/50">
        <DollarSign className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Online Payments Gateway</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          SaveBite uses a 100% pay-at-pickup model. Customers pay the merchants directly when collecting their food. As such, there is no online payment processing, settlement, or dispute management required on the platform.
        </p>
      </div>
    </div>
  );
}
