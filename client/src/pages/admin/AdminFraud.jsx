import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Search, Filter, Ban, RefreshCcw } from 'lucide-react';
import { adminService } from '../../services';

export default function AdminFraud() {
  const [loading, setLoading] = useState(false);

  // In a real implementation, this would fetch from an API tracking expired orders
  const mockSuspiciousActivity = [
    { id: 1, user: 'John Doe', email: 'john@example.com', type: 'High Cancellation Rate', details: 'Placed 5 orders and never picked them up.', severity: 'High', date: '2023-11-10' },
    { id: 2, user: 'Jane Smith', email: 'jane@example.com', type: 'Expired Tokens', details: 'Tokens expired 3 times this week without pickup.', severity: 'Medium', date: '2023-11-09' },
    { id: 3, user: 'Test User', email: 'test@example.com', type: 'Multiple Accounts', details: 'Same device ID detected on 4 accounts.', severity: 'Low', date: '2023-11-08' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-red-500" /> Fraud & Abuse Detection
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor for abuse of the 'pay-at-pickup' system (e.g. reserving food and not collecting it).</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
          <RefreshCcw className="w-4 h-4 text-slate-500" /> Refresh Scans
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">High Risk Users</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">1</p>
          <p className="text-xs text-slate-500 mt-1">Users with multiple uncollected orders</p>
        </div>
        
        <div className="card p-5 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Expirations</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">45</p>
          <p className="text-xs text-slate-500 mt-1">Orders expired in the last 24h</p>
        </div>

        <div className="card p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
              <Ban className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Banned Accounts</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
          <p className="text-xs text-slate-500 mt-1">Accounts suspended this month</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-dark-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Suspicious Activity Logs</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search logs..." className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button className="p-2 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-dark-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Flag Type</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {mockSuspiciousActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{activity.user}</div>
                    <div className="text-slate-500 text-xs">{activity.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700 dark:text-slate-300">{activity.type}</div>
                    <div className="text-slate-500 text-xs truncate max-w-xs">{activity.details}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${activity.severity === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        activity.severity === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                      {activity.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{activity.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                      Ban User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
