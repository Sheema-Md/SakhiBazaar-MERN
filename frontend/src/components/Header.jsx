import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Bell, Sun, Moon, LogOut, User, Settings, Globe, ShoppingBag, ShoppingCart, Menu, ChevronDown, Heart, Search, LayoutDashboard
} from 'lucide-react';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  
  // Search Suggestions State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`http://localhost:5000/api/products/search?keyword=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    }, searchQuery.trim() ? 250 : 0);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load avatar from localStorage or fallback
  const avatar = user?.avatar || localStorage.getItem(`sakhi_avatar_${user?._id || 'guest'}`) || '';

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.token) {
        try {
          const res = await axios.get('http://localhost:5000/api/notifications', {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          setNotifications(res.data || []);
          setUnreadCount(res.data?.filter((n) => n.unread).length || 0);
        } catch (err) {
          console.error('Failed to fetch notifications:', err.message);
        }
      }
    };
    fetchNotifications();
  }, [user]);

  // Socket listener for real-time notifications
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      socket.on('notification', handleNewNotification);
      return () => {
        socket.off('notification', handleNewNotification);
      };
    }
  }, [socket]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.notification-btn-container')) {
        setIsNotificationsOpen(false);
      }
      if (!e.target.closest('.profile-btn-container')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleNotificationClick = (notification) => {
    setIsNotificationsOpen(false);
    const txt = (notification.text || '').toLowerCase();
    if (txt.includes('chat') || txt.includes('message')) {
      navigate('/chat');
    } else if (txt.includes('order') || txt.includes('sale') || txt.includes('purchased') || txt.includes('placed')) {
      if (user?.role === 'seller') {
        navigate('/dashboard?view=orders');
      } else {
        navigate('/customer-dashboard?view=orders');
      }
    } else if (txt.includes('vetting') || txt.includes('approved') || txt.includes('status')) {
      if (user?.role === 'seller') {
        navigate('/dashboard?view=profile');
      } else {
        navigate('/customer-dashboard?view=profile');
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (user && user.token) {
      try {
        await axios.put(
          'http://localhost:5000/api/notifications/read',
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        setUnreadCount(0);
      } catch (err) {
        console.error('Failed to mark notifications read:', err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'seller') return '/dashboard';
    return '/customer-dashboard';
  };

  // Condition checks
  const isSeller = user && user.role === 'seller';
  const isCustomer = user && user.role === 'customer';
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-rose-100/30 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Left Area */}
          <div className="flex items-center space-x-3">
            {isLoggedIn && onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <Link to={getDashboardLink()} className="flex items-center space-x-2 group">
              <div className="p-2.5 bg-gradient-to-tr from-rose-500 to-indigo-650 rounded-xl text-white shadow-md transition-transform group-hover:scale-105">
                <ShoppingBag size={22} />
              </div>
              <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 dark:from-rose-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
                Sakhi Bazaar
              </span>
            </Link>
          </div>

          {/* Global Search Bar (Hidden for sellers) */}
          {!isSeller && (
            <div className="relative flex-1 max-w-sm mx-6 hidden sm:block">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/customer-dashboard?view=browse&search=${encodeURIComponent(searchQuery.trim())}`);
                      setShowSuggestions(false);
                    }
                  }}
                  placeholder="Search products, crafts..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-sm font-semibold rounded-2xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-900 dark:text-white"
                />
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="divide-y divide-rose-50 dark:divide-slate-700">
                    {suggestions.slice(0, 5).map((item) => (
                      <Link
                        key={item._id}
                        to={`/product/${item._id}`}
                        onClick={() => {
                          setSearchQuery('');
                          setShowSuggestions(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-rose-50/50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                          <p className="text-xs text-slate-450 dark:text-slate-400 capitalize">{item.category} • ₹{item.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Center Navigation Links (Hidden for sellers/logged out) */}
          <nav className="hidden md:flex space-x-6 text-base font-extrabold">
            {isCustomer && (
              <>
                <Link to="/customer-dashboard?view=browse" className="text-slate-800 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  {t('browse') || 'Browse'}
                </Link>
                <Link to="/chat" className="text-slate-800 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                  Inbox
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            
            {/* Cart Widget (Customer only) */}
            {isCustomer && (
              <Link
                to="/customer-dashboard?view=cart"
                className="p-2 text-slate-605 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl relative transition-colors"
                title={t('shoppingCart') || 'Cart'}
              >
                <ShoppingCart size={18} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Wishlist Heart Icon (Customer only) */}
            {isCustomer && (
              <Link
                to="/customer-dashboard?view=wishlist"
                className="p-2 text-slate-605 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl relative transition-colors"
                title="Wishlist"
              >
                <Heart size={18} />
                {wishlistItems && wishlistItems.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-650 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications (Logged In only) */}
            {isLoggedIn && (
              <div className="relative notification-btn-container">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    setIsProfileOpen(false);
                  }}
                  className="p-2 text-slate-605 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl relative transition-colors"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                    <div className="p-4 border-b border-rose-100/50 dark:border-slate-700 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-rose-50 dark:divide-slate-700 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${
                              n.unread ? 'bg-rose-50/10 dark:bg-slate-800/50 border-l-2 border-rose-500' : ''
                            }`}
                          >
                            <p className="text-xs text-slate-700 dark:text-slate-200 leading-snug">{n.text}</p>
                            <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language Selector */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Globe size={14} className="text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent border-0 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
                <option value="ta">தமிழ்</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="mr">ಮराठी</option>
                <option value="bn">বাংলা</option>
                <option value="gu">ગુજરાતી</option>
                <option value="pa">ਪੰਜਾਬੀ</option>
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-655 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Profile Dropdown (Logged In only) */}
            {isLoggedIn && (
              <div className="relative profile-btn-container">
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-full transition-colors border border-rose-100/30"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-rose-500 to-indigo-650 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown size={14} className="text-slate-500 pr-1" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                    
                    {/* Header info - HIDE email for Seller workspace */}
                    <div className="p-4 border-b border-rose-100/50 dark:border-slate-700 bg-rose-50/20 dark:bg-slate-800/40">
                      <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate">{user.name}</p>
                      {!isSeller && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email}</p>
                      )}
                      <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-455 capitalize">
                        {user.role} workspace
                      </span>
                    </div>

                    {/* Menu Options */}
                    <div className="p-2 space-y-1">
                      {/* For Sellers: dropdown has Edit Profile, Settings, Logout. View Profile and Email display are removed */}
                      {isSeller ? (
                        <>
                          <Link
                            to="/dashboard?view=profile"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                          >
                            <User size={14} />
                            <span>Edit Profile</span>
                          </Link>
                          <Link
                            to="/dashboard?view=settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                          >
                            <Settings size={14} />
                            <span>Settings</span>
                          </Link>
                        </>
                      ) : (
                        // For customers/admins
                        <>
                          {user.role === 'admin' ? (
                            <a
                              href="http://localhost:5174"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-655 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                              <LayoutDashboard size={14} />
                              <span>Admin Panel</span>
                            </a>
                          ) : (
                            <>
                              <Link
                                to={`${getDashboardLink()}?view=profile`}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                              >
                                <User size={14} />
                                <span>View Profile</span>
                              </Link>
                              <Link
                                to={`${getDashboardLink()}?view=settings`}
                                onClick={() => setIsProfileOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                              >
                                <Settings size={14} />
                                <span>Settings</span>
                              </Link>
                            </>
                          )}
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors font-bold border-t border-rose-50 dark:border-slate-700/50 pt-2"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
