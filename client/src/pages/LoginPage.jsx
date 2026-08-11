import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Eye, EyeOff, Mail, Lock, User, Phone, Store, Truck, Heart, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, googleLogin } from '../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string(),
});

const ROLES = [
  { value: 'user', label: 'Customer', icon: User, color: 'from-primary-500 to-primary-600', desc: 'Buy discounted food' },
  { value: 'merchant', label: 'Merchant', icon: Store, color: 'from-accent-500 to-orange-500', desc: 'Sell leftover food' },
  { value: 'helping_center', label: 'NGO / Center', icon: Heart, color: 'from-pink-500 to-rose-500', desc: 'Accept donations' },
  { value: 'admin', label: 'Admin', icon: Leaf, color: 'from-purple-500 to-purple-600', desc: 'Manage platform' },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading, error, isAuthenticated, role } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: 'user' },
  });

  useEffect(() => {
    if (isAuthenticated && role) {
      const paths = { admin: '/admin', merchant: '/merchant', helping_center: '/helping-center', user: '/dashboard' };
      navigate(paths[role] || '/dashboard');
    }
  }, [isAuthenticated, role, navigate]);

  const handleRoleSelect = (r) => {
    setSelectedRole(r);
    setValue('role', r);
    
    const credentials = {
      user: { email: 'customer1@example.com', password: 'password123' },
      merchant: { email: 'merchant1@example.com', password: 'password123' },
      helping_center: { email: 'ngo1@example.com', password: 'password123' },
      admin: { email: 'admin@example.com', password: 'password123' },
    };
    
    if (credentials[r]) {
      setValue('email', credentials[r].email);
      setValue('password', credentials[r].password);
    }
  };
  const onSubmit = async (data) => {
    const result = await dispatch(login({ ...data, role: selectedRole }));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back! 🎉');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await dispatch(googleLogin({ token: credentialResponse.credential, role: selectedRole })).unwrap();
      toast.success('Logged in successfully!');
    } catch (err) {
      toast.error(err || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${150 + i * 60}px`,
                height: `${150 + i * 60}px`,
                background: `radial-gradient(circle, ${i % 2 ? '#22c55e' : '#f97316'}, transparent)`,
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col justify-center px-14 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-glow-green">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-black text-2xl">SaveBite</span>
          </div>
          <h2 className="font-display text-4xl font-bold mb-4 leading-tight">
            Fight Food Waste,<br />Save Money 🌱
          </h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Join thousands of merchants and customers making a difference — one meal at a time.
          </p>
          {[
            { emoji: '🍛', text: '12,450 kg food saved this week' },
            { emoji: '💰', text: '₹2.4 Cr saved by customers' },
            { emoji: '🤝', text: '1,200+ merchants onboard' },
            { emoji: '🌍', text: '31 tonnes CO₂ reduced' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3 mb-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-white/80 text-sm">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-dark-950">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">SaveBite</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back! 👋</h1>
            <p className="text-slate-500 dark:text-slate-400">Sign in to your SaveBite account</p>
          </div>

          {/* Role Selector */}
          <div className="mb-6">
            <label className="label">Sign in as</label>
            <div className="grid grid-cols-5 gap-2">
              {ROLES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRoleSelect(value)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 ${
                    selectedRole === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50'
                      : 'border-slate-200 dark:border-dark-600 hover:border-slate-300 dark:hover:border-dark-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 leading-tight text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Google Auth */}
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              useOneTap
              theme="outline"
              shape="pill"
              text="continue_with"
              size="large"
            />
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-dark-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 dark:bg-dark-950 text-slate-400">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-primary-500" />
                <span className="text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-dark-700" />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
