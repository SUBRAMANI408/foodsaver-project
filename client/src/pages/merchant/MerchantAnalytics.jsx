import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, Leaf, TrendingUp } from 'lucide-react';

const mockData = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5000, orders: 32 },
  { name: 'Thu', revenue: 4500, orders: 28 },
  { name: 'Fri', revenue: 6000, orders: 40 },
  { name: 'Sat', revenue: 8000, orders: 55 },
  { name: 'Sun', revenue: 7000, orders: 48 },
];

export default function MerchantAnalytics() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Analytics 📈</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Weekly Revenue', value: '₹37,500', icon: DollarSign, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50' },
          { label: 'Total Orders', value: '245', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
          { label: 'Food Saved (kg)', value: '180', icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
          { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/50' },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="font-display text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Orders Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-10" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
