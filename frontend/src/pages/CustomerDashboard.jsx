import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import CategoryTreeFilter from '../components/CategoryTreeFilter';
import ProductCard from '../components/ProductCard';
import DeliveryTrackingUI from '../components/DeliveryTrackingUI';
import {
  ShoppingBag, Heart, Star, CheckCircle, MessageSquare, Edit2,
  Camera, ShoppingCart, Search, Trash, Bell, MapPin, Sparkles, ShieldCheck, RefreshCw, Printer
} from 'lucide-react';

const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart, addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL View selector
  const activeTab = searchParams.get('view') || 'dashboard';

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile avatar
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem(`sakhi_avatar_${user?._id || 'guest'}`) || '';
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  // Password reset state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Orders and notifications lists
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [orderTracking, setOrderTracking] = useState(null); // tracks a specific order

  // Browse products state
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseFilters, setBrowseFilters] = useState({
    categories: '',
    subcategories: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: '',
    offer: false
  });

  // Sync URL search param with state
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      const timer = setTimeout(() => {
        setBrowseSearch(urlSearch);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Vetting rating states
  const [reviewingItem, setReviewingItem] = useState(null); // stores { orderId, productId }
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Checkout address form
  const [checkoutForm, setCheckoutForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState('');

  // Load profile details
  const loadProfile = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        setCheckoutForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          city: '',
          state: '',
          zip: '',
        });
        if (res.data.avatar) {
          setAvatar(res.data.avatar);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err.message);
      }
    }
  };

  // Load orders history
  const loadOrders = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/history', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err.message);
      }
    }
  };



  // Load notifications log
  const loadNotifications = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err.message);
      }
    }
  };

  // Run fetching based on activeTab
  useEffect(() => {
    const runAsync = async () => {
      await Promise.resolve();
      loadProfile();
      loadOrders();
      loadNotifications();
    };
    if (user) {
      runAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab]);

  // Fetch filtered browse products
  useEffect(() => {
    const loadBrowseProducts = async () => {
      if (activeTab === 'browse') {
        setLoading(true);
        try {
          const queryParams = {
            ...browseFilters,
            search: browseSearch
          };
          const res = await axios.get('http://localhost:5000/api/products/filter', { params: queryParams });
          setFilteredProducts(res.data || []);
        } catch (err) {
          console.error('Failed to filter products:', err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    const delayDebounceFn = setTimeout(() => {
      loadBrowseProducts();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [browseFilters, browseSearch, activeTab]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        'http://localhost:5000/api/auth/profile',
        {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          avatar: avatar,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      localStorage.setItem('sakhi_user', JSON.stringify({ ...user, ...res.data }));
      setIsEditing(false);
      alert(t('profileUpdated') || 'Profile details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('passwordMismatch') || 'Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/auth/profile',
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPasswordSuccess(t('passwordUpdated') || 'Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem(`sakhi_avatar_${user?._id || 'guest'}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    localStorage.removeItem(`sakhi_avatar_${user?._id || 'guest'}`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingItem) return;

    try {
      await axios.post(
        `http://localhost:5000/api/products/${reviewingItem.productId}/review`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Thank you! Your product review has been submitted successfully.');
      setReviewingItem(null);
      setComment('');
      setRating(5);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleChatWithSeller = (seller) => {
    if (!seller) return;
    navigate('/chat', {
      state: {
        startConversation: {
          _id: generateConversationId(),
          participants: [user, seller],
          productId: null,
        },
      },
    });
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/track/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrderTracking(res.data);
    } catch (err) {
      console.error('Failed to track order:', err.message);
    }
  };



  // Checkout submit handler
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setCheckoutSubmitting(true);
    try {
      const addressString = `${checkoutForm.name}, Address: ${checkoutForm.address}, City: ${checkoutForm.city}, State: ${checkoutForm.state}, ZIP: ${checkoutForm.zip}, Phone: ${checkoutForm.phone}`;
      
      const orderProducts = cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));

      const total = getCartTotal();
      const shipping = total > 1000 ? 0 : 99;
      const gst = Math.round(total * 0.05);
      const grandTotal = total + shipping + gst;

      await axios.post(
        'http://localhost:5000/api/orders',
        {
          products: orderProducts,
          totalAmount: grandTotal,
          shippingAddress: addressString
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setCheckoutSuccessMessage('Order placed successfully! Redirecting to orders history...');
      clearCart();
      setTimeout(() => {
        setCheckoutSuccessMessage('');
        setSearchParams({ view: 'orders' });
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* ----------------------------------------------------------------- */}
      {/* VIEW: GENERAL DASHBOARD OVERVIEW */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-rose-500 to-indigo-650 p-6 sm:p-8 rounded-3xl text-white shadow-md">
            <h1 className="text-xl sm:text-2xl font-black">{t('hello') || 'Hello'}, {profileData.name || user?.name || 'Valued Buyer'}!</h1>
            <p className="text-xs text-rose-100 mt-1 max-w-sm">
              {t('welcomeDashboard') || 'Welcome back to your client control panel. Monitor your purchase timeline, view updates, and explore products.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm text-center">
              <ShoppingBag className="mx-auto text-rose-500 mb-2" size={28} />
              <h3 className="text-sm font-bold text-slate-400">{t('totalPurchases') || 'Total Purchases'}</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{orders.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm text-center">
              <Heart className="mx-auto text-rose-500 mb-2" size={28} />
              <h3 className="text-sm font-bold text-slate-400">{t('savedFavorites') || 'Saved Favorites'}</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">{wishlistItems.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm text-center">
              <Bell className="mx-auto text-rose-500 mb-2" size={28} />
              <h3 className="text-sm font-bold text-slate-400">{t('notifications') || 'Notifications'}</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {notifications.filter((n) => n.unread).length} {t('new') || 'New'}
              </p>
            </div>
          </div>



          {/* Recent Orders log */}
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-sm font-bold tracking-tight mb-4">{t('recentTransactions') || 'Recent Transactions'}</h2>
            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-rose-50 dark:border-slate-750 text-slate-400 uppercase tracking-wider">
                      <th className="py-3 font-semibold">{t('orderId') || 'Order ID'}</th>
                      <th className="py-3 font-semibold">{t('placedDate') || 'Placed Date'}</th>
                      <th className="py-3 font-semibold">{t('priceTotal') || 'Price Total'}</th>
                      <th className="py-3 font-semibold">{t('shipStatus') || 'Ship Status'}</th>
                      <th className="py-3 font-semibold">{t('actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-medium">
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="py-3 font-mono text-[10px] text-rose-600 dark:text-rose-400">{o._id}</td>
                        <td className="py-3">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 font-bold">₹{o.totalAmount}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => {
                              handleTrackOrder(o._id);
                              setSearchParams({ view: 'shipments' });
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                          >
                            {t('trackOrder') || 'Track order'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-455 text-xs">{t('noTransactions') || 'No transaction records found.'}</div>
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: ADVANCED BROWSE WITH CATEGORY TREE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Browse Marketplace Listings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore listed craft products across categories.</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={browseSearch}
                onChange={(e) => setBrowseSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1">
              <CategoryTreeFilter onFilterChange={(f) => setBrowseFilters(f)} />
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <RefreshCw size={24} className="animate-spin text-rose-500" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl text-slate-400 text-xs font-semibold">
                  No products match the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: ORDER HISTORY */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{t('yourOrders')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review transaction histories, rate purchased products, and check shipment paths.
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl shadow-xs overflow-hidden"
                >
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-rose-100/20 dark:border-slate-750 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold text-slate-500">
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Date Placed</p>
                        <p className="text-slate-800 dark:text-white mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Amount</p>
                        <p className="text-slate-800 dark:text-white mt-0.5 font-bold">₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Status</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mt-0.5 text-[9px] uppercase font-bold tracking-wider ${
                          order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-slate-800 dark:text-white text-[10px] mt-0.5">{order._id}</p>
                    </div>
                  </div>

                  <div className="p-6 divide-y divide-rose-50 dark:divide-slate-750">
                    {order.products.map((item, idx) => (
                      <div key={item.product?._id || idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shrink-0">
                            <img
                              src={item.product?.imageUrl || 'https://via.placeholder.com/150'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                              {item.product?.title || 'Unknown Product'}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Qty: {item.quantity} | Total: ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              handleTrackOrder(order._id);
                              setSearchParams({ view: 'shipments' });
                            }}
                            className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Track Path
                          </button>
                          <button
                            onClick={() => navigate('/order-success', { state: { orderId: order._id, name: user?.name } })}
                            className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Printer size={12} />
                            Print Invoice
                          </button>
                          {item.product?.seller && (
                            <button
                              onClick={() => handleChatWithSeller(item.product.seller)}
                              className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <MessageSquare size={12} />
                              Chat
                            </button>
                          )}
                          {order.orderStatus === 'Delivered' && (
                            <button
                              onClick={() => setReviewingItem({ orderId: order._id, productId: item.product?._id })}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Star size={12} />
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {reviewingItem && reviewingItem.orderId === order._id && (
                    <form onSubmit={handleReviewSubmit} className="bg-slate-50/50 dark:bg-slate-900/20 p-6 border-t border-rose-100/20 dark:border-slate-750 space-y-4">
                      <h4 className="text-xs font-bold text-slate-750 dark:text-slate-350 uppercase tracking-widest">Rate item</h4>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} type="button" onClick={() => setRating(star)} className="text-yellow-450">
                            <Star size={20} className={star <= rating ? 'fill-yellow-450 text-yellow-405' : 'text-slate-300'} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        rows="2"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        placeholder="Share your experience with the item quality and delivery..."
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setReviewingItem(null)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl shadow-sm">
              <ShoppingBag className="mx-auto text-slate-205 dark:text-slate-700 mb-3" size={36} />
              <p className="text-sm font-semibold text-slate-400">No purchases found.</p>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: SHIPMENT TRACKING TIMELINE */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'shipments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Shipment Tracking Center</h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status updates and timelines on all courier shipments.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Select Order to Track</h3>
              <div className="space-y-2">
                {orders.map(o => (
                  <div
                    key={o._id}
                    onClick={() => handleTrackOrder(o._id)}
                    className={`p-4 bg-white dark:bg-slate-800 border rounded-2xl cursor-pointer transition-all shadow-xs ${
                      orderTracking?._id === o._id ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-rose-100/20 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="font-mono text-rose-500">Order #{o._id.slice(-6)}</span>
                      <span className="uppercase text-[9px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{o.orderStatus}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Placed: {new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-xs text-slate-450 italic pl-1">No orders placed yet.</p>}
              </div>
            </div>

            <div className="lg:col-span-2">
              {orderTracking ? (
                <DeliveryTrackingUI order={orderTracking} />
              ) : (
                <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-8 rounded-3xl text-center text-slate-400 text-xs font-semibold">
                  Select an order on the left side to visualize tracking checkpoints.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: SAVED FAVORITES (WISHLIST) */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{t('wishlistTitle')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('wishlistSubtitle')}</p>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="aspect-square relative overflow-hidden bg-gray-50 border-b border-rose-50 dark:border-slate-750">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl shadow-xs text-rose-500 hover:scale-105 cursor-pointer"
                      >
                        <Heart size={16} className="fill-current" />
                      </button>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 rounded-lg">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-105 line-clamp-2">{item.title}</h4>
                      <p className="text-sm font-black text-rose-600 dark:text-rose-400">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        alert('Added to Cart!');
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={12} /> Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl shadow-sm">
              <Heart className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={36} />
              <p className="text-sm font-semibold text-slate-400">{t('emptyWishlist')}</p>
              <button
                onClick={() => setSearchParams({ view: 'browse' })}
                className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Browse Items
              </button>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: CART WITH EMBEDDED CHECKOUT */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'cart' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Shopping Cart & Secure Checkout</h2>
            <p className="text-xs text-slate-400 mt-0.5">Finalize selections, complete billing address records, and pay safely.</p>
          </div>

          {checkoutSuccessMessage && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 text-green-700 dark:text-green-400 text-xs font-bold rounded-2xl animate-pulse text-center">
              {checkoutSuccessMessage}
            </div>
          )}

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Review Cart Selections</h3>
                {cartItems.map((item) => (
                  <div key={item.product._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border shrink-0">
                        <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 rounded-full capitalize">{item.product.category}</span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-1">{item.product.title}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">By: {item.product.seller?.name || 'Seller'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-rose-50 dark:border-slate-750">
                      <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-1 hover:text-rose-500"><Trash size={12} /></button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-1 hover:text-rose-500 font-bold">+</button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold text-rose-600 dark:text-rose-400">₹{item.product.price * item.quantity}</span>
                        <button onClick={() => removeFromCart(item.product._id)} className="text-slate-400 hover:text-red-500 p-1"><Trash size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Checkout billing details */}
                <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-rose-50 dark:border-slate-750 pb-2 flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> Shipping & Billing Address</h3>
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Receiver Name</label>
                        <input type="text" required value={checkoutForm.name} onChange={(e) => setCheckoutForm({...checkoutForm, name: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Phone Number</label>
                        <input type="text" required value={checkoutForm.phone} onChange={(e) => setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Street Address</label>
                      <input type="text" required value={checkoutForm.address} onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">City</label>
                        <input type="text" required value={checkoutForm.city} onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">State</label>
                        <input type="text" required value={checkoutForm.state} onChange={(e) => setCheckoutForm({...checkoutForm, state: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500">Postal ZIP</label>
                        <input type="text" required value={checkoutForm.zip} onChange={(e) => setCheckoutForm({...checkoutForm, zip: e.target.value})} className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-2xl text-[10px] text-green-800 dark:text-green-400 font-semibold mt-2">
                      <ShieldCheck size={14} className="text-green-600 shrink-0" /> Secure 256-bit Stripe payments session integrated.
                    </div>

                    <button type="submit" disabled={checkoutSubmitting} className="w-full py-3 bg-gradient-to-r from-rose-500 to-indigo-650 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.01]">
                      {checkoutSubmitting ? 'Processing Transaction...' : `Confirm Order Payment (₹${(getCartTotal() + (getCartTotal() > 1000 ? 0 : 99) + Math.round(getCartTotal() * 0.05))})`}
                    </button>
                  </form>
                </div>
              </div>

              {/* Order breakdown sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-rose-50 dark:border-slate-750 pb-2 flex items-center gap-1"><Sparkles size={12} className="text-yellow-500" /> Order Summary</h3>
                  
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Price ({getCartCount()} items)</span>
                      <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GST (5% Estimated)</span>
                      <span>₹{Math.round(getCartTotal() * 0.05).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Courier Fee</span>
                      <span>{getCartTotal() > 1000 ? <span className="text-green-600">FREE</span> : '₹99'}</span>
                    </div>

                    <div className="border-t border-rose-50 dark:border-slate-750 pt-3 flex justify-between items-baseline font-bold">
                      <span className="text-xs text-slate-800 dark:text-white">Amount Total</span>
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">
                        ₹{(getCartTotal() + (getCartTotal() > 1000 ? 0 : 99) + Math.round(getCartTotal() * 0.05)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl max-w-lg mx-auto shadow-xs">
              <ShoppingBag className="mx-auto text-rose-500 mb-4" size={36} />
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Your Cart is Empty</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">Explore marketplace craft products and add choices here.</p>
              <button onClick={() => setSearchParams({ view: 'browse' })} className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">Browse Catalog</button>
            </div>
          )}
        </div>
      )}



      {/* ----------------------------------------------------------------- */}
      {/* VIEW: PROFILE SETTINGS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{t('accountSettings')}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold font-sans">Edit default shipping address and personal contact methods.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-rose-50 dark:border-slate-750 pb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-rose-100 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-rose-500 font-extrabold text-2xl">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : profileData.name?.charAt(0).toUpperCase()}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-105">{profileData.name}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{user?.role} Profile</p>
              {avatar && (
                <button onClick={handleRemoveAvatar} className="text-[9px] font-bold text-red-500 hover:text-red-700 mt-1 cursor-pointer">
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.name}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-75"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profileData.email}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-450 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Contact Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-75"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Shipping Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profileData.address}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Street address, City, ZIP"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-75"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-rose-50 dark:border-slate-750 pt-4">
              {isEditing ? (
                <>
                  <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs">
                    {loading ? 'Saving...' : 'Save Updates'}
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 border border-rose-100 dark:border-rose-950/40 text-rose-600 hover:bg-rose-50/20 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer">
                  <Edit2 size={12} /> Edit Details
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* VIEW: SECURITY & PREFERENCES */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{t('securitySettings')}</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold font-sans">Reset security login credentials and select global platform defaults.</p>
          </div>

          {passwordError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-450 text-xs font-semibold rounded-xl">{passwordError}</div>}
          {passwordSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 text-xs font-semibold rounded-xl">{passwordSuccess}</div>}

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">{t('newPassword')}</label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">{t('confirmPassword')}</label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button type="submit" disabled={loading} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer">
              {loading ? 'Updating...' : t('updatePassword')}
            </button>
          </form>

          {/* Theme Preference panel */}
          <div className="border-t border-rose-50 dark:border-slate-750 pt-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
              Theme Mode
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => { if(theme==='dark') toggleTheme(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  theme === 'light'
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 text-rose-600 shadow-xs'
                    : 'bg-transparent text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                } cursor-pointer`}
              >
                Light
              </button>
              <button
                onClick={() => { if(theme==='light') toggleTheme(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                  theme === 'dark'
                    ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 text-rose-600 shadow-xs'
                    : 'bg-transparent text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                } cursor-pointer`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;
