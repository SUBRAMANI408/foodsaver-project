import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, MapPin, Star, Tag, Flame, Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/orderSlice';
import toast from 'react-hot-toast';
import { format, isAfter, isBefore, addHours } from 'date-fns';
import { useState } from 'react';

const statusColors = {
  available: 'badge-green',
  expiring_soon: 'badge-orange',
  expired: 'badge-red',
  donated: 'badge-purple',
  sold: 'badge-blue',
  reserved: 'badge-orange',
};

const categoryEmojis = {
  meals: '🍛', snacks: '🍿', bakery: '🥐', beverages: '☕',
  desserts: '🍰', vegetables: '🥦', fruits: '🍎', dairy: '🥛', other: '🍽️',
};

export default function FoodCard({ food, viewMode = 'grid' }) {
  const dispatch = useDispatch();
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const [imageError, setImageError] = useState(false);

  const isExpiringSoon = food.status === 'expiring_soon';
  const timeLeft = food.expiryTime ? format(new Date(food.expiryTime), 'h:mm a') : null;
  const computedPrice = food.discountedPrice !== undefined ? food.discountedPrice : (food.originalPrice - (food.originalPrice * (food.discountPercentage || 0) / 100));

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (role !== 'user') {
      toast.error('Only customers can order food');
      return;
    }
    dispatch(addToCart({ item: food, quantity: 1 }));
    toast.success(`${food.name} added to cart! 🛒`);
  };

  if (viewMode === 'list') {
    return (
      <motion.div whileHover={{ x: 2 }} className="card-hover overflow-hidden">
        <Link to={`/food/${food._id}`} className="flex gap-4 p-4">
          {/* Image */}
          <div className="relative w-28 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-700">
            {food.images?.[0] && !imageError ? (
              <img src={food.images[0]} alt={food.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">
                {categoryEmojis[food.category] || '🍽️'}
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span className="badge bg-primary-500 text-white text-xs font-bold">{food.discountPercentage}% OFF</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{food.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{food.merchant?.businessName}</p>
              </div>
              <span className={`badge text-xs flex-shrink-0 ${statusColors[food.status]}`}>{food.status?.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <span className="font-bold text-primary-600 dark:text-primary-400">₹{computedPrice.toFixed(0)}</span>
                <span className="text-xs text-slate-400 line-through">₹{food.originalPrice}</span>
              </div>
              {timeLeft && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Expires {timeLeft}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Tag className="w-3 h-3" />
                {food.availableQuantity} left
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            <button
              onClick={handleAddToCart}
              disabled={!['available', 'expiring_soon'].includes(food.status)}
              className="btn-primary btn-sm disabled:opacity-40"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card overflow-hidden group cursor-pointer"
    >
      <Link to={`/food/${food._id}`}>
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-dark-700">
          {food.images?.[0] && !imageError ? (
            <img
              src={food.images[0]}
              alt={food.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">{categoryEmojis[food.category] || '🍽️'}</span>
              <span className="text-xs text-slate-400 capitalize">{food.category}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="badge bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-xs shadow-lg">
              {food.discountPercentage}% OFF
            </span>
            {isExpiringSoon && (
              <span className="badge bg-gradient-to-r from-accent-500 to-orange-500 text-white text-xs shadow-lg animate-pulse">
                ⏰ Expiring Soon
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`badge text-xs ${statusColors[food.status]}`}>
              {food.status?.replace('_', ' ')}
            </span>
          </div>

          {/* Veg/Non-veg indicator */}
          <div className="absolute bottom-3 left-3">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${food.isVeg ? 'border-primary-500 bg-white' : 'border-red-500 bg-white'}`}>
              <div className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-primary-500' : 'bg-red-500'}`} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">{food.name}</h3>
            {food.rating > 0 && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-slate-500">{food.rating}</span>
              </div>
            )}
          </div>

          {food.merchant && (
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{food.merchant.businessName}</span>
            </div>
          )}

          {/* Price & Time */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-primary-600 dark:text-primary-400">₹{computedPrice.toFixed(0)}</span>
                <span className="text-xs text-slate-400 line-through">₹{food.originalPrice}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Tag className="w-3 h-3" /> {food.availableQuantity} {food.unit} left
              </div>
            </div>
            {timeLeft && (
              <div className={`text-xs font-medium flex items-center gap-1 ${isExpiringSoon ? 'text-accent-500' : 'text-slate-400'}`}>
                <Clock className="w-3.5 h-3.5" />
                {timeLeft}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!['available', 'expiring_soon'].includes(food.status)}
            className="btn-primary w-full btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {['available', 'expiring_soon'].includes(food.status) ? 'Add to Cart' : food.status.replace('_', ' ')}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
