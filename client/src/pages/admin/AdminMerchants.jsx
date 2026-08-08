import { useEffect, useState } from 'react';
import { adminService } from '../../services';
import { Store, CheckCircle, XCircle, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchMerchants = () => {
    adminService.getMerchants({ role: 'merchant' }).then((res) => {
      setMerchants(res.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMerchants(); }, []);

  const handleVerify = async (id, isVerified) => {
    try {
      await adminService.verifyMerchant(id, isVerified);
      toast.success(`Merchant ${isVerified ? 'verified' : 'unverified'}`);
      fetchMerchants();
    } catch (err) {
      toast.error('Failed to update merchant status');
    }
  };

  const filtered = filter === 'all' ? merchants : merchants.filter((m) => filter === 'verified' ? m.isVerified : !m.isVerified);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Merchant Verification 🏪</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'verified'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-sm btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card h-40 shimmer" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">No merchants found</div>
        ) : (
          filtered.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-500 flex items-center justify-center font-bold">
                    {m.businessName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{m.businessName}</h3>
                    <p className="text-xs text-slate-500 capitalize">{m.businessType}</p>
                  </div>
                </div>
                <span className={`badge text-xs ${m.isVerified ? 'badge-green' : 'badge-orange'}`}>
                  {m.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="space-y-1 mb-4 text-xs text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.address}</p>
                <p>👤 {m.name} | 📞 {m.phone}</p>
                <p>📧 {m.email}</p>
              </div>
              <div className="flex gap-2 border-t border-slate-100 dark:border-dark-700 pt-3 mt-3">
                {!m.isVerified ? (
                  <button onClick={() => handleVerify(m._id, true)} className="btn-sm btn bg-emerald-500 hover:bg-emerald-600 text-white flex-1">
                    <CheckCircle className="w-4 h-4" /> Verify
                  </button>
                ) : (
                  <button onClick={() => handleVerify(m._id, false)} className="btn-sm btn-ghost text-red-500 hover:bg-red-50 flex-1">
                    <XCircle className="w-4 h-4" /> Revoke Verification
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
