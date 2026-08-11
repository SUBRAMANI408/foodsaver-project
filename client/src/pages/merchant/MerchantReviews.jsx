import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { reviewService } from '../../services';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function MerchantReviews() {
  const { user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, total: 0 });

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await reviewService.getMerchantReviews(user._id);
      setReviews(res.data.data);
      
      if (res.data.data.length > 0) {
        const total = res.data.data.length;
        const sum = res.data.data.reduce((acc, r) => acc + r.rating, 0);
        setStats({ average: (sum / total).toFixed(1), total });
      }
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews ⭐</h1>
      </div>

      {stats.total > 0 && (
        <div className="card p-6 flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.average}</p>
            <div className="flex gap-1 justify-center my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= stats.average ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}`} />
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">Based on {stats.total} reviews</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-16 card">
            <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-800 dark:text-white">No reviews yet</p>
            <p className="text-slate-500">When customers review your food, they will appear here.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <img src={review.user?.avatar || 'https://via.placeholder.com/40'} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-400">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-slate-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-sm">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
