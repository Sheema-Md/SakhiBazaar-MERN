import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, LogOut, LayoutDashboard, PlusCircle, MessageSquare, ShoppingCart, Globe } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl text-white shadow-md shadow-rose-200 transition-all duration-300 group-hover:scale-105">
              <ShoppingBag size={20} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              Sakhi Bazaar
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
              <Globe size={14} className="text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
                <option value="ta">தமிழ்</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="mr">मराठी</option>
                <option value="bn">বাংলা</option>
                <option value="gu">ગુજરાતી</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            <Link 
              to="/" 
              className="text-gray-800 dark:text-white hover:text-rose-600 px-3 py-2 rounded-lg text-base font-bold transition-colors"
            >
              {t('browse')}
            </Link>
 
            {user && (
              <Link 
                to="/chat" 
                className="text-gray-800 dark:text-white hover:text-rose-600 px-3 py-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare size={18} />
                <span>{t('inbox')}</span>
              </Link>
            )}

            <Link 
              to="/cart" 
              className="text-gray-800 dark:text-white hover:text-rose-600 p-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors relative"
              title={t('shoppingCart')}
            >
              <ShoppingCart size={20} />
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm border border-white">
                  {getCartCount()}
                </span>
              )}
            </Link>
 
            {user ? (
              <>
                {user.role === 'seller' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-800 dark:text-white hover:text-rose-600 px-3 py-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      <span>{t('dashboard')}</span>
                    </Link>
                    <Link 
                      to="/add-product" 
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <PlusCircle size={18} />
                      <span>{t('addProduct')}</span>
                    </Link>
                  </>
                )}

                {user.role === 'customer' && (
                  <Link 
                    to="/customer-dashboard" 
                    className="text-gray-800 dark:text-white hover:text-rose-600 px-3 py-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span>{t('dashboard')}</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <a 
                    href="http://localhost:5174" 
                    className="text-gray-800 dark:text-white hover:text-rose-600 px-3 py-2 rounded-lg text-base font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span>{t('dashboard')}</span>
                  </a>
                )}

                {/* Profile indicator */}
                <div className="flex items-center space-x-2 px-3.5 py-1.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full">
                  <div className="w-7 h-7 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-900">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-extrabold text-gray-900 dark:text-white truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500 capitalize leading-none">
                      {user.role}
                    </span>
                  </div>
                </div>
 
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-slate-300 hover:text-red-600 p-2 rounded-lg transition-colors cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-800 dark:text-white hover:text-rose-600 px-3.5 py-2 rounded-lg text-base font-bold transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl text-base font-bold shadow-md shadow-rose-200 transition-all duration-300 hover:shadow-lg transform active:scale-95"
                >
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
