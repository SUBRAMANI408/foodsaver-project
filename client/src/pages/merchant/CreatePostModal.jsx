import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { createCommunityPost, fetchMerchantDirectory } from '../../redux/slices/merchantCommunitySlice';
import { fetchMerchantFood } from '../../redux/slices/foodSlice';
import toast from 'react-hot-toast';
import useDebounce from '../../hooks/useDebounce';

const CreatePostModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { merchantDirectory } = useSelector((state) => state.merchantCommunity);
  const { merchantItems = [] } = useSelector((state) => state.food);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [formData, setFormData] = useState({
    postType: 'excess_food',
    scope: 'public',
    targetMerchants: [],
    foodDetails: '',
    totalQuantity: 1,
    originalPrice: 0,
    discountPercentage: 0,
    availableHours: 2
  });

  useEffect(() => {
    if (isOpen) {
      if (merchantDirectory.length === 0) dispatch(fetchMerchantDirectory());
      dispatch(fetchMerchantFood({}));
    }
  }, [isOpen, dispatch, merchantDirectory.length]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'postType' && value === 'excess_food') {
      setFormData(prev => ({ ...prev, postType: value, foodDetails: '' }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'foodDetails' || name === 'postType' || name === 'scope') ? value : Number(value)
    }));
  };

  const handleFoodSelect = (e) => {
    const selectedName = e.target.value;
    const foodItem = merchantItems.find(item => item.name === selectedName);
    if (foodItem) {
      setFormData(prev => ({
        ...prev,
        foodDetails: foodItem.name,
        totalQuantity: foodItem.quantity || 1,
        originalPrice: foodItem.price || 0
      }));
    } else {
      setFormData(prev => ({ ...prev, foodDetails: selectedName }));
    }
  };

  const toggleMerchant = (merchantId) => {
    setFormData(prev => {
      const targets = prev.targetMerchants.includes(merchantId)
        ? prev.targetMerchants.filter(id => id !== merchantId)
        : [...prev.targetMerchants, merchantId];
      return { ...prev, targetMerchants: targets };
    });
  };

  const finalPrice = Math.round(formData.originalPrice * (1 - formData.discountPercentage / 100));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodDetails) return;
    
    setLoading(true);
    try {
      const availableUntil = new Date();
      availableUntil.setHours(availableUntil.getHours() + formData.availableHours);

      const payload = {
        postType: formData.postType,
        scope: formData.scope,
        foodDetails: formData.foodDetails,
      };

      if (formData.scope === 'selected') {
        payload.targetMerchants = formData.targetMerchants;
      }

      if (formData.postType === 'excess_food') {
        payload.totalQuantity = formData.totalQuantity;
        payload.availableQuantity = formData.totalQuantity;
        payload.originalPrice = formData.originalPrice;
        payload.discountPercentage = formData.discountPercentage;
        payload.discountedPrice = finalPrice;
        payload.availableUntil = availableUntil.toISOString();
      } else if (formData.postType === 'food_requirement') {
        payload.totalQuantity = formData.totalQuantity;
        payload.availableUntil = availableUntil.toISOString();
      }

      await dispatch(createCommunityPost(payload)).unwrap();
      toast.success('Post created successfully!');
      onClose();
    } catch (error) {
      toast.error(error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const filteredMerchants = merchantDirectory?.filter(m => 
    m.businessName?.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">Create Community Post</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="create-post-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Post Type</label>
                <select
                  name="postType"
                  value={formData.postType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                >
                  <option value="excess_food">Excess Food</option>
                  <option value="food_requirement">Food Requirement</option>
                  <option value="general">General Post</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Share With</label>
                <select
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                >
                  <option value="public">Everyone (Public)</option>
                  <option value="nearby">Nearby Merchants Only</option>
                  <option value="selected">Selected Merchants</option>
                </select>
              </div>
            </div>

            {formData.scope === 'selected' && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filteredMerchants.map(merchant => (
                    <label key={merchant._id} className="flex items-center gap-2 p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetMerchants.includes(merchant._id)}
                        onChange={() => toggleMerchant(merchant._id)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-slate-700">{merchant.businessName}</span>
                    </label>
                  ))}
                  {filteredMerchants.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">No merchants found</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {formData.postType === 'general' ? 'Post Content' : 'Food Details'}
              </label>
              {formData.postType === 'excess_food' ? (
                <select
                  name="foodDetails"
                  value={formData.foodDetails}
                  onChange={handleFoodSelect}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                >
                  <option value="" disabled>Select from My Food...</option>
                  {merchantItems.filter(i => ['available', 'expiring_soon'].includes(i.status)).map(item => (
                    <option key={item._id} value={item.name}>
                      {item.name} (Qty: {item.quantity})
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  name="foodDetails"
                  value={formData.foodDetails}
                  onChange={handleChange}
                  placeholder={formData.postType === 'general' ? "What's on your mind?" : "E.g., 20 kg of Biryani, 50 parottas..."}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                />
              )}
            </div>

            {formData.postType !== 'general' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quantity (Meals/Items)</label>
                  <input
                    type="number"
                    name="totalQuantity"
                    value={formData.totalQuantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {formData.postType === 'excess_food' ? 'Available For (Hours)' : 'Required Within (Hours)'}
                  </label>
                  <input
                    type="number"
                    name="availableHours"
                    value={formData.availableHours}
                    onChange={handleChange}
                    min="1"
                    max="48"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {formData.postType === 'excess_food' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Discount</label>
                  <select
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    <option value={0}>No Discount</option>
                    <option value={10}>10% OFF</option>
                    <option value={25}>25% OFF</option>
                    <option value={50}>50% OFF</option>
                    <option value={75}>75% OFF</option>
                    <option value={100}>100% FREE</option>
                  </select>
                </div>
              </div>
            )}

            {formData.postType === 'excess_food' && formData.originalPrice > 0 && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-green-800">Final Price (per item)</span>
                <span className="text-xl font-bold text-green-600">₹{finalPrice}</span>
              </div>
            )}

          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            form="create-post-form"
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post to Community'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
