import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyRequirements } from '../../redux/slices/requirementSlice';
import { BarChart3, Heart, Target, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function HelpingCenterReports() {
  const dispatch = useDispatch();
  const { myRequirements, loading } = useSelector((s) => s.requirements);

  useEffect(() => {
    dispatch(fetchMyRequirements());
  }, [dispatch]);

  const stats = useMemo(() => {
    if (!myRequirements) return { total: 0, fulfilled: 0, open: 0, mealsRequested: 0, mealsFulfilled: 0 };
    
    let fulfilled = 0;
    let open = 0;
    let mealsRequested = 0;
    let mealsFulfilled = 0;

    myRequirements.forEach(req => {
      mealsRequested += req.quantityRequired || 0;
      mealsFulfilled += req.quantityFulfilled || 0;
      if (req.status === 'fulfilled') fulfilled++;
      else if (req.status === 'open' || req.status === 'partially_fulfilled') open++;
    });

    return {
      total: myRequirements.length,
      fulfilled,
      open,
      mealsRequested,
      mealsFulfilled,
      fulfillmentRate: mealsRequested > 0 ? Math.round((mealsFulfilled / mealsRequested) * 100) : 0
    };
  }, [myRequirements]);

  if (loading && myRequirements.length === 0) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Impact Reports</h1>
          <p className="text-sm text-slate-500">Track your requirements and fulfilled sponsorships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-primary-900/10 dark:to-emerald-900/10 border-primary-100 dark:border-primary-900/20">
          <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center mb-4">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requirements</p>
          <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/20">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active & Open</p>
          <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">{stats.open}</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-100 dark:border-emerald-900/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fully Fulfilled</p>
          <p className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-1">{stats.fulfilled}</p>
        </div>

        <div className="card p-5 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 border-rose-100 dark:border-rose-900/20">
          <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-4">
            <Heart className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Fulfillment Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.fulfillmentRate}%</p>
            <span className="text-sm text-slate-500">({stats.mealsFulfilled} / {stats.mealsRequested} meals)</span>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Recent Requirements Summary</h3>
        {myRequirements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-dark-800 text-slate-500">
                <tr>
                  <th className="p-3 rounded-l-lg font-medium">Meal Type</th>
                  <th className="p-3 font-medium">Required Date</th>
                  <th className="p-3 font-medium">Target People</th>
                  <th className="p-3 font-medium">Meals</th>
                  <th className="p-3 rounded-r-lg font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                {myRequirements.slice(0, 10).map((req) => (
                  <tr key={req._id}>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{req.mealType}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {req.requiredDate ? new Date(req.requiredDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{req.peopleCount}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {req.quantityFulfilled || 0} / {req.quantityRequired}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'open' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'partially_fulfilled' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500">
            No requirements posted yet.
          </div>
        )}
      </div>
    </div>
  );
}
