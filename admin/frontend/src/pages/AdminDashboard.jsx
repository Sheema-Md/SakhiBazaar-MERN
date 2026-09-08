import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthContext } from '../context/AdminAuthContext';
import MarketPriceWidget from '../components/MarketPriceWidget';
import { ADMIN_API_URL, MAIN_API_URL } from '../config/api';
import {
  ShieldAlert, Users, ShoppingBag, Tag, CreditCard, Sparkles, Key, LogOut,
  Sun, Moon, CheckCircle, AlertCircle, Trash2, Shield, Eye, Globe, UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { adminUser, logout, theme, toggleTheme } = useContext(AdminAuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active view: default 'dashboard'
  const activeView = searchParams.get('view') || 'dashboard';

  // API states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password reset form
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch admin dashboard details
  const fetchAdminData = async () => {
    if (!adminUser) return;
    setLoading(true);
    setError('');
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminUser.token}` },
      };

      const [resUsers, resProducts, resOrders, resAnalytics] = await Promise.all([
        axios.get(`${ADMIN_API_URL}/users`, config),
        axios.get(`${ADMIN_API_URL}/products`, config),
        axios.get(`${ADMIN_API_URL}/orders`, config),
        axios.get(`${ADMIN_API_URL}/analytics`, config),
      ]);

      setUsers(resUsers.data || []);
      setProducts(resProducts.data || []);
      setOrders(resOrders.data || []);
      setAnalytics(resAnalytics.data?.metrics || null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminUser, activeView]);

  // Vetting sellers / Approve status
  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      await axios.put(
        `${ADMIN_API_URL}/users/${userId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminUser.token}` } }
      );
      setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      alert(`User status updated to "${newStatus}"!`);
      // Reload stats
      const resAnalytics = await axios.get(`${ADMIN_API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${adminUser.token}` }
      });
      setAnalytics(resAnalytics.data?.metrics || null);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Flag products
  const handleUpdateProductStatus = async (productId, newStatus) => {
    try {
      await axios.put(
        `${ADMIN_API_URL}/products/${productId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminUser.token}` } }
      );
      setProducts(products.map(p => p._id === productId ? { ...p, status: newStatus } : p));
      alert(`Product marked as "${newStatus}"!`);
    } catch (err) {
      alert('Failed to update product status.');
    }
  };

  // Delete accounts
  const handleDeleteUser = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove user account: "${name}"?`)) {
      try {
        await axios.delete(`${ADMIN_API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${adminUser.token}` },
        });
        setUsers(users.filter(u => u._id !== userId));
        alert('User deleted.');
      } catch (err) {
        alert('Failed to delete user.');
      }
    }
  };

  // Delete products
  const handleDeleteProduct = async (prodId, title) => {
    if (window.confirm(`Are you sure you want to remove product: "${title}"?`)) {
      try {
        await axios.delete(`${ADMIN_API_URL}/products/${prodId}`, {
          headers: { Authorization: `Bearer ${adminUser.token}` },
        });
        setProducts(products.filter(p => p._id !== prodId));
        alert('Product listing removed.');
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  // Password reset admin
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match!');
      return;
    }

    try {
      // In standalone, admin password updates point to the main profile update on 5000 or a mockup
      await axios.put(
        `${MAIN_API_URL}/auth/profile`,
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${adminUser.token}` } }
      );
      setPasswordSuccess('Admin credentials updated successfully!');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update credentials.');
    }
  };

  const menuItems = [
    { label: 'Overview', view: 'dashboard', icon: Shield },
    { label: 'Manage Users', view: 'users', icon: Users },
    { label: 'Sellers Vetting', view: 'sellers', icon: UserCheck },
    { label: 'Customers Log', view: 'customers', icon: Users },
    { label: 'Moderate Products', view: 'products', icon: Tag },
    { label: 'Platform Orders', view: 'orders', icon: CreditCard },
    { label: 'Platform Analytics', view: 'analytics', icon: Sparkles },
    { label: 'Admin Settings', view: 'settings', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex transition-colors duration-300 font-sans">

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-rose-100/30 dark:border-slate-700/60 flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="h-16 flex items-center px-6 border-b border-rose-100/30 dark:border-slate-700/60 gap-2.5">
            <ShieldAlert size={20} className="text-rose-500" />
            <span className="font-black text-sm uppercase tracking-wider text-rose-600 dark:text-rose-455">Admin Console</span>
          </div>

          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setSearchParams({ view: item.view })}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${active
                      ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100/20 dark:border-rose-900/30'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-750/30 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom panel */}
        <div className="p-4 border-t border-rose-100/30 dark:border-slate-700/60 bg-rose-50/10 dark:bg-slate-800/20 space-y-2">
          <div className="flex justify-between items-center px-2 py-1">
            <span className="text-[10px] font-bold text-slate-400">Mode theme</span>
            <button onClick={toggleTheme} className="text-slate-450 dark:text-slate-350 hover:text-rose-500">
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-750 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-slate-650 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-grow p-6 sm:p-8 overflow-y-auto max-h-screen space-y-6">

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: OVERVIEW DASHBOARD */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-500 to-indigo-650 p-6 sm:p-8 rounded-3xl text-white shadow-md">
              <h1 className="text-xl sm:text-2xl font-black">Platform Moderation Command</h1>
              <p className="text-xs text-rose-100 mt-1 max-w-sm">Manage users, approve entrepreneurs status, and flag listings violating terms.</p>
            </div>

            {/* Metrics cards */}
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700 shadow-xs">
                  <p className="text-xs text-slate-405 font-bold">Total Platform Users</p>
                  <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">{analytics.usersCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sellers: {analytics.sellersCount} | Customers: {analytics.customersCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700 shadow-xs">
                  <p className="text-xs text-slate-405 font-bold">Market Listings</p>
                  <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">{analytics.productsCount}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Moderated: {products.filter(p => p.status === 'flagged').length} Flagged</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700 shadow-xs">
                  <p className="text-xs text-slate-405 font-bold">Gross Volume (GMV)</p>
                  <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">₹{analytics.grossSalesVolume.toLocaleString('en-IN')}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Orders Count: {analytics.ordersCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700 shadow-xs">
                  <p className="text-xs text-slate-405 font-bold">Platform Commissions (10%)</p>
                  <h3 className="text-xl font-black mt-1 text-green-600 dark:text-green-450">₹{analytics.platformCommission.toLocaleString('en-IN')}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Charged at weekly settlements</p>
                </div>
              </div>
            )}

            {/* Pending Vetting Queue */}
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5"><Sun size={16} className="text-rose-500" /> Pending Seller Vetting Queue</h3>

              {users.filter(u => u.role === 'seller' && u.status === 'pending').length > 0 ? (
                <div className="divide-y divide-rose-50 dark:divide-slate-750">
                  {users.filter(u => u.role === 'seller' && u.status === 'pending').map(seller => (
                    <div key={seller._id} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white">{seller.name} (@{seller.username})</p>
                        <p className="text-[10px] text-slate-400">Aadhaar: {seller.aadhaarNumber} | Phone: {seller.phone || seller.phoneNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateUserStatus(seller._id, 'approved')} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">Approve</button>
                        <button onClick={() => handleUpdateUserStatus(seller._id, 'suspended')} className="px-3 py-1 bg-red-650 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg cursor-pointer">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-450 italic">No entrepreneurs pending credentials validation.</p>
              )}
            </div>

            {/* Market Prices and Trends Widget */}
            <MarketPriceWidget />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: MANAGE USERS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'users' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Registered Platform Accounts</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Moderation control pane for buyer profiles and seller credentials.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                      <th className="px-6 py-4">Name / Username</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Phone / Aadhaar</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Vetting Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold font-sans">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-850 dark:text-slate-105">{u.name}</p>
                          <p className="text-[10px] text-slate-400">@{u.username}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{u.email}</td>
                        <td className="px-6 py-4">
                          <p className="font-mono text-[10px]">{u.phone || u.phoneNumber}</p>
                          <p className="text-[9px] font-mono text-slate-400">Aadhaar: {u.aadhaarNumber || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${u.role === 'seller' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${u.status === 'approved' ? 'bg-green-150 text-green-800' :
                              u.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                            }`}>{u.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {u.status !== 'approved' && (
                              <button onClick={() => handleUpdateUserStatus(u._id, 'approved')} className="px-2 py-1 bg-green-600 text-white rounded text-[10px]">Approve</button>
                            )}
                            {u.status !== 'suspended' && (
                              <button onClick={() => handleUpdateUserStatus(u._id, 'suspended')} className="px-2 py-1 bg-amber-600 text-white rounded text-[10px]">Suspend</button>
                            )}
                            <button onClick={() => handleDeleteUser(u._id, u.name)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: SELLERS VETTING */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'sellers' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Entrepreneur Business Credentials Vetting</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Verify identity documents and manage approval checks.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {users.filter(u => u.role === 'seller').map((seller) => (
                <div key={seller._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Entrepreneur details</h4>
                      <p className="text-sm font-bold text-slate-850 dark:text-white mt-1">{seller.name}</p>
                      <p className="text-xs text-slate-450">@{seller.username} | {seller.email}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${seller.status === 'approved' ? 'bg-green-100 text-green-800' :
                        seller.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                      }`}>{seller.status}</span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-1.5 text-xs">
                    <p className="font-semibold text-slate-600 dark:text-slate-350">Aadhaar Validation: <span className="font-mono font-bold text-rose-500">{seller.aadhaarNumber || 'N/A'}</span></p>
                    <p className="font-semibold text-slate-600 dark:text-slate-350">Contact Phone: <span className="font-mono">{seller.phone || seller.phoneNumber}</span></p>
                    <p className="font-semibold text-slate-650 dark:text-slate-350 leading-relaxed">Storefront: {seller.address || 'No Address Logged'}</p>
                  </div>

                  <div className="flex gap-2">
                    {seller.status !== 'approved' && (
                      <button onClick={() => handleUpdateUserStatus(seller._id, 'approved')} className="flex-grow py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg">Approve business</button>
                    )}
                    {seller.status !== 'suspended' && (
                      <button onClick={() => handleUpdateUserStatus(seller._id, 'suspended')} className="flex-grow py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg">Suspend business</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: CUSTOMERS LOG */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Registered Customer Profiles</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Verify consumer registrations log.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Delivery Address</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold font-sans">
                    {users.filter(u => u.role === 'customer').map((customer) => (
                      <tr key={customer._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-105">{customer.name}</td>
                        <td className="px-6 py-4 text-slate-500">{customer.email}</td>
                        <td className="px-6 py-4 font-mono text-[10px]">{customer.phone || customer.phoneNumber}</td>
                        <td className="px-6 py-4 text-slate-500 truncate max-w-xs">{customer.address || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteUser(customer._id, customer.name)} className="p-1 text-slate-400 hover:text-red-500 rounded"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: MODERATE PRODUCTS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Moderate Catalog Products</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Flag listings violating terms or remove them from marketplace.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                      <th className="px-6 py-4">Product Info</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Seller</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold font-sans">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="font-bold text-slate-850 dark:text-white">{p.title}</p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">{p.category}</td>
                        <td className="px-6 py-4 font-bold">{p.seller?.name || 'Seller'}</td>
                        <td className="px-6 py-4 font-bold text-rose-600">₹{p.price}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-800'
                            }`}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {p.status === 'active' ? (
                              <button onClick={() => handleUpdateProductStatus(p._id, 'flagged')} className="px-2.5 py-1 bg-red-650 text-white rounded text-[10px] font-bold">Flag Listing</button>
                            ) : (
                              <button onClick={() => handleUpdateProductStatus(p._id, 'active')} className="px-2.5 py-1 bg-green-600 text-white rounded text-[10px] font-bold">Approve</button>
                            )}
                            <button onClick={() => handleDeleteProduct(p._id, p.title)} className="p-1 text-slate-450 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: PLATFORM ORDERS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Platform Orders Transactions</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Complete ledger registry of checkouts made on the bazaar.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Total Amount</th>
                      <th className="px-6 py-4">Order Status</th>
                      <th className="px-6 py-4">Timeline checkpoints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold font-sans">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="px-6 py-4 font-mono text-rose-500 font-bold">{o._id}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold">{o.customer?.name}</p>
                          <p className="text-[10px] text-slate-400">{o.customer?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-black">₹{o.totalAmount}</td>
                        <td className="px-6 py-4 capitalize">{o.orderStatus}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {o.timeline && o.timeline.length > 0 ? (
                            <span>{o.timeline[o.timeline.length - 1].status} ({new Date(o.timeline[o.timeline.length - 1].timestamp).toLocaleDateString()})</span>
                          ) : (
                            <span>Created</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: PLATFORM ANALYTICS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Platform Financial Analytics</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Real-time stats tracking GMV volume, seller counts, and commission payouts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Merchandise Value (GMV)</h4>
                <p className="text-3xl font-black text-rose-600">₹{analytics.grossSalesVolume.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accumulated Commission (10%)</h4>
                <p className="text-3xl font-black text-green-600">₹{analytics.platformCommission.toLocaleString('en-IN')}</p>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-rose-100/30 dark:border-slate-700 shadow-sm space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Entrepreneurs Settlements</h4>
                <p className="text-3xl font-black text-indigo-600">₹{(analytics.grossSalesVolume * 0.9).toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Visual SVG Progress Meter */}
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Commissions vs Volume Payout</h3>
              <div className="h-6 w-full bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                {/* Net Income 90% */}
                <div className="h-full bg-indigo-500 absolute left-0" style={{ width: '90%' }} title="Net Sellers Income" />
                {/* Platform Commissions 10% */}
                <div className="h-full bg-rose-500 absolute right-0" style={{ width: '10%' }} title="Commissions" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>₹{(analytics.grossSalesVolume * 0.9).toLocaleString()} (Sellers Settlements - 90%)</span>
                <span>₹{analytics.platformCommission.toLocaleString()} (Bazaar Payout - 10%)</span>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW: SETTINGS */}
        {/* ------------------------------------------------------------- */}
        {activeView === 'settings' && (
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Admin Profile & Security Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Change security passwords and configure account controls.</p>
            </div>

            {passwordError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 text-xs font-semibold rounded-xl">{passwordError}</div>}
            {passwordSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-755 text-xs font-semibold rounded-xl">{passwordSuccess}</div>}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">New Password</label>
                  <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Confirm Password</label>
                  <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer">
                Update Admin Password
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
