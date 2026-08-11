import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMerchantDirectory } from '../../redux/slices/merchantCommunitySlice';
import { motion } from 'framer-motion';
import { Search, MapPin, MessageSquare, UtensilsCrossed, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MerchantDirectory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { merchantDirectory, loading } = useSelector((state) => state.merchantCommunity);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNearby, setFilterNearby] = useState(false);

  useEffect(() => {
    dispatch(fetchMerchantDirectory(filterNearby));
  }, [dispatch, filterNearby]);

  const filteredMerchants = merchantDirectory?.filter((m) =>
    m.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-green-600" />
            Merchant Directory
          </h1>
          <p className="text-slate-500">Connect with other merchants in the community</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>
          <button
            onClick={() => setFilterNearby(!filterNearby)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
              filterNearby
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Nearby</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredMerchants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">No merchants found</h3>
          <p className="text-slate-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMerchants.map((merchant) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={merchant._id}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-xl">
                      {merchant.businessName?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate pr-4">
                      {merchant.businessName}
                    </h3>
                    <p className="text-sm text-slate-500">{merchant.name}</p>
                  </div>
                </div>
                
                {merchant.isActive && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{merchant.address || 'Location not specified'}</span>
                </div>
                {merchant.businessType && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                    <span className="capitalize">{merchant.businessType}</span>
                  </div>
                )}
                {merchant.distance && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{(merchant.distance / 1000).toFixed(1)} km away</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/merchant/chat?merchantId=${merchant._id}`)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantDirectory;
