import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChefHat, MapPin, Users, Clock, Calendar, AlertCircle,
  CheckCircle, XCircle, Eye, X, Package, ChevronDown, ChevronUp,
  Phone, Mail, Utensils, Heart, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchMyRequirements,
  createRequirementThunk,
  acceptSponsorshipThunk,
  cancelRequirement as cancelReqThunk,
  clearMsg,
} from '../../redux/slices/requirementSlice';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Any Food'];
const FOOD_CATEGORIES = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Any Suitable Food'];
const NGO_TYPES = [
  { value: 'ngo', label: 'NGO' },
  { value: 'orphanage', label: 'Orphanage' },
  { value: 'old_age_home', label: 'Old Age Home' },
  { value: 'food_bank', label: 'Food Bank' },
  { value: 'shelter', label: 'Shelter' },
  { value: 'other', label: 'Other' },
];

const STATUS_META = {
  open: { label: 'Open', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle },
  partially_fulfilled: { label: 'Partially Fulfilled', color: 'text-amber-600 bg-amber-50', icon: ChefHat },
  fulfilled: { label: 'Fulfilled', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-500 bg-slate-100', icon: XCircle },
  expired: { label: 'Expired', color: 'text-red-500 bg-red-50', icon: AlertCircle },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function ProgressBar({ filled, total }) {
  const pct = Math.min(100, Math.round((filled / total) * 100));
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>{filled} / {total} meals fulfilled</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Sponsorship Card ─────────────────────────────────────────────────────────
function SponsorshipCard({ sp, reqId, onAccept, loading }) {
  const statusColors = {
    pending: 'text-amber-600 bg-amber-50',
    accepted: 'text-emerald-600 bg-emerald-50',
    rejected: 'text-red-500 bg-red-50',
    completed: 'text-blue-600 bg-blue-50',
  };
  return (
    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {sp.merchant?.businessName?.charAt(0) || 'M'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{sp.merchant?.businessName || 'Merchant'}</div>
        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />
          {sp.merchant?.address || 'Location not set'}
        </div>
        {sp.notes && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">"{sp.notes}"</p>}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-bold text-primary-600">{sp.quantityOffered} meals</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[sp.status] || ''}`}>
            {sp.status}
          </span>
        </div>
      </div>
      {sp.status === 'pending' && (
        <button
          onClick={() => onAccept(reqId, sp._id)}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
          Accept
        </button>
      )}
    </div>
  );
}

// ─── Requirement Card ─────────────────────────────────────────────────────────
function RequirementCard({ req, onAccept, loading }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[req.status] || STATUS_META.open;
  const Icon = meta.icon;

  return (
    <motion.div
      layout
      className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{req.mealType}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${meta.color}`}>
                <Icon className="w-3 h-3" />{meta.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-slate-500">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{req.peopleCount} people</span>
              <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{req.quantityRequired} meals</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{req.requiredTime} – {req.availableUntil}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />
                {new Date(req.requiredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-primary-600">{req.sponsorships?.length || 0}</div>
            <div className="text-xs text-slate-400">offers</div>
          </div>
        </div>

        <ProgressBar filled={req.quantityFulfilled || 0} total={req.quantityRequired} />

        {req.additionalRequirements && (
          <p className="text-xs text-slate-500 mt-2 italic">"{req.additionalRequirements}"</p>
        )}
      </div>

      {/* Expand toggle */}
      {req.sponsorships?.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors border-t border-slate-100 dark:border-dark-700"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'View'} {req.sponsorships.length} sponsorship offer{req.sponsorships.length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Sponsorships list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2 border-t border-slate-100 dark:border-dark-700 bg-slate-50 dark:bg-dark-800">
              {req.sponsorships.map((sp) => (
                <SponsorshipCard key={sp._id} sp={sp} reqId={req._id} onAccept={onAccept} loading={loading} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Create Requirement Modal ─────────────────────────────────────────────────
function CreateModal({ onClose, onSubmit, loading }) {
  const { user } = useSelector((s) => s.auth);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    addressText: user?.address || '',
    coordinates: '',
    peopleCount: '',
    quantityRequired: '',
    mealType: 'Lunch',
    foodCategory: 'Any Suitable Food',
    specificFood: '',
    requiredDate: dateStr,
    requiredTime: '12:30',
    availableUntil: '14:00',
    additionalRequirements: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.peopleCount || !form.quantityRequired || !form.requiredDate) {
      toast.error('Please fill all required fields');
      return;
    }
    // Convert time HH:MM to 12hr
    const to12 = (t) => {
      const [h, m] = t.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
    };
    onSubmit({ ...form, requiredTime: to12(form.requiredTime), availableUntil: to12(form.availableUntil) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Create Food Requirement</h2>
              <p className="text-xs text-slate-400">Nearby merchants will be notified instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Contact Name *</label>
                <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Contact Phone *</label>
                <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Location</h3>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Full Address *</label>
              <input value={form.addressText} onChange={(e) => set('addressText', e.target.value)} required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. 123 Main Road, Tiruchirappalli" />
            </div>
          </div>

          {/* Requirement Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Requirement Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Number of People *</label>
                <input type="number" min="1" value={form.peopleCount} onChange={(e) => set('peopleCount', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Meals Required *</label>
                <input type="number" min="1" value={form.quantityRequired} onChange={(e) => set('quantityRequired', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 100" />
              </div>
            </div>
          </div>

          {/* Meal Type */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Meal Type & Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Meal Type *</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_TYPES.map((t) => (
                    <button
                      key={t} type="button"
                      onClick={() => set('mealType', t)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        form.mealType === t
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-primary-400'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Food Category</label>
                <select value={form.foodCategory} onChange={(e) => set('foodCategory', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {FOOD_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Specific Food (optional)</label>
              <input value={form.specificFood} onChange={(e) => set('specificFood', e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. Rice, Sambar, Curry (leave blank for any food)" />
            </div>
          </div>

          {/* Timing */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Required Date *</label>
                <input type="date" value={form.requiredDate} onChange={(e) => set('requiredDate', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Required By *</label>
                <input type="time" value={form.requiredTime} onChange={(e) => set('requiredTime', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Available Until *</label>
                <input type="time" value={form.availableUntil} onChange={(e) => set('availableUntil', e.target.value)} required
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Additional Requirements</label>
            <textarea value={form.additionalRequirements} onChange={(e) => set('additionalRequirements', e.target.value)} rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="e.g. No onion/garlic, must be freshly cooked, packed in boxes..." />
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-100 dark:border-dark-700">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-dark-800 rounded-xl hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-emerald-600 rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
            {loading ? 'Notifying Merchants...' : 'Post Requirement'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HelpingCenterRequirements() {
  const dispatch = useDispatch();
  const { myRequirements, loading, error, successMsg } = useSelector((s) => s.requirements);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    dispatch(fetchMyRequirements());
  }, [dispatch]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearMsg()); }
    if (successMsg) { toast.success(successMsg); dispatch(clearMsg()); setShowModal(false); }
  }, [error, successMsg, dispatch]);

  const handleCreate = (formData) => {
    dispatch(createRequirementThunk(formData));
  };

  const handleAccept = (reqId, sponsId) => {
    dispatch(acceptSponsorshipThunk({ reqId, sponsId }));
  };

  const filtered = filterStatus === 'all'
    ? myRequirements
    : myRequirements.filter((r) => r.status === filterStatus);

  // Stats
  const totalReqs = myRequirements.length;
  const totalMeals = myRequirements.reduce((s, r) => s + (r.quantityRequired || 0), 0);
  const totalFulfilled = myRequirements.reduce((s, r) => s + (r.quantityFulfilled || 0), 0);
  const openReqs = myRequirements.filter((r) => ['open', 'partially_fulfilled'].includes(r.status)).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Food Requirements</h1>
          <p className="text-slate-500 text-sm mt-1">Post food needs and receive sponsorships from nearby merchants</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Requirement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: totalReqs, icon: Package, color: 'text-primary-600 bg-primary-50' },
          { label: 'Open / Active', value: openReqs, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'Meals Requested', value: totalMeals, icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Meals Fulfilled', value: totalFulfilled, icon: Heart, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-slate-100 dark:border-dark-700 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'open', 'partially_fulfilled', 'fulfilled', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${
              filterStatus === s
                ? 'bg-primary-600 text-white shadow'
                : 'bg-white dark:bg-dark-900 text-slate-500 border border-slate-200 dark:border-dark-700 hover:border-primary-400'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requirement list */}
      {loading && myRequirements.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No requirements yet</h3>
          <p className="text-slate-400 text-sm mb-6">Post your first food requirement and nearby merchants will get notified</p>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Requirement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <RequirementCard key={req._id} req={req} onAccept={handleAccept} loading={loading} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateModal onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={loading} />
        )}
      </AnimatePresence>
    </div>
  );
}
