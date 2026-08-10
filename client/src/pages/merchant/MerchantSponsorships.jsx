import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Users, Clock, Calendar, Utensils, Heart, Loader2,
  CheckCircle, AlertCircle, Package, X, Star, ChefHat,
  History, ArrowRight, Tag, Edit3, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchNearbyRequirements,
  fetchMySponsorships,
  submitSponsorshipThunk,
  editSponsorshipThunk,
  clearMsg,
} from '../../redux/slices/requirementSlice';
import { fetchMerchantFood } from '../../redux/slices/foodSlice';

const STATUS_COLORS = {
  open: 'text-emerald-600 bg-emerald-50',
  partially_fulfilled: 'text-amber-600 bg-amber-50',
  fulfilled: 'text-blue-600 bg-blue-50',
  cancelled: 'text-slate-500 bg-slate-100',
  expired: 'text-red-500 bg-red-50',
};

const SPONS_STATUS_COLORS = {
  pending: 'text-amber-600 bg-amber-50',
  accepted: 'text-emerald-600 bg-emerald-50',
  rejected: 'text-red-500 bg-red-50',
  completed: 'text-blue-600 bg-blue-50',
};

function SponsorModal({ requirement, onClose, onSubmit, loading, initialData = null }) {
  const dispatch = useDispatch();
  const merchantFoods = useSelector((s) => s.food.merchantItems || []);

  useEffect(() => {
    dispatch(fetchMerchantFood());
  }, [dispatch]);

  const [selectedFoodId, setSelectedFoodId] = useState(initialData?.foodItems?.[0]?.foodId || '');
  const [qty, setQty] = useState(initialData ? initialData.quantityOffered : '');
  const [discountPercentage, setDiscountPercentage] = useState(initialData?.foodItems?.[0]?.discountPercentage || 0);
  const [notes, setNotes] = useState(initialData ? initialData.notes : '');

  const baseRemaining = requirement.remaining ?? (requirement.quantityRequired - (requirement.quantityFulfilled || 0));
  const remainingReq = initialData ? baseRemaining + initialData.quantityOffered : baseRemaining;

  const selectedFood = merchantFoods.find(f => f._id === selectedFoodId);
  const maxAvailable = selectedFood ? selectedFood.availableQuantity : 0;
  const maxQty = Math.min(remainingReq, maxAvailable || Infinity);

  const presets = [
    Math.min(maxQty, 25),
    Math.min(maxQty, 50),
    Math.min(maxQty, 75),
    maxQty,
  ].filter((v, i, a) => v > 0 && a.indexOf(v) === i && selectedFood);

  const finalPricePerUnit = selectedFood ? (selectedFood.price - (selectedFood.price * (discountPercentage / 100))) : 0;
  const totalAmount = finalPricePerUnit * (parseInt(qty) || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFoodId) { toast.error('Please select a food item'); return; }
    if (!qty || parseInt(qty) < 1) { toast.error('Please enter valid quantity'); return; }
    
    onSubmit(requirement._id, { 
      quantityOffered: parseInt(qty), 
      notes,
      foodItems: [{
        foodId: selectedFood._id,
        name: selectedFood.name,
        quantity: parseInt(qty),
        discountPercentage: Number(discountPercentage)
      }]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-dark-900 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {initialData ? 'Edit Sponsorship' : 'Sponsor this Requirement'}
              </h2>
              <p className="text-xs text-slate-400">{requirement.ngoName || requirement.contactName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Requirement summary */}
        <div className="mx-6 mt-4 p-4 bg-slate-50 dark:bg-dark-800 rounded-xl text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Meal type</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{requirement.mealType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total required</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{requirement.quantityRequired} meals</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Still needed</span>
            <span className="font-bold text-primary-600">{baseRemaining} meals</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Required by</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{requirement.requiredTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Location</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 text-right max-w-[60%]">{requirement.addressText}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Select Food Item</label>
            <select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">-- Choose a food item --</option>
              {merchantFoods.map(food => (
                <option key={food._id} value={food._id}>
                  {food.name} (Qty: {food.availableQuantity}, Price: ₹{food.price})
                </option>
              ))}
            </select>
            {selectedFood && (
              <div className="mt-2 text-xs text-slate-500">
                Available: <span className="font-semibold">{selectedFood.availableQuantity}</span> | 
                Original Price: <span className="font-semibold">₹{selectedFood.price}/unit</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">How many meals can you sponsor?</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => setQty(String(p))}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    qty === String(p)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-primary-400'
                  }`}>
                  {p} meals
                </button>
              ))}
            </div>
            <input
              type="number" min="1" max={maxQty} value={qty} onChange={(e) => setQty(e.target.value)} required
              disabled={!selectedFood}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              placeholder={selectedFood ? `Enter quantity (max: ${maxQty})` : "Select a food item first"}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Discount Percentage (%)</label>
            <input
              type="number" min="0" max="100" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)}
              disabled={!selectedFood}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              placeholder="e.g. 10"
            />
          </div>

          {selectedFood && (
            <div className="p-3 bg-slate-50 dark:bg-dark-800 rounded-xl text-sm border border-slate-100 dark:border-dark-700">
              <div className="flex justify-between mb-1">
                <span className="text-slate-500">Final Price per Unit:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">₹{finalPricePerUnit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-primary-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="e.g. I will sponsor 50 meals of Veg Biryani, freshly cooked..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 dark:bg-dark-800 rounded-xl hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-emerald-600 rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              {loading ? 'Submitting...' : (initialData ? 'Update Offer' : 'Confirm Sponsorship')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RequirementCard({ req, onSponsor }) {
  const remaining = req.remaining ?? (req.quantityRequired - (req.quantityFulfilled || 0));
  const pct = Math.min(100, Math.round(((req.quantityFulfilled || 0) / req.quantityRequired) * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-sm overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">{req.ngoName || req.contactName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status] || ''}`}>
                {req.status?.replace('_', ' ')}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{req.mealType}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{req.peopleCount} people</span>
              <span className="flex items-center gap-1"><Utensils className="w-3.5 h-3.5" />{req.quantityRequired} meals</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{req.requiredTime} – {req.availableUntil}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(req.requiredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.addressText}</span>
            </div>
            {req.specificFood && (
              <div className="mt-1.5 text-xs text-slate-500 italic">Specific: {req.specificFood}</div>
            )}
            {req.additionalRequirements && (
              <div className="mt-1 text-xs text-slate-400 italic">"{req.additionalRequirements}"</div>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-amber-500">{remaining}</div>
            <div className="text-xs text-slate-400">meals needed</div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>{req.quantityFulfilled || 0} / {req.quantityRequired} meals fulfilled</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7 }}
            />
          </div>
        </div>

        {req.alreadySponsored ? (
          <div className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            You already submitted a sponsorship offer
          </div>
        ) : remaining > 0 ? (
          <button
            onClick={() => onSponsor(req)}
            className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-emerald-600 rounded-xl hover:from-primary-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Sponsor this Requirement
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl">
            <CheckCircle className="w-4 h-4" />
            Fully Fulfilled
          </div>
        )}
      </div>
    </motion.div>
  );
}

function SponsorshipHistoryCard({ sp, onEdit, onOpenChat }) {
  const req = sp.requirement;
  return (
    <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{req?.ngoName || req?.contactName || 'NGO'}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SPONS_STATUS_COLORS[sp.status] || ''}`}>
              {sp.status}
            </span>
          </div>
          {req && (
            <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
              <span>{req.mealType}</span>
              <span>•</span>
              <span className="truncate max-w-[200px]">{req.addressText}</span>
              <span>•</span>
              <span>{new Date(req.requiredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
          {sp.notes && <p className="text-xs text-slate-500 italic mt-1">"{sp.notes}"</p>}
          
          {/* Food items */}
          {sp.foodItems && sp.foodItems.length > 0 && (
            <div className="mt-2 space-y-1">
              {sp.foodItems.map((item, i) => (
                <div key={i} className="text-xs text-slate-500 flex items-center gap-1">
                  <Utensils className="w-3 h-3" />{item.quantity} {item.unit} – {item.name}
                </div>
              ))}
            </div>
          )}

          {/* Rejection reason */}
          {sp.status === 'rejected' && sp.rejectionReason && (
            <div className="mt-1 text-xs text-red-500 italic">Reason: {sp.rejectionReason}</div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-xl font-bold text-primary-600">{sp.quantityOffered}</div>
            <div className="text-xs text-slate-400">meals</div>
          </div>
          
          {sp.status === 'pending' && (
            <button onClick={() => onEdit(sp)}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-1 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-semibold rounded-lg transition-colors">
              <Edit3 className="w-3 h-3" /> Edit Offer
            </button>
          )}

          {sp.status === 'accepted' && sp.chatEnabled && (
            <button onClick={() => onOpenChat(sp.conversationId)}
              className="flex items-center gap-1.5 px-3 py-1.5 mt-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors">
              <MessageCircle className="w-3 h-3" /> Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MerchantSponsorships() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { nearbyRequirements, mySponsorships, loading, error, successMsg } = useSelector((s) => s.requirements);
  const [activeTab, setActiveTab] = useState('nearby');
  const [sponsorTarget, setSponsorTarget] = useState(null); // specific requirement
  const [editTarget, setEditTarget] = useState(null); // specific sponsorship

  useEffect(() => {
    dispatch(fetchNearbyRequirements());
    dispatch(fetchMySponsorships());
  }, [dispatch]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearMsg()); }
    if (successMsg) { 
      toast.success(successMsg); 
      dispatch(clearMsg()); 
      setSponsorTarget(null);
      setEditTarget(null);
    }
  }, [error, successMsg, dispatch]);

  const handleOpenChat = (convId) => {
    navigate(`/merchant/chat?conv=${convId}`);
  };

  const handleSponsor = (reqId, data) => {
    dispatch(submitSponsorshipThunk({ reqId, data }));
  };

  const handleEditSponsor = (reqId, data) => {
    dispatch(editSponsorshipThunk({ reqId, data }));
  };

  const openReqs = nearbyRequirements.filter((r) => ['open', 'partially_fulfilled'].includes(r.status));
  const totalMealsSponsored = mySponsorships.reduce((s, sp) => s + (sp.quantityOffered || 0), 0);
  const acceptedSpons = mySponsorships.filter((sp) => sp.status === 'accepted').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">NGO Sponsorships</h1>
        <p className="text-slate-500 text-sm mt-1">View nearby NGO food requirements and sponsor meals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open Requests Nearby', value: openReqs.length, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
          { label: 'My Sponsorships', value: mySponsorships.length, icon: Heart, color: 'text-rose-600 bg-rose-50' },
          { label: 'Accepted Offers', value: acceptedSpons, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Meals Sponsored', value: totalMealsSponsored, icon: Utensils, color: 'text-primary-600 bg-primary-50' },
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

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl w-fit">
        {[
          { key: 'nearby', label: 'Nearby Requirements', icon: MapPin },
          { key: 'history', label: 'My Sponsorships', icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-dark-900 text-primary-600 shadow'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && nearbyRequirements.length === 0 && mySponsorships.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : activeTab === 'nearby' ? (
        openReqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="w-10 h-10 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No nearby requirements</h3>
            <p className="text-slate-400 text-sm">There are no open NGO food requests in your area right now</p>
          </div>
        ) : (
          <div className="space-y-4">
            {openReqs.map((req) => (
              <RequirementCard key={req._id} req={req} onSponsor={setSponsorTarget} />
            ))}
          </div>
        )
      ) : (
        mySponsorships.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No sponsorships yet</h3>
            <p className="text-slate-400 text-sm">Go to "Nearby Requirements" and help an NGO by sponsoring meals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mySponsorships.map((sp) => (
              <SponsorshipHistoryCard 
                key={sp._id} 
                sp={sp} 
                onEdit={setEditTarget}
                onOpenChat={handleOpenChat}
              />
            ))}
          </div>
        )
      )}

      {/* Sponsor Modal */}
      <AnimatePresence>
        {sponsorTarget && (
          <SponsorModal
            requirement={sponsorTarget}
            onClose={() => setSponsorTarget(null)}
            onSubmit={handleSponsor}
            loading={loading}
          />
        )}
        {editTarget && editTarget.requirement && (
          <SponsorModal
            requirement={editTarget.requirement}
            initialData={editTarget}
            onClose={() => setEditTarget(null)}
            onSubmit={handleEditSponsor}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
