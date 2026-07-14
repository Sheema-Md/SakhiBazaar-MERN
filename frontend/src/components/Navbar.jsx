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
              </select>
            </div>

            <Link 
              to="/" 
              className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t('browse')}
            </Link>
 
            {user && (
              <Link 
                to="/chat" 
                className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
              >
                <MessageSquare size={16} />
                <span>{t('inbox')}</span>
              </Link>
            )}

            <Link 
              to="/cart" 
              className="text-gray-600 hover:text-rose-600 p-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors relative"
              title={t('shoppingCart')}
            >
              <ShoppingCart size={18} />
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce shadow-sm border border-white">
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
                      className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      <span>{t('dashboard')}</span>
                    </Link>
                    <Link 
                      to="/add-product" 
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      <PlusCircle size={16} />
                      <span>{t('addProduct')}</span>
                    </Link>
                  </>
                )}

                {user.role === 'customer' && (
                  <Link 
                    to="/customer-dashboard" 
                    className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span>{t('dashboard')}</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link 
                    to="/admin-dashboard" 
                    className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    <span>{t('dashboard')}</span>
                  </Link>
                )}

                {/* Profile indicator */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs font-semibold text-rose-800">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-gray-800 truncate max-w-[100px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-gray-500 capitalize leading-none">
                      {user.role}
                    </span>
                  </div>
                </div>
 
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-lg transition-colors"
                  title={t('logout')}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-rose-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-rose-200 transition-all duration-300 hover:shadow-lg transform active:scale-95"
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
