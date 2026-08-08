import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center shadow-glow-green animate-bounce-slow">
            <Leaf className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="font-display text-8xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Page not found</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          Oops! It seems like this page got lost in transit. Don't worry, there's plenty of amazing food waiting for you back home.
        </p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={() => window.history.back()} className="btn border-2 border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-300 hover:border-primary-500 hover:text-primary-600">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <Link to="/" className="btn-primary">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
