import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config/api';
import { useCart } from '../context/CartContext';
import CategoryTreeFilter from '../components/CategoryTreeFilter';
import ProductCard from '../components/ProductCard';
import DeliveryTrackingUI from '../components/DeliveryTrackingUI';
import {
  ShoppingBag, Heart, Star, CheckCircle, MessageSquare, Edit2,
  Camera, ShoppingCart, Bell, Sparkles, RefreshCw, Printer,
  Plus, Minus, ArrowLeft, CreditCard, Clock, Trash2, RotateCcw, X, AlertCircle, Banknote
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
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    toggleSaveForLater,
    clearCart,
    getCartTotal,
    getCartCount,
    addToCart
  } = useCart();
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
  const [payments, setPayments] = useState([]);
  const [orderTracking, setOrderTracking] = useState(null); // tracks a specific order

  // Return / refund workflow state
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnMessage, setReturnMessage] = useState('');
  const [returnMessageType, setReturnMessageType] = useState('success');
  const [selectedImages, setSelectedImages] = useState([]);
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

  // Load profile details
  const loadProfile = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
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
        const res = await axios.get(`${API_URL}/orders/history`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err.message);
      }
    }
  };



  // Load notifications log
  const loadPayments = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/payments`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPayments(res.data || []);
      } catch (err) {
        // Payment history is supplementary to order history. Keep the orders page usable if it is unavailable.
        console.error('Failed to fetch payment history:', err.message);
        setPayments([]);
      }
    }
  };

  const loadNotifications = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNotifications(Array.isArray(res.data) ? res.data : []);
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
      loadPayments();
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
          const res = await axios.get(`${API_URL}/products/filter`, { params: queryParams });
          setFilteredProducts(Array.isArray(res.data) ? res.data : []);
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
        `${API_URL}/auth/profile`,
        {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          avatar: avatar,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      sessionStorage.setItem('sakhi_user', JSON.stringify({ ...user, ...res.data }));
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
        `${API_URL}/auth/profile`,
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
        `${API_URL}/products/${reviewingItem.productId}/review`,
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

  const getPaymentForOrder = (orderId) => {
    return payments.find((payment) => {
      const paymentOrderId = payment?.order?._id || payment?.order;
      return paymentOrderId && String(paymentOrderId) === String(orderId);
    });
  };

  const getReturnState = (order) => {
    const request = order?.returnRequest || {};
    const payment = getPaymentForOrder(order?._id);

    const hasReturnRequest =
      Boolean(order?.returnRequest) &&
      Object.keys(order.returnRequest || {}).length > 0;

    const requestStatus = String(
      request.status ||
      request.returnStatus ||
      request.requestStatus ||
      ''
    ).trim();

    // IMPORTANT:
    // Never use the normal payment status as refund status
    // unless a return/refund request actually exists.
    const refundStatus = hasReturnRequest
      ? String(request.refundStatus || '').trim()
      : '';

    const normalizedRequestStatus = requestStatus.toLowerCase();
    const normalizedRefundStatus = refundStatus.toLowerCase();

    const approved = normalizedRequestStatus === 'approved';
    const rejected = normalizedRequestStatus === 'rejected';

    const returned =
      hasReturnRequest &&
      ['refunded', 'completed'].includes(normalizedRefundStatus);

    const refundProcessing =
      hasReturnRequest &&
      ['processing', 'refund processing', 'initiated', 'pending']
        .includes(normalizedRefundStatus);

    return {
      request,
      payment,
      hasReturnRequest,
      requestStatus: hasReturnRequest
        ? (requestStatus || 'Return Requested')
        : 'Not Requested',

      refundStatus: hasReturnRequest
        ? (refundStatus || (approved ? 'Awaiting Refund' : 'Not Started'))
        : 'Not Applicable',

      approved,
      rejected,
      returned,
      refundProcessing,
    };
  };

  const translateStatus = (status) => {
    const normalized = String(status || '').trim().toLowerCase().replace(/\s+/g, '');
    const statusKeys = {
      delivered: 'orderStatusDelivered',
      pending: 'orderStatusPending',
      confirmed: 'orderStatusConfirmed',
      processing: 'orderStatusProcessing',
      shipped: 'orderStatusShipped',
      returnrequested: 'returnRequested',
      awaitingrefund: 'awaitingRefund',
      notstarted: 'notStarted',
      refunded: 'refunded',
      rejected: 'rejected',
    };
    return t(statusKeys[normalized] || status, status);
  };

  const isReturnEligible = (order) => {
    if (order?.orderStatus !== 'Delivered') return false;

    const state = getReturnState(order);
    if (state.rejected || state.approved || state.returned || state.refundProcessing) return false;

    const requestStatus = state.requestStatus.toLowerCase();
    return !['return requested', 'requested', 'approved', 'rejected', 'refunded', 'completed'].includes(requestStatus);
  };

  const openReturnRequest = (order) => {
    if (!isReturnEligible(order)) return;
    setReturnOrderId(order._id);
    setReturnReason('');
    setReturnMessage('');
    setReturnMessageType('success');
  };

  const closeReturnRequest = () => {
    if (returnSubmitting) return;
    setReturnOrderId(null);
    setReturnReason('');
    setSelectedImages([]);
  };

  const handleReturnRequest = async (event, orderId) => {
    event.preventDefault();
    const order = orders.find((item) => item._id === orderId);

    if (!order || !isReturnEligible(order)) {
      setReturnMessage('This order is not currently eligible for a return.');
      setReturnMessageType('error');
      return;
    }

    if (!returnReason.trim()) {
      setReturnMessage('Please select or enter a return reason before confirming.');
      setReturnMessageType('error');
      return;
    }

    setReturnSubmitting(true);
    setReturnMessage('');

    try {
      const formData = new FormData();

      formData.append('reason', returnReason.trim());

      selectedImages.forEach((image) => {
        formData.append('defectImages', image);
      });


      const response = await axios.post(
        `${API_URL}/return-refund/${order._id}/return`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      const updatedOrder = response.data?.order || response.data;
      setOrders((current) =>
        current.map((item) => item._id === orderId ? { ...item, ...updatedOrder } : item)
      );

      setReturnMessage('Return request submitted successfully. Your request is now under review.');
      setReturnMessageType('success');
      setReturnOrderId(null);
      setReturnReason('');
      setSelectedImages([]);
      await loadOrders();
    } catch (error) {

      setReturnMessage(
        error.response?.data?.message ||
        'We could not submit the return request. Please try again.'
      );
      setReturnMessageType('error');
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleTrackOrder = async (orderId) => {
    try {
      const res = await axios.get(`${API_URL}/orders/track/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrderTracking(res.data);
    } catch (err) {
      console.error('Failed to track order:', err.message);
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
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${o.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                            {translateStatus(o.orderStatus)}
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
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full mt-0.5 text-[9px] uppercase font-bold tracking-wider ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                          {translateStatus(order.orderStatus)}
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
                            <>
                              <button
                                onClick={() => setReviewingItem({ orderId: order._id, productId: item.product?._id })}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Star size={12} />
                                Review
                              </button>

                              {isReturnEligible(order) && (
                                <button
                                  type="button"
                                  onClick={() => openReturnRequest(order)}
                                  className="px-3 py-1.5 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <RotateCcw size={12} />
                                  Request Return
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(() => {
                    const returnState = getReturnState(order);
                    const showReturnPanel =
                      order.orderStatus === 'Delivered' &&
                      returnState.hasReturnRequest;

                    if (!showReturnPanel) return null;

                    return (
                      <div className="mx-6 mb-6 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/10 p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <RotateCcw size={16} className="text-amber-600" />
                              <h4 className="text-sm font-black text-slate-800 dark:text-white">Return & Refund</h4>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">Your return request and refund progress will appear here.</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${returnState.rejected ? 'bg-red-100 text-red-700' :
                            returnState.returned ? 'bg-green-100 text-green-700' :
                              returnState.refundProcessing ? 'bg-indigo-100 text-indigo-700' :
                                returnState.approved ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-amber-100 text-amber-700'
                            }`}>
                            {returnState.rejected ? 'Rejected' : returnState.returned ? 'Refunded' : returnState.refundProcessing ? 'Refund Processing' : returnState.approved ? 'Approved' : 'Return Requested'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="bg-white/80 dark:bg-slate-900/50 rounded-xl p-3 border border-amber-100 dark:border-slate-700">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Return Status</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{translateStatus(returnState.requestStatus)}</p>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-900/50 rounded-xl p-3 border border-amber-100 dark:border-slate-700">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Refund Status</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{translateStatus(returnState.refundStatus)}</p>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-900/50 rounded-xl p-3 border border-amber-100 dark:border-slate-700">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Refund Amount</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white mt-1">₹{Number(returnState.request.refundAmount ?? order.totalAmount ?? 0).toLocaleString('en-IN')}</p>
                          </div>
                          <div className="bg-white/80 dark:bg-slate-900/50 rounded-xl p-3 border border-amber-100 dark:border-slate-700">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Refund Method</p>
                            <p className="text-xs font-black text-slate-800 dark:text-white mt-1">{returnState.request.refundMethod || returnState.payment?.paymentMethod || 'Original payment method'}</p>
                          </div>
                        </div>

                        {returnState.request.reason && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="font-bold">Reason:</span> {returnState.request.reason}
                          </div>
                        )}

                        {returnState.rejected && (
                          <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 dark:text-red-400">
                            <AlertCircle size={14} className="shrink-0 mt-0.5" />
                            Your return request was rejected. {returnState.request.rejectionReason || 'Please review the seller response in your notifications.'}
                          </div>
                        )}

                        {returnState.approved && !returnState.returned && !returnState.refundProcessing && (
                          <div className="flex items-start gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <CheckCircle size={14} className="shrink-0 mt-0.5" />
                            Return approved. Your refund will be processed using the recorded refund method.
                          </div>
                        )}

                        {returnState.refundProcessing && !returnState.returned && (
                          <div className="flex items-start gap-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                            <Clock size={14} className="shrink-0 mt-0.5" />
                            Refund processing is in progress. The amount will be credited through the selected refund method.
                          </div>
                        )}

                        {returnState.returned && (
                          <div className="flex items-start gap-2 text-[11px] font-semibold text-green-700 dark:text-green-400">
                            <Banknote size={14} className="shrink-0 mt-0.5" />
                            Refund completed successfully for ₹{Number(returnState.request.refundAmount ?? order.totalAmount ?? 0).toLocaleString('en-IN')}.
                          </div>
                        )}
                      </div>
                    );
                  })()}

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

                  {returnOrderId === order._id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                      <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                          <div>
                            <div className="flex items-center gap-2">
                              <RotateCcw size={18} className="text-amber-600" />
                              <h3 className="text-lg font-black text-slate-900 dark:text-white">Request Return</h3>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Confirm the reason for returning this delivered order.</p>
                          </div>
                          <button type="button" onClick={closeReturnRequest} disabled={returnSubmitting} className="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 disabled:opacity-40">
                            <X size={18} />
                          </button>
                        </div>

                        <form onSubmit={(event) => handleReturnRequest(event, order._id)} className="p-6 space-y-5">
                          <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 p-4">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                              <CheckCircle size={16} />
                              <span className="text-xs font-black">Eligible for Return</span>
                            </div>
                            <p className="text-[11px] text-green-700/80 dark:text-green-400/80 mt-1">This order is marked Delivered, so the return option is available.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Refund Amount</p>
                              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3">
                              <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Refund Method</p>
                              <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{getPaymentForOrder(order._id)?.paymentMethod || order.returnRequest?.refundMethod || 'Original payment method'}</p>
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Return reason</label>
                            <select
                              value={returnReason}
                              onChange={(event) => setReturnReason(event.target.value)}
                              className="w-full mt-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                              required
                            >
                              <option value="">Select a reason</option>
                              <option>Damaged or defective item</option>
                              <option>Wrong item received</option>
                              <option>Item does not match description</option>
                              <option>Changed my mind</option>
                            </select>
                            <div>
                              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                Upload photos of the item
                              </label>

                              <p className="text-[10px] text-slate-400 mt-1 mb-2">
                                You can upload up to 5 images showing the damage or problem.
                              </p>

                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => {
                                  const files = Array.from(event.target.files || []);

                                  if (files.length > 5) {
                                    alert('You can upload a maximum of 5 images.');
                                    event.target.value = '';
                                    setSelectedImages([]);
                                    return;
                                  }

                                  const validFiles = files.filter((file) => {
                                    if (!file.type.startsWith('image/')) {
                                      return false;
                                    }

                                    if (file.size > 5 * 1024 * 1024) {
                                      alert(`${file.name} is larger than 5MB.`);
                                      return false;
                                    }

                                    return true;
                                  });

                                  setSelectedImages(validFiles);
                                }}
                                className="w-full text-xs text-slate-600 dark:text-slate-300
      file:mr-3 file:py-2 file:px-3
      file:rounded-lg file:border-0
      file:text-xs file:font-bold
      file:bg-amber-100 file:text-amber-700
      hover:file:bg-amber-200"
                              />

                              {selectedImages.length > 0 && (
                                <div className="mt-2 text-[10px] text-slate-500">
                                  {selectedImages.length} image(s) selected
                                </div>
                              )}
                            </div>
                          </div>

                          {returnMessage && (
                            <div className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 ${returnMessageType === 'error' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 border border-red-200 dark:border-red-900/50' : 'bg-green-50 dark:bg-green-950/20 text-green-700 border border-green-200 dark:border-green-900/50'}`}>
                              <AlertCircle size={14} className="shrink-0 mt-0.5" />
                              {returnMessage}
                            </div>
                          )}

                          <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={closeReturnRequest} disabled={returnSubmitting} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl text-xs font-bold">
                              Cancel
                            </button>
                            <button type="submit" disabled={returnSubmitting || !returnReason.trim()} className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50">
                              {returnSubmitting ? <RefreshCw size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                              {returnSubmitting ? 'Submitting...' : 'Confirm Return Request'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
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
                    className={`p-4 bg-white dark:bg-slate-800 border rounded-2xl cursor-pointer transition-all shadow-xs ${orderTracking?._id === o._id ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-rose-100/20 dark:border-slate-700'
                      }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="font-mono text-rose-500">Order #{o._id.slice(-6)}</span>
                      <span className="uppercase text-[9px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{translateStatus(o.orderStatus)}</span>
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
      {/* VIEW: CART */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'cart' && (() => {
        const activeCartItems = cartItems.filter((item) => !item.savedForLater);
        const savedForLaterItems = cartItems.filter((item) => item.savedForLater);
        const total = getCartTotal();
        const itemsCount = getCartCount();
        const shipping = total === 0 ? 0 : total > 1000 ? 0 : 99;
        const gst = Math.round(total * 0.05);
        const grandTotal = total + shipping + gst;

        const continueShoppingLink = '/customer-dashboard?view=browse';

        return (
          <div className="min-h-screen bg-gray-50/30 dark:bg-slate-900 -mx-2 sm:-mx-4 py-6 sm:py-10 px-2 sm:px-4 text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
              {/* Page title */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShoppingBag className="text-rose-500" size={26} />
                    Your Shopping Cart
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Manage your selections and continue to the same secure checkout used by the rest of the marketplace.
                  </p>
                </div>

                <button
                  onClick={() => navigate(continueShoppingLink)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  Continue Shopping
                </button>
              </div>

              {activeCartItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart items */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Cart Items
                      </h3>
                      <span className="text-xs font-semibold text-slate-400">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    {activeCartItems.map((item) => (
                      <div
                        key={item.product._id}
                        className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl p-4 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shrink-0">
                              <img
                                src={item.product.imageUrl || 'https://via.placeholder.com/150'}
                                alt={item.product.title || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0">
                              {item.product.category && (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 rounded-full capitalize">
                                  {item.product.category}
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate mt-1">
                                {item.product.title || 'Unknown Product'}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                By: {item.product.seller?.name || 'Seller'}
                              </p>
                              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                                ₹{Number(item.product.price || 0).toLocaleString('en-IN')} each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-rose-50 dark:border-slate-750">
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="p-1.5 text-slate-500 hover:text-rose-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                className="p-1.5 text-slate-500 hover:text-rose-500 cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="text-right min-w-[90px]">
                              <p className="text-sm font-black text-rose-600 dark:text-rose-400">
                                ₹{(Number(item.product.price || 0) * item.quantity).toLocaleString('en-IN')}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.product._id)}
                                className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleSaveForLater(item.product._id)}
                            className="text-[10px] font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                          >
                            Move to Save for Later
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Saved for later */}
                    {savedForLaterItems.length > 0 && (
                      <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <Clock size={14} className="text-slate-400" />
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Saved for Later
                          </h3>
                        </div>

                        {savedForLaterItems.map((item) => (
                          <div
                            key={item.product._id}
                            className="bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shrink-0">
                                  <img
                                    src={item.product.imageUrl || 'https://via.placeholder.com/150'}
                                    alt={item.product.title || 'Product'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                    {item.product.title || 'Unknown Product'}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    ₹{Number(item.product.price || 0).toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleSaveForLater(item.product._id)}
                                  className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                                >
                                  Move to Cart
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.product._id)}
                                  className="p-2 text-slate-400 hover:text-red-500 cursor-pointer"
                                  aria-label="Remove saved item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm sticky top-6 space-y-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-rose-50 dark:border-slate-750 pb-3 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-yellow-500" />
                        Order Summary
                      </h3>

                      <div className="space-y-3 text-xs font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span>Subtotal ({itemsCount} items)</span>
                          <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>GST (5% Estimated)</span>
                          <span>₹{gst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Shipping</span>
                          <span>
                            {shipping === 0 ? (
                              <span className="text-green-600">FREE</span>
                            ) : (
                              `₹${shipping.toLocaleString('en-IN')}`
                            )}
                          </span>
                        </div>

                        <div className="border-t border-rose-50 dark:border-slate-750 pt-4 flex justify-between items-baseline">
                          <span className="text-sm font-bold text-slate-800 dark:text-white">
                            Total
                          </span>
                          <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                            ₹{grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-2xl text-[10px] text-green-800 dark:text-green-400 font-semibold">
                        <CreditCard size={14} className="text-green-600 shrink-0 mt-0.5" />
                        <span>
                          Your order will continue through the same shipping validation, confirmation, and secure payment flow as the main marketplace checkout.
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/checkout')}
                        disabled={activeCartItems.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <CreditCard size={16} />
                        Proceed to Checkout
                      </button>

                      <button
                        type="button"
                        onClick={() => clearCart()}
                        className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Clear Cart
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-lg mx-auto text-center py-20 px-6 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl shadow-xs">
                  <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
                    <ShoppingBag size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {savedForLaterItems.length > 0 ? 'Your Cart is Empty' : 'Your Cart is Empty'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
                    {savedForLaterItems.length > 0
                      ? 'Your saved-for-later items are kept below. Move an item back to the cart whenever you are ready.'
                      : 'Explore marketplace products and add your choices here.'}
                  </p>

                  {savedForLaterItems.length > 0 && (
                    <div className="mt-6 space-y-3 text-left">
                      <div className="flex items-center gap-2 px-1">
                        <Clock size={14} className="text-slate-400" />
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Saved for Later
                        </h3>
                      </div>
                      {savedForLaterItems.map((item) => (
                        <div
                          key={item.product._id}
                          className="flex items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                              <img
                                src={item.product.imageUrl || 'https://via.placeholder.com/150'}
                                alt={item.product.title || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-slate-800 dark:text-white">
                                {item.product.title || 'Unknown Product'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                ₹{Number(item.product.price || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSaveForLater(item.product._id)}
                            className="px-3 py-1.5 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            Move to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => navigate(continueShoppingLink)}
                    className="mt-6 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
                onClick={() => { if (theme === 'dark') toggleTheme(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'light'
                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-250 text-rose-600 shadow-xs'
                  : 'bg-transparent text-slate-400 hover:bg-slate-55 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                  } cursor-pointer`}
              >
                Light
              </button>
              <button
                onClick={() => { if (theme === 'light') toggleTheme(); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'dark'
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
