import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Leaf, Clock, Tag, Image } from 'lucide-react';
import { createFoodItem } from '../redux/slices/foodSlice';
import toast from 'react-hot-toast';

const CATEGORIES = ['meals', 'snacks', 'bakery', 'beverages', 'desserts', 'vegetables', 'fruits', 'dairy', 'other'];

export default function AddFoodModal({ onClose }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: 'meals', originalPrice: '', discountPercentage: '30',
    quantity: '', unit: 'pieces', expiryTime: '', isVeg: true, isDynamicPricing: false, allergens: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const discountedPrice = form.originalPrice
    ? (parseFloat(form.originalPrice) * (1 - parseFloat(form.discountPercentage || 0) / 100)).toFixed(0)
    : 0;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));

      const result = await dispatch(createFoodItem(fd));
      if (createFoodItem.fulfilled.match(result)) {
        toast.success('Food item added successfully! 🎉');
        onClose();
      } else {
        toast.error(result.payload || 'Failed to add food item');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-dark-700 sticky top-0 bg-white dark:bg-dark-900 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-950/50 rounded-xl flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-500" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Add Food Item</h2>
          </div>
          <button onClick={onClose} className="btn-icon text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Images */}
          <div>
            <label className="label">Food Images (up to 5)</label>
            <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-slate-300 dark:border-dark-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors bg-slate-50 dark:bg-dark-800">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-sm text-slate-500">Click to upload images</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {previews.map((p, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Food Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Butter Chicken" className="input" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description *</label>
            <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the food item..." className="input resize-none" />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Original Price (₹) *</label>
              <input required type="number" min="1" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="150" className="input" />
            </div>
            <div>
              <label className="label">Discount % *</label>
              <input required type="number" min="0" max="90" value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Discounted Price</label>
              <div className="input bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold">₹{discountedPrice}</div>
            </div>
          </div>

          {/* Quantity & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Quantity *</label>
              <input required type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10" className="input" />
            </div>
            <div>
              <label className="label">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input">
                {['pieces', 'kg', 'g', 'portions', 'liters', 'ml'].map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expiry Time *</label>
              <input required type="datetime-local" value={form.expiryTime} onChange={(e) => setForm({ ...form, expiryTime: e.target.value })} className="input" />
            </div>
          </div>

          {/* Allergens */}
          <div>
            <label className="label">Allergens (comma separated)</label>
            <input value={form.allergens} onChange={(e) => setForm({ ...form, allergens: e.target.value })} placeholder="e.g. nuts, gluten, dairy" className="input" />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, isVeg: !form.isVeg })}
                className={`w-10 h-6 rounded-full transition-colors ${form.isVeg ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVeg ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vegetarian</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, isDynamicPricing: !form.isDynamicPricing })}
                className={`w-10 h-6 rounded-full transition-colors ${form.isDynamicPricing ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isDynamicPricing ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dynamic Pricing</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Add Food Item</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
