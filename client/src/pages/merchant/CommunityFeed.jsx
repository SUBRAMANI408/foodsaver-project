import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, Clock, MapPin, Tag, ChevronRight, X, AlertCircle, Plus } from 'lucide-react';
import { fetchCommunityPosts, sendFoodRequest } from '../../redux/slices/merchantCommunitySlice';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import CreatePostModal from './CreatePostModal';

const CommunityFeed = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector(state => state.merchantCommunity);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCommunityPosts());
  }, [dispatch]);

  const filteredPosts = posts?.filter(post => 
    post.status === 'active' &&
    (post.foodDetails.toLowerCase().includes(searchTerm.toLowerCase()) || 
     post.merchant?.businessName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendRequest = async () => {
    if (!selectedPost || requestQuantity < 1) return;
    
    try {
      await dispatch(sendFoodRequest({
        postId: selectedPost._id,
        requestedQuantity: requestQuantity
      })).unwrap();
      
      toast.success('Food request sent successfully!');
      setSelectedPost(null);
      setRequestQuantity(1);
    } catch (err) {
      toast.error(err || 'Failed to send request');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-dark-900">
      <div className="p-6 shrink-0 border-b border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-primary-500" />
              Merchant Community Feed
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Find excess food shared by nearby merchants at discounted rates.
            </p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Post Excess Food
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by food or merchant name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-dark-900 border-none rounded-xl 
focus:ring-2 focus:ring-primary-500/20 outline-none text-slate-800 dark:text-white placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        {loading && posts?.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        ) : filteredPosts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No active posts found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              There are currently no excess food posts in your area. Check back later or post your own!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPosts?.map(post => (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-slate-200 dark:border-dark-700 
hover:border-primary-500/30 transition-colors shadow-sm cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-white line-clamp-1">
                        {post.merchant?.businessName || 'Unknown Merchant'}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Nearby
                      </p>
                    </div>
                    {post.discountPercentage > 0 && (
                      <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 
text-xs font-semibold rounded-full flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {post.discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-1 line-clamp-2">
                      {post.foodDetails}
                    </p>
                    <div className="flex items-center justify-between text-sm mt-3">
                      <div className="bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-lg flex items-center gap-2">
                        <span className="text-slate-500">Remaining:</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">{post.availableQuantity}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 line-through">₹{post.originalPrice}</p>
                        <p className="font-bold text-lg text-slate-800 dark:text-white">₹{post.finalPrice}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-700 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Until {new Date(post.availableUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <button className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center hover:underline">
                      Request
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-dark-900 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Request Food</h2>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-full transition-colors text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-slate-50 dark:bg-dark-800 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{selectedPost.merchant?.businessName}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{selectedPost.foodDetails}</p>
                  <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-dark-700 pt-3">
                    <span className="text-slate-500">Available: <strong className="text-slate-800 dark:text-white">{selectedPost.availableQuantity} meals</strong></span>
                    <span className="font-bold text-primary-600">₹{selectedPost.finalPrice} / meal</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    How many meals do you need?
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedPost.availableQuantity}
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl 
focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-slate-800 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Total Estimated Cost: <strong className="text-slate-800 dark:text-white">₹{selectedPost.finalPrice * requestQuantity}</strong>
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 
font-medium hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendRequest}
                    disabled={requestQuantity < 1 || requestQuantity > selectedPost.availableQuantity}
                    className="flex-1 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium 
transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary-500/20"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default CommunityFeed;
