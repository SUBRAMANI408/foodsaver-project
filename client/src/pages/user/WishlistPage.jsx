import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodCard from '../../components/FoodCard';
import { foodService } from '../../services';

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const storedIds = JSON.parse(localStorage.getItem('wishlist')) || [];
        setWishlistIds(storedIds);
        
        if (storedIds.length > 0) {
          const items = await Promise.all(
            storedIds.map(id => foodService.getOne(id).then(res => res.data.data).catch(() => null))
          );
          setWishlistItems(items.filter(item => item !== null));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const removeFromWishlist = (foodId) => {
    const updatedIds = wishlistIds.filter(id => id !== foodId);
    setWishlistIds(updatedIds);
    setWishlistItems(wishlistItems.filter(item => item._id !== foodId));
    localStorage.setItem('wishlist', JSON.stringify(updatedIds));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Wishlist</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-800">
          <Heart className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Save your favorite food items to quickly find them later!</p>
          <Link to="/food" className="btn-primary inline-flex">Browse Food</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map(food => (
            <div key={food._id} className="relative group">
              <FoodCard food={food} />
              <button 
                onClick={() => removeFromWishlist(food._id)}
                className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-dark-900/90 shadow-sm flex items-center justify-center text-rose-500 hover:scale-110 transition-transform backdrop-blur-sm"
                title="Remove from wishlist"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
