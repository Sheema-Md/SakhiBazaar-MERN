import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext';

import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Globe,
  ShoppingBag,
  ShoppingCart,
  Menu,
  ChevronDown,
  Heart,
  Search,
  LayoutDashboard,
  MessageSquare,
  X
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // --------------------------------------------------
  // USER / ROLE
  // --------------------------------------------------

  const isLoggedIn = !!user;
  const isSeller = user?.role === 'seller';
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';

  // --------------------------------------------------
  // SEARCH STATE
  // --------------------------------------------------

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --------------------------------------------------
  // DROPDOWN STATE
  // --------------------------------------------------

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // --------------------------------------------------
  // AVATAR
  // --------------------------------------------------

  const avatar =
    user?.avatar ||
    localStorage.getItem(
      `sakhi_avatar_${user?._id || 'guest'}`
    ) ||
    '';

  // --------------------------------------------------
  // DASHBOARD LINK
  // --------------------------------------------------

  const getDashboardLink = () => {
    if (!user) return '/login';

    if (user.role === 'admin') {
      return '/admin-dashboard';
    }

    if (user.role === 'seller') {
      return '/dashboard';
    }

    return '/customer-dashboard';
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  /*
   * Common search for BOTH sellers and customers.
   *
   * The header itself does not decide how products are matched.
   * It only sends the query to the backend.
   *
   * Backend can later use MongoDB Atlas Search for:
   * - autocomplete
   * - fuzzy matching
   * - synonyms
   * - similar products
   * - category/subcategory matching
   */

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      const timer = setTimeout(() => {
        setSuggestions([]);
        setIsSearching(false);
      }, 0);

      return () => clearTimeout(timer);
    }

    const controller = new AbortController();

    const timer = setTimeout(() => {
      const fetchSuggestions = async () => {
        try {
          setIsSearching(true);

          const res = await axios.get(
            `http://localhost:5000/api/products/search?keyword=${encodeURIComponent(query)}`,
            {
              signal: controller.signal,
            }
          );

          setSuggestions(res.data || []);
        } catch (error) {
          if (
            error.name !== 'CanceledError' &&
            error.name !== 'AbortError'
          ) {
            console.error('Search failed:', error);
            setSuggestions([]);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        }
      };

      fetchSuggestions();
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);
  // --------------------------------------------------
  // PERFORM FULL SEARCH
  // --------------------------------------------------

  const performSearch = (query = searchQuery) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    setShowSuggestions(false);

    /*
     * Both sellers and customers use the same browse/search
     * page. The role does NOT change product search.
     */

    if (isSeller) {
      navigate(
        `/dashboard?view=browse&search=${encodeURIComponent(
          trimmedQuery
        )}`
      );
    } else {
      navigate(
        `/customer-dashboard?view=browse&search=${encodeURIComponent(
          trimmedQuery
        )}`
      );
    }
  };

  // --------------------------------------------------
  // SEARCH PRODUCT SELECTION
  // --------------------------------------------------

  const handleSuggestionClick = (product) => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);

    navigate(`/product/${product._id}`);
  };

  // --------------------------------------------------
  // KEYBOARD SEARCH
  // --------------------------------------------------

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (searchQuery.trim()) {
        performSearch();
      }
    }

    if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // --------------------------------------------------
  // CLICK OUTSIDE SEARCH
  // --------------------------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }

      if (!event.target.closest('.notification-btn-container')) {
        setIsNotificationsOpen(false);
      }

      if (!event.target.closest('.profile-btn-container')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // --------------------------------------------------
  // FETCH NOTIFICATIONS
  // --------------------------------------------------

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.token) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`
            }
          }
        );

        const data = response.data || [];

        setNotifications(data);
        setUnreadCount(
          data.filter((notification) => notification.unread).length
        );
      } catch (error) {
        console.error(
          'Failed to fetch notifications:',
          error?.response?.data || error.message
        );
      }
    };

    fetchNotifications();
  }, [user]);

  // --------------------------------------------------
  // SOCKET NOTIFICATIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((previous) => [
        notification,
        ...previous
      ]);

      setUnreadCount((previous) => previous + 1);
    };

    socket.on(
      'notification',
      handleNewNotification
    );

    return () => {
      socket.off(
        'notification',
        handleNewNotification
      );
    };
  }, [socket]);

  // --------------------------------------------------
  // NOTIFICATION CLICK
  // --------------------------------------------------

  const handleNotificationClick = (notification) => {
    setIsNotificationsOpen(false);

    const text = (
      notification.text || ''
    ).toLowerCase();

    if (
      text.includes('chat') ||
      text.includes('message')
    ) {
      navigate('/chat');
      return;
    }

    if (
      text.includes('order') ||
      text.includes('sale') ||
      text.includes('purchased') ||
      text.includes('placed')
    ) {
      if (isSeller) {
        navigate('/dashboard?view=orders');
      } else {
        navigate('/customer-dashboard?view=orders');
      }

      return;
    }

    if (
      text.includes('vetting') ||
      text.includes('approved') ||
      text.includes('status')
    ) {
      if (isSeller) {
        navigate('/dashboard?view=profile');
      } else {
        navigate('/customer-dashboard?view=profile');
      }
    }
  };

  // --------------------------------------------------
  // MARK NOTIFICATIONS READ
  // --------------------------------------------------

  const handleMarkAllRead = async () => {
    if (!user?.token) return;

    try {
      await axios.put(
        `${API_URL}/api/notifications/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          unread: false
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        'Failed to mark notifications read:',
        error?.response?.data || error.message
      );
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
    } catch (error) {
      console.error(
        'Logout request failed:',
        error.message
      );
    }

    logout();
    navigate('/login');
  };

  // --------------------------------------------------
  // PROFILE NAVIGATION
  // --------------------------------------------------

  const handleProfileNavigation = (view) => {
    setIsProfileOpen(false);

    if (isSeller) {
      navigate(`/dashboard?view=${view}`);
    } else if (isCustomer) {
      navigate(`/customer-dashboard?view=${view}`);
    } else if (isAdmin) {
      navigate('/admin-dashboard');
    }
  };

  // --------------------------------------------------
  // CART
  // --------------------------------------------------

  const handleCartClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (isSeller) {
      navigate('/cart');
    } else {
      navigate('/customer-dashboard?view=cart');
    }
  };

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

  const handleWishlistClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (isSeller) {
      navigate('/dashboard?view=wishlist');
    } else {
      navigate('/customer-dashboard?view=wishlist');
    }
  };

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/90 dark:bg-slate-800/90
        backdrop-blur-md
        border-b border-rose-100/30 dark:border-slate-700
        transition-colors duration-300
      "
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3 min-h-16">

          {/* ==================================================
              LEFT AREA
          ================================================== */}

          <div className="flex items-center shrink-0">

            {/* Mobile sidebar button */}
            {isLoggedIn && onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="
                  lg:hidden mr-2 p-2
                  text-slate-500 dark:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  rounded-xl transition-colors
                "
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
            )}

            {/* Logo */}
            <Link
              to={getDashboardLink()}
              className="flex items-center gap-2 group"
            >
              <div
                className="
                  p-2 sm:p-2.5
                  bg-gradient-to-tr from-rose-500 to-indigo-600
                  rounded-xl text-white shadow-md
                  transition-transform group-hover:scale-105
                "
              >
                <ShoppingBag size={21} />
              </div>

              <span
                className="
                  hidden sm:block
                  text-xl lg:text-2xl font-black
                  bg-gradient-to-r
                  from-rose-600 via-purple-600 to-indigo-600
                  dark:from-rose-400 dark:to-purple-400
                  bg-clip-text text-transparent
                  tracking-tight
                "
              >
                Sakhi Bazaar
              </span>
            </Link>
          </div>

          {/* ==================================================
              COMMON SEARCH
          ================================================== */}

          <div
            ref={searchRef}
            className="
              relative flex-1
              max-w-2xl
              mx-auto
            "
          >
            <div className="relative">

              <Search
                size={17}
                className="
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-400
                  pointer-events-none
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search products, crafts, categories..."
                className="
                  w-full
                  pl-10 pr-10
                  py-2.5
                  bg-slate-100 dark:bg-slate-900
                  border border-slate-200 dark:border-slate-700
                  text-sm font-semibold
                  rounded-2xl
                  focus:ring-2 focus:ring-rose-500
                  focus:outline-none
                  text-slate-900 dark:text-white
                  placeholder:text-slate-400
                  transition-all
                "
                aria-label="Search products"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="
                    absolute right-3 top-1/2
                    -translate-y-1/2
                    p-1
                    text-slate-400
                    hover:text-slate-600
                    dark:hover:text-slate-200
                  "
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* ==================================================
                AUTOCOMPLETE DROPDOWN
            ================================================== */}

            {showSuggestions &&
              searchQuery.trim() && (
                <div
                  className="
                    absolute left-0 right-0 mt-2
                    bg-white dark:bg-slate-800
                    border border-rose-100/50 dark:border-slate-700
                    rounded-2xl shadow-2xl
                    overflow-hidden
                    z-50
                  "
                >

                  {/* Loading */}
                  {isSearching && (
                    <div
                      className="
                        px-4 py-3
                        text-xs font-semibold
                        text-slate-400
                      "
                    >
                      Searching...
                    </div>
                  )}

                  {/* Results */}
                  {!isSearching &&
                    suggestions.length > 0 && (
                      <div>
                        <div
                          className="
                            px-4 py-2
                            text-[10px]
                            uppercase tracking-wider
                            font-black
                            text-slate-400
                            border-b
                            border-slate-100
                            dark:border-slate-700
                          "
                        >
                          Products
                        </div>

                        {suggestions
                          .slice(0, 6)
                          .map((product) => (
                            <button
                              type="button"
                              key={product._id}
                              onClick={() =>
                                handleSuggestionClick(
                                  product
                                )
                              }
                              className="
                                w-full
                                flex items-center gap-3
                                p-3
                                text-left
                                hover:bg-rose-50/60
                                dark:hover:bg-slate-700/50
                                transition-colors
                                border-b
                                border-slate-50
                                dark:border-slate-700/50
                              "
                            >
                              <img
                                src={
                                  product.imageUrl ||
                                  product.images?.[0]
                                }
                                alt=""
                                className="
                                  w-11 h-11
                                  rounded-xl
                                  object-cover
                                  shrink-0
                                  bg-slate-100
                                "
                              />

                              <div className="min-w-0 flex-1">

                                <p
                                  className="
                                    text-sm font-bold
                                    text-slate-900
                                    dark:text-slate-100
                                    truncate
                                  "
                                >
                                  {product.title}
                                </p>

                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                    dark:text-slate-400
                                    truncate
                                  "
                                >
                                  {product.category}

                                  {product.subcategory
                                    ? ` • ${product.subcategory}`
                                    : ''}

                                  {' • ₹'}
                                  {product.price}
                                </p>
                              </div>
                            </button>
                          ))}

                        {/* Search everything */}
                        <button
                          type="button"
                          onClick={() =>
                            performSearch()
                          }
                          className="
                            w-full
                            px-4 py-3
                            text-sm font-bold
                            text-rose-600
                            dark:text-rose-400
                            hover:bg-rose-50
                            dark:hover:bg-slate-700
                            text-left
                          "
                        >
                          Search all products for "
                          {searchQuery}"
                        </button>
                      </div>
                    )}

                  {/* No results */}
                  {!isSearching &&
                    suggestions.length === 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          performSearch()
                        }
                        className="
                          w-full
                          px-4 py-4
                          text-left
                          hover:bg-slate-50
                          dark:hover:bg-slate-700
                        "
                      >
                        <p
                          className="
                            text-sm font-bold
                            text-slate-800
                            dark:text-white
                          "
                        >
                          Search for "{searchQuery}"
                        </p>

                        <p
                          className="
                            text-xs
                            text-slate-400
                            mt-1
                          "
                        >
                          Press Enter to see matching
                          and similar products
                        </p>
                      </button>
                    )}
                </div>
              )}
          </div>

          {/* ==================================================
              DESKTOP ACTIONS
          ================================================== */}

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Inbox */}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="
                  hidden sm:flex
                  p-2
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  rounded-xl transition-colors
                "
                title="Inbox"
              >
                <MessageSquare size={18} />
              </button>
            )}

            {/* Wishlist - BOTH seller and customer */}
            {isLoggedIn && !isAdmin && (
              <button
                type="button"
                onClick={handleWishlistClick}
                className="
                  p-2
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  rounded-xl
                  relative
                  transition-colors
                "
                title="Wishlist"
              >
                <Heart size={18} />

                {wishlistItems?.length > 0 && (
                  <span
                    className="
                      absolute -top-0.5 -right-0.5
                      bg-rose-600
                      text-white
                      text-[9px]
                      font-black
                      min-w-4 h-4
                      px-1
                      rounded-full
                      flex items-center justify-center
                      border border-white
                    "
                  >
                    {wishlistItems.length}
                  </span>
                )}
              </button>
            )}

            {/* Cart - BOTH seller and customer */}
            {isLoggedIn && !isAdmin && (
              <button
                type="button"
                onClick={handleCartClick}
                className="
                  p-2
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-100 dark:hover:bg-slate-700
                  rounded-xl
                  relative
                  transition-colors
                "
                title="Cart"
              >
                <ShoppingCart size={18} />

                {getCartCount() > 0 && (
                  <span
                    className="
                      absolute -top-0.5 -right-0.5
                      bg-rose-600
                      text-white
                      text-[9px]
                      font-black
                      min-w-4 h-4
                      px-1
                      rounded-full
                      flex items-center justify-center
                      border border-white
                    "
                  >
                    {getCartCount()}
                  </span>
                )}
              </button>
            )}

            {/* Notifications */}
            {isLoggedIn && (
              <div className="relative notification-btn-container">

                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(
                      (previous) => !previous
                    );
                    setIsProfileOpen(false);
                  }}
                  className="
                    p-2
                    text-slate-600 dark:text-slate-300
                    hover:bg-slate-100 dark:hover:bg-slate-700
                    rounded-xl
                    relative
                    transition-colors
                  "
                  title="Notifications"
                >
                  <Bell size={18} />

                  {unreadCount > 0 && (
                    <span
                      className="
                        absolute top-1.5 right-1.5
                        w-2 h-2
                        bg-rose-500
                        rounded-full
                        animate-pulse
                      "
                    />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div
                    className="
                      absolute right-0 mt-2
                      w-80 max-w-[calc(100vw-2rem)]
                      bg-white dark:bg-slate-800
                      border border-rose-100/50
                      dark:border-slate-700
                      rounded-2xl
                      shadow-xl
                      overflow-hidden
                      z-50
                    "
                  >

                    <div
                      className="
                        p-4
                        border-b
                        border-slate-100
                        dark:border-slate-700
                        flex justify-between
                        items-center
                      "
                    >
                      <span
                        className="
                          text-sm font-bold
                          text-slate-800
                          dark:text-slate-100
                        "
                      >
                        Notifications
                      </span>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="
                            text-[10px]
                            text-rose-600
                            dark:text-rose-400
                            font-semibold
                            hover:underline
                          "
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div
                      className="
                        divide-y
                        divide-slate-100
                        dark:divide-slate-700
                        max-h-72
                        overflow-y-auto
                      "
                    >
                      {notifications.length > 0 ? (
                        notifications.map(
                          (notification) => (
                            <div
                              key={notification._id}
                              onClick={() =>
                                handleNotificationClick(
                                  notification
                                )
                              }
                              className={`
                                p-4
                                cursor-pointer
                                hover:bg-slate-50
                                dark:hover:bg-slate-700/30
                                transition-colors
                                ${notification.unread
                                  ? 'bg-rose-50/10 dark:bg-slate-800/50 border-l-2 border-rose-500'
                                  : ''
                                }
                              `}
                            >
                              <p
                                className="
                                  text-xs
                                  text-slate-700
                                  dark:text-slate-200
                                  leading-snug
                                "
                              >
                                {notification.text}
                              </p>

                              <span
                                className="
                                  text-[10px]
                                  text-slate-400
                                  mt-1 block
                                "
                              >
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <div
                          className="
                            p-6 text-center
                            text-xs text-slate-400
                          "
                        >
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Language */}
            <div
              className="
                hidden sm:flex
                items-center gap-1
                px-2 py-1.5
                bg-slate-50 dark:bg-slate-900
                border border-slate-100
                dark:border-slate-700
                rounded-xl
              "
            >
              <Globe
                size={14}
                className="text-slate-500"
              />

              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value)
                }
                className="
                  bg-transparent
                  border-0
                  text-xs font-bold
                  text-slate-700
                  dark:text-slate-300
                  focus:outline-none
                  cursor-pointer
                "
                aria-label="Language"
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

            {/* Theme */}
            <button
              type="button"
              onClick={toggleTheme}
              className="
                p-2
                text-slate-600 dark:text-slate-300
                hover:bg-slate-100 dark:hover:bg-slate-700
                rounded-xl
                transition-colors
              "
              title={
                theme === 'dark'
                  ? 'Switch to Light Mode'
                  : 'Switch to Dark Mode'
              }
            >
              {theme === 'dark' ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* ==================================================
                PROFILE
            ================================================== */}

            {isLoggedIn ? (
              <div className="relative profile-btn-container">

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(
                      (previous) => !previous
                    );
                    setIsNotificationsOpen(false);
                  }}
                  className="
                    flex items-center gap-1
                    p-1
                    bg-rose-50
                    dark:bg-rose-950/20
                    hover:bg-rose-100
                    dark:hover:bg-rose-950/30
                    rounded-full
                    transition-colors
                    border border-rose-100/30
                  "
                  aria-label="Profile menu"
                >
                  <div
                    className="
                      w-8 h-8
                      rounded-full
                      overflow-hidden
                      bg-gradient-to-tr
                      from-rose-500 to-indigo-600
                      flex items-center justify-center
                      text-xs font-bold text-white
                    "
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name
                        ?.charAt(0)
                        .toUpperCase()
                    )}
                  </div>

                  <ChevronDown
                    size={14}
                    className="
                      text-slate-500
                      pr-1
                    "
                  />
                </button>

                {isProfileOpen && (
                  <div
                    className="
                      absolute right-0 mt-2
                      w-56
                      bg-white dark:bg-slate-800
                      border border-rose-100/50
                      dark:border-slate-700
                      rounded-2xl
                      shadow-xl
                      overflow-hidden
                      z-50
                    "
                  >

                    {/* User information */}
                    <div
                      className="
                        p-4
                        border-b
                        border-slate-100
                        dark:border-slate-700
                        bg-rose-50/20
                        dark:bg-slate-800/40
                      "
                    >
                      <p
                        className="
                          text-xs font-bold
                          text-slate-850
                          dark:text-slate-100
                          truncate
                        "
                      >
                        {user.name}
                      </p>

                      <p
                        className="
                          text-[10px]
                          text-slate-500
                          dark:text-slate-400
                          truncate
                          mt-0.5
                        "
                      >
                        {user.email}
                      </p>

                      <span
                        className="
                          mt-2
                          inline-flex
                          items-center
                          px-2 py-0.5
                          rounded-full
                          text-[9px]
                          font-bold
                          bg-rose-100
                          text-rose-800
                          dark:bg-rose-950/40
                          dark:text-rose-300
                          capitalize
                        "
                      >
                        {user.role} workspace
                      </span>
                    </div>

                    <div className="p-2 space-y-1">

                      {/* Dashboard */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate(
                              getDashboardLink()
                            );
                          }}
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            rounded-xl
                            text-xs
                            text-slate-600
                            dark:text-slate-300
                            hover:bg-slate-50
                            dark:hover:bg-slate-700
                            transition-colors
                            font-medium
                            text-left
                          "
                        >
                          <LayoutDashboard
                            size={14}
                          />
                          <span>Dashboard</span>
                        </button>
                      )}

                      {/* Profile */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleProfileNavigation(
                              'profile'
                            )
                          }
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            rounded-xl
                            text-xs
                            text-slate-600
                            dark:text-slate-300
                            hover:bg-slate-50
                            dark:hover:bg-slate-700
                            transition-colors
                            font-medium
                            text-left
                          "
                        >
                          <User size={14} />
                          <span>
                            {isSeller
                              ? 'Edit Profile'
                              : 'View Profile'}
                          </span>
                        </button>
                      )}

                      {/* Settings */}
                      {!isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleProfileNavigation(
                              'settings'
                            )
                          }
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            rounded-xl
                            text-xs
                            text-slate-600
                            dark:text-slate-300
                            hover:bg-slate-50
                            dark:hover:bg-slate-700
                            transition-colors
                            font-medium
                            text-left
                          "
                        >
                          <Settings size={14} />
                          <span>Settings</span>
                        </button>
                      )}

                      {/* Admin panel */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate(
                              '/admin-dashboard'
                            );
                          }}
                          className="
                            w-full
                            flex items-center gap-2
                            px-3 py-2
                            rounded-xl
                            text-xs
                            text-slate-600
                            dark:text-slate-300
                            hover:bg-slate-50
                            dark:hover:bg-slate-700
                            transition-colors
                            font-medium
                            text-left
                          "
                        >
                          <LayoutDashboard
                            size={14}
                          />
                          <span>Admin Panel</span>
                        </button>
                      )}

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="
                          w-full
                          text-left
                          flex items-center gap-2
                          px-3 py-2
                          rounded-xl
                          text-xs
                          text-red-600
                          dark:text-red-400
                          hover:bg-red-50
                          dark:hover:bg-red-950/10
                          transition-colors
                          font-bold
                          border-t
                          border-slate-100
                          dark:border-slate-700
                          pt-3
                          mt-1
                        "
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>

                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Logged out */
              <Link
                to="/login"
                className="
                  px-3 py-2
                  rounded-xl
                  bg-gradient-to-r
                  from-rose-600 to-purple-600
                  text-white
                  text-xs sm:text-sm
                  font-bold
                  shadow-sm
                  hover:shadow-md
                  transition-all
                "
              >
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;