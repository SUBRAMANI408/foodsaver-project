import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Clock, Tag, Star, Heart, ShoppingCart,
  SlidersHorizontal, X, ChevronDown, Grid3X3, List, Leaf, AlertCircle,
} from 'lucide-react';
import { fetchFoodItems, setFilters } from '../redux/slices/foodSlice';
import { addToCart } from '../redux/slices/orderSlice';
import FoodCard from '../components/FoodCard';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'meals', 'snacks', 'bakery', 'beverages', 'desserts', 'vegetables', 'fruits', 'dairy', 'other'];

export default function FoodListPage() {
  const dispatch = useDispatch();
  const { items, loading, pagination, filters } = useSelector((s) => s.food);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minDiscount: '',
    sort: '-createdAt',
    radius: 10,
  });

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(localFilters).filter(([_, v]) => v !== ''));
    dispatch(fetchFoodItems({ ...params, page }));
  }, [dispatch, localFilters, page]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setLocalFilters({ search: '', category: '', minPrice: '', maxPrice: '', minDiscount: '', sort: '-createdAt', radius: 10 });
    setPage(1);
  };

  const hasActiveFilters = localFilters.category || localFilters.minPrice || localFilters.maxPrice || localFilters.minDiscount || localFilters.search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">
          🔥 Discover Food Deals
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Fresh discounts, expiring soon — save food, save money</p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for food, restaurants..."
            value={localFilters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input pl-12 h-12"
          />
          {localFilters.search && (
            <button onClick={() => handleFilterChange('search', '')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn border-2 h-12 px-5 gap-2 ${showFilters ? 'btn-primary' : 'border-slate-200 dark:border-dark-600 text-slate-600 dark:text-slate-400 hover:border-primary-400'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
        </button>
        <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-dark-600 rounded-xl p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label">Min Discount</label>
                  <select value={localFilters.minDiscount} onChange={(e) => handleFilterChange('minDiscount', e.target.value)} className="input">
                    <option value="">Any discount</option>
                    <option value="20">20%+ Off</option>
                    <option value="40">40%+ Off</option>
                    <option value="50">50%+ Off</option>
                    <option value="70">70%+ Off</option>
                  </select>
                </div>
                <div>
                  <label className="label">Price Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min ₹" value={localFilters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="input" />
                    <input type="number" placeholder="Max ₹" value={localFilters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Radius</label>
                  <select value={localFilters.radius} onChange={(e) => handleFilterChange('radius', e.target.value)} className="input">
                    <option value="2">Within 2 km</option>
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Any distance</option>
                  </select>
                </div>
                <div>
                  <label className="label">Sort By</label>
                  <select value={localFilters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="input">
                    <option value="-createdAt">Latest First</option>
                    <option value="-discountPercentage">Highest Discount</option>
                    <option value="discountedPrice">Price: Low to High</option>
                    <option value="-rating">Top Rated</option>
                    <option value="expiryTime">Expiring Soon</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterChange('category', cat === 'all' ? '' : cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0 ${
              (cat === 'all' && !localFilters.category) || localFilters.category === cat
                ? 'bg-primary-500 text-white shadow-glow-green'
                : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-600 border border-slate-200 dark:border-dark-600'
            }`}
          >
            {cat === 'all' ? '🌟 All' : cat === 'meals' ? '🍛 Meals' : cat === 'snacks' ? '🍿 Snacks' : cat === 'bakery' ? '🥐 Bakery' : cat === 'beverages' ? '☕ Beverages' : cat === 'desserts' ? '🍰 Desserts' : cat === 'vegetables' ? '🥦 Vegetables' : cat === 'fruits' ? '🍎 Fruits' : cat === 'dairy' ? '🥛 Dairy' : cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading...' : `${pagination?.total || 0} items found`}
        </p>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="shimmer h-48" />
              <div className="p-4 space-y-3">
                <div className="shimmer h-4 rounded w-3/4" />
                <div className="shimmer h-3 rounded w-1/2" />
                <div className="flex justify-between">
                  <div className="shimmer h-6 w-20 rounded" />
                  <div className="shimmer h-8 w-24 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Leaf className="w-16 h-16 mx-auto mb-4 text-slate-200 dark:text-dark-700" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No food items found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or expanding the radius</p>
          <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {items.map((food, i) => (
            <motion.div
              key={food._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <FoodCard food={food} viewMode={viewMode} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost btn-sm disabled:opacity-40"
          >
            Previous
          </button>
          {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'} w-9`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="btn-ghost btn-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
