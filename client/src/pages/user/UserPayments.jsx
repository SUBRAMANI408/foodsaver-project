import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { paymentService } from '../../services';
import { useState } from 'react';
import { format } from 'date-fns';

export default function UserPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.getMyPayments().then((res) => {
      setPayments(res.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalSpent = payments.filter((p) => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Payment History 💳</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, icon: DollarSign, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/50' },
          { label: 'Transactions', value: payments.length, icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/50' },
          { label: 'Successful', value: payments.filter((p) => p.status === 'completed').length, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="font-bold text-slate-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j}><div className="shimmer h-4 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">No payments yet</td>
                </tr>
              ) : payments.map((p) => (
                <tr key={p._id}>
                  <td className="font-medium text-slate-800 dark:text-slate-200">#{p.order?.orderNumber || '—'}</td>
                  <td className="font-bold text-slate-900 dark:text-white">₹{p.amount}</td>
                  <td className="capitalize text-slate-600 dark:text-slate-400">{p.method?.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge text-xs ${p.status === 'completed' ? 'badge-green' : p.status === 'failed' ? 'badge-red' : 'badge-orange'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-slate-400 text-xs">{format(new Date(p.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
