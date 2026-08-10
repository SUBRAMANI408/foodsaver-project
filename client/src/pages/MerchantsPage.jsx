import { Link } from 'react-router-dom';
import { Store, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { merchantService } from '../services';

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    merchantService.getNearby({}).then((res) => {
      setMerchants(res.data.data || []);
    }).catch(() => setMerchants([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-4">Partner Merchants 🏪</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Discover restaurants, bakeries, and stores in your area offering amazing food deals.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-48 shimmer" />)}
        </div>
      ) : merchants.length === 0 ? (
        <div className="text-center py-20">
          <Store className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <p className="text-slate-500 dark:text-slate-400">No verified merchants found in this area yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchants.map((m) => (
            <Link key={m._id} to={`/food?merchant=${m._id}`} className="card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
              <div className="h-32 bg-slate-100 dark:bg-dark-800 flex items-center justify-center">
                {m.avatar ? (
                  <img src={m.avatar} alt={m.businessName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Store className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{m.businessName}</h3>
                  {m.rating > 0 && (
                    <div className="flex items-center gap-0.5 text-xs text-slate-600 dark:text-slate-400">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {m.rating}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 capitalize mb-2">{m.businessType}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" /> <span className="truncate">{m.address}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
