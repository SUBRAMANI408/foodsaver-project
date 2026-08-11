import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Eye, EyeOff, Mail, Lock, User, Phone, Store, Truck, Heart, ChevronRight, Building, MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { register as registerUser, googleLogin } from '../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const baseSchema = {
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
};

const userSchema = z.object({ ...baseSchema, role: z.string() }).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const merchantSchema = z.object({
  ...baseSchema,
  businessName: z.string().min(2, 'Business name required'),
  businessType: z.string().min(1, 'Business type required'),
  address: z.string().min(5, 'Address required'),
  openingTime: z.string().min(1, 'Opening time required'),
  closingTime: z.string().min(1, 'Closing time required'),
  role: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

const ROLES = [
  { value: 'user', label: 'Customer', icon: User, desc: 'Buy discounted food near you', color: 'from-primary-500 to-primary-600' },
  { value: 'merchant', label: 'Merchant', icon: Store, desc: 'Sell leftover food & increase revenue', color: 'from-accent-500 to-orange-500' },
  { value: 'helping_center', label: 'NGO / Helping Center', icon: Heart, desc: 'Accept food donations', color: 'from-pink-500 to-rose-500' },
];

const BUSINESS_TYPES = ['restaurant', 'bakery', 'hotel', 'supermarket', 'cafe', 'food_vendor', 'other'];
const VEHICLE_TYPES = ['bicycle', 'motorcycle', 'car', 'van'];
const CENTER_TYPES = ['ngo', 'orphanage', 'old_age_home', 'food_bank', 'shelter', 'other'];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading } = useSelector((s) => s.auth);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'user');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const getSchema = () => selectedRole === 'merchant' ? merchantSchema : userSchema;

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: { role: selectedRole },
  });

  const handleRoleChange = (r) => {
    setSelectedRole(r);
    setValue('role', r);
    reset();
  };

  const onSubmit = async (data) => {
    const { confirmPassword, ...submitData } = data;
    submitData.role = selectedRole;
    // For merchant, set default location (would use geolocation in production)
    if (selectedRole === 'merchant') {
      submitData.location = { type: 'Point', coordinates: [77.5946, 12.9716] }; // Bangalore default
    }
    if (selectedRole === 'helping_center') {
      submitData.centerName = submitData.businessName || submitData.name;
      submitData.centerType = submitData.businessType || 'ngo';
    }

    const result = await dispatch(registerUser(submitData));
    if (registerUser.fulfilled.match(result)) {
      setDevOtp(result.payload.otp || '');
      setOtpSent(true);
      toast.success('Account created! Please verify your OTP.');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleLogin({ token: credentialResponse.credential, role: selectedRole })).unwrap();
      toast.success('Registration/Login successful! 🎉');
    } catch (err) {
      toast.error(err || 'Google auth failed');
    }
  };

  if (otpSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Verify Your Account</h2>
          <p className="text-slate-400 text-sm mb-6">Enter the 6-digit OTP sent to your email/phone.</p>
          {devOtp && (
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl p-3 mb-4 text-sm">
              <span className="text-yellow-700 dark:text-yellow-400 font-medium">Dev OTP:</span>{' '}
              <span className="font-mono font-bold text-yellow-800 dark:text-yellow-300">{devOtp}</span>
            </div>
          )}
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="input text-center text-2xl font-mono tracking-widest mb-4"
          />
          <button
            onClick={() => {
              toast.success('Account verified! Welcome to SaveBite 🎉');
              const paths = { admin: '/admin', merchant: '/merchant', helping_center: '/helping-center', user: '/dashboard' };
              navigate(paths[selectedRole] || '/dashboard');
            }}
            disabled={otp.length !== 6}
            className="btn-primary w-full btn-lg"
          >
            Verify & Continue
          </button>
          <button onClick={() => setOtpSent(false)} className="btn-ghost mt-3 w-full text-sm">
            ← Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">SaveBite</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-slate-500 dark:text-slate-400">Join thousands making a difference</p>
        </div>

        {/* Role Selector */}
        <div className="card p-6 mb-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">I want to join as...</h3>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, icon: Icon, desc, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  selectedRole === value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50'
                    : 'border-slate-200 dark:border-dark-600 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card p-6">
          {/* Google Auth */}
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google registration failed')}
              useOneTap
              theme="outline"
              shape="pill"
              text="signup_with"
              size="large"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-dark-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-900 text-slate-400">or register with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('name')} placeholder="John Doe" className={`input pl-10 ${errors.name ? 'input-error' : ''}`} />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register('phone')} placeholder="+91 98765 43210" className={`input pl-10 ${errors.phone ? 'input-error' : ''}`} />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('email')} type="email" placeholder="you@example.com" className={`input pl-10 ${errors.email ? 'input-error' : ''}`} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Merchant Extra Fields */}
            <AnimatePresence>
              {selectedRole === 'merchant' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Business Name</label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input {...register('businessName')} placeholder="My Restaurant" className={`input pl-10 ${errors.businessName ? 'input-error' : ''}`} />
                      </div>
                      {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                    </div>
                    <div>
                      <label className="label">Business Type</label>
                      <select {...register('businessType')} className="input">
                        <option value="">Select type...</option>
                        {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Business Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input {...register('address')} placeholder="123 MG Road, Bengaluru" className={`input pl-10 ${errors.address ? 'input-error' : ''}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Opening Time</label>
                      <input {...register('openingTime')} type="time" className="input" defaultValue="09:00" />
                    </div>
                    <div>
                      <label className="label">Closing Time</label>
                      <input {...register('closingTime')} type="time" className="input" defaultValue="22:00" />
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedRole === 'helping_center' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Center Name</label>
                      <input {...register('centerName')} placeholder="Helping Hands NGO" className="input" />
                    </div>
                    <div>
                      <label className="label">Center Type</label>
                      <select {...register('centerType')} className="input">
                        <option value="">Select type...</option>
                        {CENTER_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ').charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label">Address</label>
                      <input {...register('address')} placeholder="Center address" className="input" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" required id="terms" className="w-4 h-4 accent-primary-500" />
              <label htmlFor="terms" className="text-sm text-slate-500 dark:text-slate-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full btn-lg">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ChevronRight className="w-4 h-4" /></>}
            </button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
