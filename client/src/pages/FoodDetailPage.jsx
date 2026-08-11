import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Clock, MapPin, Star, Tag, Heart, Share2, ArrowLeft, Leaf, Info, AlertCircle, Store } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/orderSlice';
import { foodService } from '../services';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import CountdownTimer from '../components/CountdownTimer';

export default function FoodDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useSelector((s) => s.auth);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setIsWishlisted(saved.includes(id));
    }
  }, [id]);

  const toggleWishlist = () => {
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated;
    if (saved.includes(id)) {
      updated = saved.filter(itemId => itemId !== id);
      setIsWishlisted(false);
      toast.success('Removed from wishlist');
    } else {
      updated = [...saved, id];
      setIsWishlisted(true);
      toast.success('Added to wishlist');
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food?.name || 'SaveBite Food',
        text: `Check out ${food?.name} on SaveBite!`,
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await foodService.getOne(id);
        setFood(res.data.data);
      } catch {
        toast.error('Food item not found');
        navigate('/food');
      } finally {
        setLoading(false);
      }
    };
    fetchFood();
  }, [id]);

  const isAvailable = food ? ['available', 'expiring_soon'].includes(food.status) : false;
  const isShopClosed = food?.merchant && food.merchant.isOpen === false;

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please login to order'); return; }
    if (role !== 'user') { toast.error('Only customers can order food'); return; }
    if (isShopClosed) {
      toast.error('This shop is currently closed');
      return;
    }
    dispatch(addToCart({ item: food, quantity }));
    toast.success(`${quantity}x ${food.name} added to cart! 🛒`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="shimmer h-80 rounded-2xl" />
          <div className="space-y-4">
            <div className="shimmer h-8 rounded w-3/4" />
            <div className="shimmer h-4 rounded w-1/2" />
            <div className="shimmer h-20 rounded" />
            <div className="shimmer h-12 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!food) return null;

  const savings = food.originalPrice - food.discountedPrice;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Food
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-slate-100 dark:bg-dark-800 mb-3">
            {food.images?.length > 0 ? (
              <img
                src={food.images[activeImg]}
                alt={food.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">🍛</div>
            )}
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="badge bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-sm shadow-lg">{food.discountPercentage}% OFF</span>
              {food.status === 'expiring_soon' && (
                <span className="badge bg-gradient-to-r from-accent-500 to-orange-500 text-white text-sm shadow-lg animate-pulse">⏰ Expiring Soon</span>
              )}
            </div>
            <div className="absolute top-4 right-4">
              <div className={`w-6 h-6 rounded border-2 bg-white flex items-center justify-center ${food.isVeg ? 'border-primary-500' : 'border-red-500'}`}>
                <div className={`w-3 h-3 rounded-full ${food.isVeg ? 'bg-primary-500' : 'bg-red-500'}`} />
              </div>
            </div>
            {isShopClosed && (
              <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-white">
                <span className="text-4xl mb-2">🏪</span>
                <span className="text-xl font-bold bg-red-500 px-4 py-1.5 rounded-full shadow-lg">Shop Closed</span>
                <p className="mt-2 text-sm text-slate-200">This merchant is currently not accepting orders.</p>
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {food.images?.length > 1 && (
            <div className="flex gap-2">
              {food.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{food.name}</h1>
              <div className="flex gap-2">
                <button onClick={toggleWishlist} className={`btn-icon transition-colors ${isWishlisted ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-dark-800'}`}>
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button onClick={handleShare} className="btn-icon text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            {food.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{food.rating}</span>
                <span className="text-slate-400 text-sm">({food.totalReviews} reviews)</span>
              </div>
            )}
          </div>

          {/* Merchant Info */}
          {food.merchant && (
            <Link to={`/merchants/${food.merchant._id}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-dark-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                {food.merchant.businessName?.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{food.merchant.businessName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{food.merchant.address}
                </p>
              </div>
              <Store className="w-4 h-4 text-slate-400" />
            </Link>
          )}

          {/* Price */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-display text-3xl font-black text-primary-600 dark:text-primary-400">₹{(food.discountedPrice * quantity).toFixed(0)}</span>
                <span className="text-slate-400 line-through ml-2 text-lg">₹{(food.originalPrice * quantity).toFixed(0)}</span>
              </div>
              <div className="badge bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold">
                Save ₹{(savings * quantity).toFixed(0)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" /> {food.availableQuantity} {food.unit} available
              </div>
              {food.expiryTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Expires in <CountdownTimer expiryTime={food.expiryTime} />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">About this item</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{food.description}</p>
          </div>

          {/* Allergens */}
          {food.allergens?.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">Allergens</p>
                <p className="text-yellow-600 dark:text-yellow-500">{food.allergens.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Quantity & Cart */}
          <div className="flex gap-3">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-700 rounded-xl p-1.5">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-dark-600 flex items-center justify-center shadow-sm font-bold text-lg hover:bg-primary-50 transition-colors">-</button>
              <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(food.availableQuantity, q + 1))} className="w-9 h-9 rounded-lg bg-white dark:bg-dark-600 flex items-center justify-center shadow-sm font-bold text-lg hover:bg-primary-50 transition-colors">+</button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 flex-1">
              <button 
                onClick={handleAddToCart} 
                disabled={!isAvailable || isShopClosed}
                className="btn-primary btn-lg flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" /> 
                {isShopClosed ? 'Shop Closed' : isAvailable ? `Add to Cart · ₹${(food.discountedPrice * quantity).toFixed(0)}` : food.status.replace('_', ' ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
