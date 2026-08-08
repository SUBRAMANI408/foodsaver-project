import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-slate-300 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-glow-green">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl gradient-text">SaveBite</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Reducing food waste, one meal at a time. Join thousands of merchants and food lovers making a difference.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Find Food', 'Merchants', 'How It Works', 'Impact', 'Blog'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-slate-400 hover:text-primary-400 flex items-center gap-1 transition-colors group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Join As */}
          <div>
            <h4 className="font-semibold text-white mb-4">Join As</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Customer', to: '/register' },
                { label: 'Restaurant / Merchant', to: '/register?role=merchant' },
                { label: 'Delivery Partner', to: '/register?role=delivery_partner' },
                { label: 'NGO / Helping Center', to: '/register?role=helping_center' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-400 hover:text-primary-400 flex items-center gap-1 transition-colors group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              {[
                { icon: Mail, text: 'hello@savebite.in' },
                { icon: Phone, text: '+91 98765 43210' },
                { icon: MapPin, text: 'Bengaluru, India' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-dark-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-400" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-8 border-t border-dark-800">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto text-center sm:text-left">
            <div className="flex-1">
              <h4 className="font-semibold text-white">Stay updated</h4>
              <p className="text-sm text-slate-400">Get notified about flash sales and new merchants near you</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input type="email" placeholder="Enter your email" className="input flex-1 sm:w-60 bg-dark-800 border-dark-700 text-slate-300 placeholder-slate-500" />
              <button className="btn-primary whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-5 border-t border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SaveBite. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link key={item} to="/" className="hover:text-slate-300 transition-colors">{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
