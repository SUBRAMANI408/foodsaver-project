import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { createCommunityPost } from '../../redux/slices/merchantCommunitySlice';
import toast from 'react-hot-toast';

const CreatePostModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    foodDetails: '',
    totalQuantity: 1,
    originalPrice: 0,
    discountPercentage: 0,
    availableHours: 2
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'foodDetails' ? value : Number(value)
    }));
  };

  const finalPrice = Math.round(formData.originalPrice * (1 - formData.discountPercentage / 100));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodDetails || formData.totalQuantity < 1) return;
    
    setLoading(true);
    try {
      const availableUntil = new Date();
      availableUntil.setHours(availableUntil.getHours() + formData.availableHours);

      await dispatch(createCommunityPost({
        foodDetails: formData.foodDetails,
        totalQuantity: formData.totalQuantity,
        availableQuantity: formData.totalQuantity,
        originalPrice: formData.originalPrice,
        discountPercentage: formData.discountPercentage,
        finalPrice,
        availableUntil
      })).unwrap();
      
      toast.success('Food post created successfully!');
      onClose();
    } catch (err) {
      toast.error(err || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-lg relative z-10 overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Post Excess Food</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Food Description
            </label>
            <textarea
              name="foodDetails"
              value={formData.foodDetails}
              onChange={handleChange}
              placeholder="E.g. 50 plates of vegetable biryani remaining from today's lunch..."
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white min-h-[100px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Quantity (Meals)
              </label>
              <input
                type="number"
                name="totalQuantity"
                min="1"
                value={formData.totalQuantity}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Available Time (Hours)
              </label>
              <input
                type="number"
                name="availableHours"
                min="1"
                max="48"
                value={formData.availableHours}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Original Price (₹ per meal)
              </label>
              <input
                type="number"
                name="originalPrice"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Discount (%)
              </label>
              <select
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white"
              >
                <option value="0">0% (No discount)</option>
                <option value="10">10% Off</option>
                <option value="20">20% Off</option>
                <option value="30">30% Off</option>
                <option value="40">40% Off</option>
                <option value="50">50% Off</option>
                <option value="75">75% Off</option>
                <option value="100">100% (Free)</option>
              </select>
            </div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 flex justify-between items-center">
            <span className="text-primary-800 dark:text-primary-300 font-medium">Calculated Final Price:</span>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">₹{finalPrice} / meal</span>
          </div>
          
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 
font-medium hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium 
transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-500/20 flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                'Post to Community'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreatePostModal;
