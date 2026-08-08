import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Store, MapPin, Clock, Camera, Save, Phone, Mail, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile } from '../../redux/slices/authSlice';

export default function MerchantProfile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    businessName: '', businessType: '', address: '', phone: '', openingTime: '', closingTime: '', isOpen: false,
  });

  useEffect(() => {
    if (user) {
      setForm({
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        address: user.address || '',
        phone: user.phone || '',
        openingTime: user.openingTime || '',
        closingTime: user.closingTime || '',
        isOpen: user.isOpen || false,
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.payload || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Store Profile 🏪</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-dark-700">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center relative group overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-8 h-8 text-slate-400" />
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Store Logo</h3>
              <p className="text-sm text-slate-500">Update your store logo or banner</p>
            </div>
            <div className="ml-auto">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Store Status: {form.isOpen ? 'Open' : 'Closed'}</span>
                <div
                  onClick={() => setForm({ ...form, isOpen: !form.isOpen })}
                  className={`w-12 h-6 rounded-full transition-colors ${form.isOpen ? 'bg-primary-500' : 'bg-slate-300 dark:bg-dark-600'} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isOpen ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Business Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Business Type</label>
              <select value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })} className="input">
                <option value="restaurant">Restaurant</option>
                <option value="bakery">Bakery</option>
                <option value="supermarket">Supermarket</option>
                <option value="cafe">Cafe</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email Address (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={user?.email || ''} readOnly className="input pl-10 bg-slate-50 dark:bg-dark-800 text-slate-500" />
              </div>
            </div>
            <div>
              <label className="label">Opening Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} className="input pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Closing Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} className="input pl-10" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-dark-700">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
