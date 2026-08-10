import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, MapPin, Leaf, ArrowRight, Star, ChevronDown, TrendingDown,
  Users, Store, Truck, Heart, Zap, Shield, Clock, Tag, Award,
  BarChart3, Droplets, Wind,
} from 'lucide-react';
import { fetchTrending } from '../redux/slices/foodSlice';

const STATS = [
  { label: 'Food Saved', value: '12,450 kg', icon: Leaf, color: 'from-primary-500 to-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/50' },
  { label: 'Meals Served', value: '48,200', icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50 dark:bg-pink-950/50' },
  { label: 'Merchants', value: '1,200+', icon: Store, color: 'from-accent-500 to-orange-500', bg: 'bg-accent-50 dark:bg-accent-950/50' },
  { label: 'CO₂ Reduced', value: '31 Tonnes', icon: Wind, color: 'from-sky-500 to-blue-500', bg: 'bg-sky-50 dark:bg-sky-950/50' },
];

const FEATURES = [
  { icon: Tag, title: 'Dynamic Discounts', desc: 'Smart pricing that increases discounts as expiry approaches — up to 80% off!', color: 'text-primary-500' },
  { icon: MapPin, title: 'Nearby Food', desc: 'Find discounted meals from restaurants, bakeries & supermarkets near you.', color: 'text-accent-500' },
  { icon: Clock, title: 'Real-time Updates', desc: 'Live stock updates via WebSocket so you never miss a deal.', color: 'text-sky-500' },
  { icon: Heart, title: 'Food Donations', desc: 'Unsold food is automatically donated to verified NGOs and helping centers.', color: 'text-pink-500' },
  { icon: Shield, title: 'Secure & Verified', desc: 'All merchants are verified. Payments secured with Razorpay & Stripe.', color: 'text-purple-500' },
  { icon: Zap, title: 'Instant Booking', desc: 'Reserve food instantly. Pay online or at pickup — your choice.', color: 'text-yellow-500' },
];

const CATEGORIES = [
  { name: 'Meals', emoji: '🍛', count: 240, color: 'from-orange-400 to-orange-600' },
  { name: 'Bakery', emoji: '🥐', count: 180, color: 'from-amber-400 to-amber-600' },
  { name: 'Snacks', emoji: '🍿', count: 320, color: 'from-yellow-400 to-yellow-600' },
  { name: 'Beverages', emoji: '☕', count: 150, color: 'from-brown-400 to-amber-700' },
  { name: 'Desserts', emoji: '🍰', count: 200, color: 'from-pink-400 to-pink-600' },
  { name: 'Fruits', emoji: '🍎', count: 90, color: 'from-green-400 to-green-600' },
  { name: 'Vegetables', emoji: '🥦', count: 75, color: 'from-emerald-400 to-emerald-600' },
  { name: 'Dairy', emoji: '🥛', count: 60, color: 'from-sky-400 to-sky-600' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search Nearby Food', desc: 'Browse discounted food from restaurants, bakeries, and supermarkets near you.', icon: Search },
  { step: '02', title: 'Pick Your Meal', desc: 'Choose from hundreds of discounted items updated in real time.', icon: Tag },
  { step: '03', title: 'Pay & Collect', desc: 'Pay securely online or cash on pickup. Collect your order before expiry.', icon: Zap },
  { step: '04', title: 'Save & Impact', desc: 'Track your savings, food rescued, and CO₂ emissions reduced.', icon: BarChart3 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { trending } = useSelector((s) => s.food);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchTrending());
  }, [dispatch]);

  // Scroll to #impact section if navigated via hash link
  useEffect(() => {
    if (location.hash === '#impact') {
      setTimeout(() => {
        document.getElementById('impact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="overflow-x-hidden">
      {/* === HERO SECTION === */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full mix-blend-screen opacity-10"
              style={{
                width: `${200 + i * 80}px`,
                height: `${200 + i * 80}px`,
                background: i % 2 === 0 ? 'radial-gradient(circle, #22c55e, transparent)' : 'radial-gradient(circle, #f97316, transparent)',
                left: `${10 + i * 15}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
                y: [0, -20 * (i % 2 === 0 ? 1 : -1), 0],
              }}
              transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2322c55e%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
              🌍 Fight Food Waste. Save Money. Help Others.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-tight"
          >
            Turn Leftover Food
            <br />
            Into{' '}
            <span className="gradient-text">Amazing Deals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            SaveBite connects you with restaurants, bakeries & supermarkets selling
            quality food at up to <strong className="text-primary-400">80% discount</strong> before it goes to waste.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
              <MapPin className="w-5 h-5 text-primary-400 ml-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your location or search food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
              />
              <Link
                to={`/food?search=${searchQuery}`}
                className="btn-primary btn-sm"
              >
                <Search className="w-4 h-4" />
                Find Food
              </Link>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/food" className="btn bg-primary-500 hover:bg-primary-400 text-white btn-lg shadow-glow-green">
              <Search className="w-5 h-5" /> Explore Food Deals
            </Link>
            <Link to="/register?role=merchant" className="btn border-2 border-white/30 text-white hover:bg-white/10 btn-lg backdrop-blur-sm">
              <Store className="w-5 h-5" /> Register as Merchant
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-16 flex flex-col items-center gap-2 text-slate-400"
          >
            <span className="text-xs">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </section>

      {/* === STATS SECTION === */}
      <section className="py-16 bg-white dark:bg-dark-900 border-y border-slate-100 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants} className="text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="font-display text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === CATEGORIES SECTION === */}
      <section className="py-20 bg-slate-50 dark:bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Browse by <span className="gradient-text">Category</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Find discounted food across all categories from restaurants and local vendors near you.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.name)}
                className={`cursor-pointer text-center p-4 rounded-2xl transition-all duration-200 ${
                  activeCategory === cat.name
                    ? 'bg-primary-50 dark:bg-primary-950/50 border-2 border-primary-400'
                    : 'card hover:shadow-card-hover'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mx-auto mb-2 shadow-md`}>
                  {cat.emoji}
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{cat.name}</div>
                <div className="text-xs text-slate-400">{cat.count}+ items</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-8">
            <Link to={`/food${activeCategory ? `?category=${activeCategory.toLowerCase()}` : ''}`} className="btn-primary">
              View All Food <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="py-20 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              How <span className="gradient-text">SaveBite Works</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Simple, fast, and impactful — in four steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 opacity-30" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg relative">
                  <step.icon className="w-7 h-7 text-white" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-dark-900 border-2 border-primary-500 rounded-full text-[10px] font-bold text-primary-400 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES SECTION === */}
      <section className="py-20 bg-slate-50 dark:bg-dark-950" id="impact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose <span className="gradient-text">SaveBite</span>?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Built for impact — platform designed to maximize food saved and maximize your savings
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feat) => (
              <motion.div
                key={feat.title}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="card p-6 hover:shadow-card-hover transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-dark-700 flex items-center justify-center mb-4`}>
                  <feat.icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* === IMPACT COUNTER SECTION === */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M10%200L0%2010l10%2010%2010-10z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-5xl font-black mb-6"
          >
            Together, we've made a real impact 🌱
          </motion.h2>
          <p className="text-white/80 text-lg mb-10">
            Every meal saved is a step towards a more sustainable world. Join our growing community.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-slate-50 btn-lg font-bold shadow-xl">
              Join SaveBite Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/food" className="btn border-2 border-white/50 text-white hover:bg-white/10 btn-lg">
              Browse Deals
            </Link>
          </div>
        </div>
      </section>

      {/* === PARTNER SECTION === */}
      <section className="py-16 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold">Trusted By</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 dark:opacity-30">
            {['🍕 PizzaHut', '☕ Starbucks', '🥐 Paris Bakery', '🛒 Big Bazaar', '🍣 Sushi Garden', '🥗 Greens Co.'].map((brand) => (
              <div key={brand} className="text-lg font-bold text-slate-600 dark:text-slate-400">{brand}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
