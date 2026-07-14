import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-rose-100/30 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-rose-50/50 dark:border-slate-700/50 pb-8">
          
          {/* Col 1: Company Profile */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl text-white shadow-md transition-transform group-hover:scale-105">
                <ShoppingBag size={18} />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-purple-600 dark:from-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
                Sakhi Bazaar
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering rural women micro-entrepreneurs through generative technology and direct-to-consumer digital commerce. Together, we elevate traditional crafts, organic foods, and local arts.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4 pt-1">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-xl transition-colors border border-slate-100 dark:border-slate-700/50">
                <Facebook size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-xl transition-colors border border-slate-100 dark:border-slate-700/50">
                <Instagram size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded-xl transition-colors border border-slate-100 dark:border-slate-700/50">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
              Get in Touch
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-rose-500" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-rose-500" />
                <span>support@sakhibazaar.org</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-rose-500" />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">
              Information
            </h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="text-slate-500 dark:text-slate-400 hover:text-rose-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400">
          <span>&copy; {new Date().getFullYear()} Sakhi Bazaar. All rights reserved.</span>
          <div className="flex space-x-4">
            <Link to="/privacy-policy" className="hover:text-rose-500 transition-colors">Privacy Policy</Link>
            <span>&middot;</span>
            <Link to="/terms-conditions" className="hover:text-rose-500 transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
