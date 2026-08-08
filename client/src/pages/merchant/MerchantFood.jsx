import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Package, Tag, Clock, Trash2, Edit, Eye, Gift, CheckCircle, XCircle } from 'lucide-react';
import { fetchMerchantFood, deleteFoodItem } from '../../redux/slices/foodSlice';
import AddFoodModal from '../../components/AddFoodModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  available: 'badge-green', expiring_soon: 'badge-orange',
  expired: 'badge-red', donated: 'badge-purple', sold: 'badge-blue', reserved: 'badge-orange',
};

export default function MerchantFood({ showAddForm = false }) {
  const dispatch = useDispatch();
  const { merchantItems, loading } = useSelector((s) => s.food);
  const [showModal, setShowModal] = useState(showAddForm);
  const [filter, setFilter] = useState('all');

  useEffect(() => { dispatch(fetchMerchantFood({})); }, [dispatch]);

  const filtered = filter === 'all' ? merchantItems : merchantItems.filter((f) => f.status === filter);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    const result = await dispatch(deleteFoodItem(id));
    if (deleteFoodItem.fulfilled.match(result)) {
      toast.success('Food item deleted');
    } else {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Food Items 🍽️</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['all', 'available', 'expiring_soon', 'expired', 'donated', 'sold'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filter === s ? 'bg-primary-500 text-white shadow-glow-green' : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-dark-600'
            }`}
          >
            {s === 'all' ? `All (${merchantItems.length})` : s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-60 shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No food items</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Add your first food listing to start selling!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Add Food Item</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((food) => (
            <motion.div key={food._id} whileHover={{ y: -2 }} className="card overflow-hidden group">
              {/* Image */}
              <div className="relative h-40 bg-slate-100 dark:bg-dark-700">
                {food.images?.[0] ? (
                  <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍛</div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`badge text-xs ${statusColors[food.status]}`}>{food.status?.replace('_', ' ')}</span>
                  <span className="badge bg-primary-500 text-white text-xs font-bold">{food.discountPercentage}% OFF</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1 truncate">{food.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-primary-600 dark:text-primary-400">₹{food.discountedPrice?.toFixed(0)}</span>
                  <span className="text-xs text-slate-400 line-through">₹{food.originalPrice}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-3">
                  <span>Qty: {food.availableQuantity}/{food.quantity}</span>
                  {food.expiryTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(new Date(food.expiryTime), 'h:mm a')}</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="btn-ghost btn-sm flex-1 text-xs">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  {['available', 'expiring_soon', 'expired'].includes(food.status) && (
                    <button className="btn-sm btn border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-xs hover:bg-purple-50 dark:hover:bg-purple-950/30">
                      <Gift className="w-3.5 h-3.5" /> Donate
                    </button>
                  )}
                  <button onClick={() => handleDelete(food._id, food.name)} className="btn-sm btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Food Modal */}
      {showModal && <AddFoodModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
