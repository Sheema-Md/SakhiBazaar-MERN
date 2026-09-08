import { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { ADMIN_API_URL } from '../config/api';
import {
    Activity, BarChart3, Boxes, Check, ChevronLeft, ChevronRight, CircleDollarSign,
    LayoutDashboard, LogOut, Menu, Package, RefreshCw, Search, ShieldCheck,
    Store, Tags, Trash2, UserRound, Users, X, Zap
} from 'lucide-react';

const api = axios.create({ baseURL: ADMIN_API_URL });
const views = [
    ['dashboard', 'Overview', LayoutDashboard], ['users', 'Users', Users], ['sellers', 'Seller vetting', Store],
    ['products', 'Products', Package], ['categories', 'Categories', Tags], ['orders', 'Orders', Boxes],
    ['returns', 'Returns', RefreshCw], ['refunds', 'Refunds', CircleDollarSign], ['market', 'Market data', BarChart3],
    ['reports', 'Reports', Zap], ['activity', 'Activity', Activity],
];

const AdminDashboardComplete = () => {
    const { adminUser, logout, theme, toggleTheme } = useContext(AdminAuthContext);
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();
    const view = params.get('view') || 'dashboard';
    const [data, setData] = useState({ users: [], products: [], orders: [], returns: [], refunds: [], categories: [], notifications: [] });
    const [analytics, setAnalytics] = useState(null);
    const [market, setMarket] = useState({ prices: [], trends: [] });
    const [report, setReport] = useState(null);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [mobileOpen, setMobileOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const config = useMemo(() => ({ headers: { Authorization: `Bearer ${adminUser?.token}` } }), [adminUser]);
    const request = async (method, url, body) => {
        const response = method === 'delete'
            ? await api.delete(url, config)
            : await api[method](url, body, config);
        return response.data;
    };
    const notify = (type, text) => setMessage({ type, text });

    const load = async () => {
        if (!adminUser) return;
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const common = { params: { q: query || undefined, status: status || undefined, page, limit: 15 }, ...config };
            if (view === 'dashboard') {
                const [metrics, users, products] = await Promise.all([
                    api.get('/analytics', config), api.get('/users', { ...common, params: { ...common.params, limit: 5 } }), api.get('/products', { ...common, params: { ...common.params, limit: 5 } }),
                ]);
                setAnalytics(metrics.data.metrics); setData((current) => ({ ...current, users: users.data.items || [], products: products.data.items || [] }));
            } else if (['users', 'sellers'].includes(view)) {
                const response = await api.get('/users', { ...common, params: { ...common.params, role: view === 'sellers' ? 'seller' : undefined } });
                setData((current) => ({ ...current, users: response.data.items || [] })); setPages(response.data.pages || 1);
            } else if (view === 'products') {
                const response = await api.get('/products', common); setData((current) => ({ ...current, products: response.data.items || [] })); setPages(response.data.pages || 1);
            } else if (view === 'orders') {
                const response = await api.get('/orders', common); setData((current) => ({ ...current, orders: response.data.items || [] })); setPages(response.data.pages || 1);
            } else if (view === 'categories') {
                const response = await api.get('/categories', config); setData((current) => ({ ...current, categories: response.data || [] }));
            } else if (view === 'returns' || view === 'refunds') {
                const response = await api.get(`/${view}`, { ...config, params: { status: status || undefined } }); setData((current) => ({ ...current, [view]: response.data || [] }));
            } else if (view === 'market') {
                const response = await api.get('/market-data', config); setMarket(response.data || { prices: [], trends: [] });
            } else if (view === 'activity') {
                const response = await api.get('/notifications', config); setData((current) => ({ ...current, notifications: response.data || [] }));
            } else if (view === 'reports') {
                const response = await api.get('/reports/revenue', { ...config, params: dateRange }); setReport(response.data);
            }
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) { logout(); navigate('/login'); return; }
            notify('error', error.response?.data?.message || 'Unable to load this admin view.');
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [view, page, status, adminUser]);
    useEffect(() => { setPage(1); }, [view, query, status]);

    const updateUser = async (id, nextStatus) => {
        if (!window.confirm(`Set this account to ${nextStatus}?`)) return;
        try { await request('put', `/users/${id}/status`, { status: nextStatus }); notify('success', 'Account status updated.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Could not update account.'); }
    };
    const deleteItem = async (kind, id, label) => {
        if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
        try { await request('delete', `/${kind}/${id}`); notify('success', 'Deleted successfully.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Delete failed.'); }
    };
    const updateStatus = async (kind, orderId, requestIndex, nextStatus) => {
        if (!window.confirm(`Set this request to ${nextStatus}?`)) return;
        try { await request('put', `/${kind}/${orderId}/${requestIndex}`, { status: nextStatus }); notify('success', 'Request updated.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Update failed.'); }
    };
    const updateProductStatus = async (productId, nextStatus) => {
        if (!window.confirm(`Set this product to ${nextStatus}?`)) return;
        try { await request('put', `/products/${productId}/status`, { status: nextStatus }); notify('success', 'Product status updated.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Product update failed.'); }
    };
    const updateOrderStatus = async (orderId, nextStatus) => {
        if (!window.confirm(`Set this order to ${nextStatus}?`)) return;
        try { await request('put', `/orders/${orderId}/status`, { orderStatus: nextStatus }); notify('success', 'Order status updated.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Order update failed.'); }
    };
    const updateMarketSource = async (price) => {
        const source = window.prompt('Market data source', price.source || '');
        if (source === null || !source.trim()) return;
        try { await request('put', `/market-data/prices/${price._id}`, { source }); notify('success', 'Market source updated.'); load(); } catch (error) { notify('error', error.response?.data?.message || 'Market source update failed.'); }
    };

    const Metric = ({ label, value, detail }) => <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5"><p className="text-xs font-bold text-slate-500">{label}</p><p className="text-2xl font-black mt-2">{value}</p>{detail && <p className="text-[11px] text-slate-400 mt-1">{detail}</p>}</div>;
    const TableTools = ({ statuses = [] }) => <div className="flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records..." className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs" /></div>{statuses.length > 0 && <select value={status} onChange={(event) => setStatus(event.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs"><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>}</div>;
    const Pager = () => pages > 1 && <div className="flex items-center justify-end gap-2 pt-4"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronLeft size={15} /></button><span className="text-xs text-slate-500">Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="p-2 border rounded-lg disabled:opacity-40"><ChevronRight size={15} /></button></div>;
    const Shell = ({ children }) => <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex"><aside className={`${mobileOpen ? 'fixed inset-y-0 left-0 z-20' : 'hidden'} lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col`}><div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2"><ShieldCheck className="text-rose-600" size={20} /><strong className="text-sm">Admin Console</strong><button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}><X size={18} /></button></div><nav className="p-3 space-y-1 overflow-y-auto">{views.map(([key, label, Icon]) => <button key={key} onClick={() => { setParams({ view: key }); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left ${view === key ? 'bg-rose-50 text-rose-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}><Icon size={16} />{label}</button>)}</nav><div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 space-y-2"><button onClick={toggleTheme} className="w-full text-left text-xs text-slate-500">Theme: {theme}</button><button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"><LogOut size={15} /> Sign out</button></div></aside><main className="flex-1 min-w-0"><header className="h-16 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur"><button className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div><p className="text-sm font-black">{views.find(([key]) => key === view)?.[1]}</p><p className="text-[11px] text-slate-400">Signed in as {adminUser?.email}</p></div><button onClick={load} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Refresh"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button></header><div className="p-4 sm:p-8 max-w-[1600px] mx-auto">{message.text && <div className={`mb-5 px-4 py-3 rounded-xl text-xs font-bold ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>}{children}</div></main></div>;

    const renderDashboard = () => analytics && <div className="space-y-6"><div><h1 className="text-2xl font-black">Platform overview</h1><p className="text-sm text-slate-500 mt-1">Moderation, commerce, financial, and support health in one place.</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Metric label="Users" value={analytics.usersCount} detail={`${analytics.sellersCount} sellers · ${analytics.customersCount} customers`} /><Metric label="Products" value={analytics.productsCount} /><Metric label="Orders" value={analytics.ordersCount} /><Metric label="Revenue" value={`₹${Number(analytics.grossSalesVolume || 0).toLocaleString('en-IN')}`} detail={`Commission ₹${Number(analytics.platformCommission || 0).toLocaleString('en-IN')}`} /><Metric label="Returns" value={analytics.returnsCount || 0} /><Metric label="Refunds" value={analytics.refundsCount || 0} /></div><section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><h2 className="text-sm font-black mb-4">Pending seller approvals</h2>{data.users.filter((user) => user.role === 'seller' && user.status === 'pending').map((user) => <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 py-3 border-t first:border-t-0"><div><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div><div className="flex gap-2"><button onClick={() => updateUser(user._id, 'approved')} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold">Approve</button><button onClick={() => updateUser(user._id, 'suspended')} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">Reject</button></div></div>)}{!data.users.some((user) => user.role === 'seller' && user.status === 'pending') && <p className="text-xs text-slate-500">No pending seller registrations.</p>}</section></div>;
    const renderUsers = (role) => <div className="space-y-5"><TableTools statuses={['approved', 'pending', 'suspended']} /><section className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-4">User</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{data.users.map((user) => <tr key={user._id} className="border-b last:border-0"><td className="p-4"><p className="font-bold">{user.name}</p><p className="text-slate-500">{user.email}</p></td><td className="p-4 capitalize">{user.role}</td><td className="p-4 capitalize">{user.status}</td><td className="p-4 text-right space-x-2"><button onClick={() => updateUser(user._id, user.status === 'approved' ? 'suspended' : 'approved')} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-bold">{user.status === 'approved' ? 'Deactivate' : 'Activate'}</button><button onClick={() => deleteItem('users', user._id, user.name)} className="p-1 text-red-500"><Trash2 size={15} /></button></td></tr>)}</tbody></table></section><Pager /></div>;
    const renderProducts = () => <div className="space-y-5"><TableTools statuses={['active', 'flagged']} /><section className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-4">Product</th><th className="p-4">Seller</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Actions</th></tr></thead><tbody>{data.products.map((product) => <tr key={product._id} className="border-b last:border-0"><td className="p-4 font-bold">{product.title}<span className="block text-slate-500 font-normal">{product.sku || 'No SKU'}</span></td><td className="p-4">{product.seller?.name || 'Unknown'}</td><td className="p-4">{product.category}</td><td className="p-4 font-black">₹{product.price}</td><td className="p-4"><button onClick={() => updateProductStatus(product._id, product.status === 'active' ? 'flagged' : 'active')} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{product.status === 'active' ? 'Deactivate' : 'Activate'}</button><button onClick={() => deleteItem('products', product._id, product.title)} className="p-1 text-red-500 ml-2"><Trash2 size={15} /></button></td></tr>)}</tbody></table></section><Pager /></div>;
    const renderOrders = () => <div className="space-y-5"><TableTools statuses={['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']} /><section className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Created</th><th className="p-4">Manage</th></tr></thead><tbody>{data.orders.map((order) => <tr key={order._id} className="border-b last:border-0"><td className="p-4 font-mono">#{String(order._id).slice(-8)}</td><td className="p-4">{order.customer?.name}<span className="block text-slate-500">{order.customer?.email}</span></td><td className="p-4 font-black">₹{order.totalAmount}</td><td className="p-4">{order.orderStatus}</td><td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td><td className="p-4"><select value={order.orderStatus} onChange={(event) => updateOrderStatus(order._id, event.target.value)} className="rounded-lg border px-2 py-1 text-xs"><option>Pending</option><option>Confirmed</option><option>Processing</option><option>Packed</option><option>Shipped</option><option>Out For Delivery</option><option>Delivered</option><option>Cancelled</option></select></td></tr>)}</tbody></table></section><Pager /></div>;
    const renderRequests = (kind) => { const items = data[kind]; return <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">{items.map((item) => <section key={`${item.orderId}-${item.requestIndex}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"><div className="flex justify-between gap-3"><div><p className="font-black text-sm">Order #{String(item.orderId).slice(-8)}</p><p className="text-xs text-slate-500">{item.customer?.name} · {item.customer?.email}</p></div><span className="text-xs font-bold">{item.status}</span></div>{kind === 'returns' ? <><p className="text-xs"><strong>Reason:</strong> {item.reason || 'Not provided'}</p>{item.defectImages?.length > 0 && <div className="flex gap-2 flex-wrap">{item.defectImages.map((image) => <a key={image} href={image} target="_blank" rel="noreferrer"><img src={image} alt="Return evidence" className="w-16 h-16 rounded-lg object-cover" /></a>)}</div>}</> : <p className="text-xs"><strong>Amount:</strong> ₹{item.amount || 0} · <strong>Method:</strong> {item.method || 'Not specified'}</p>}<div className="flex gap-2">{kind === 'returns' && item.status === 'Requested' && <><button onClick={() => updateStatus('returns', item.orderId, item.requestIndex, 'Approved')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold">Approve</button><button onClick={() => updateStatus('returns', item.orderId, item.requestIndex, 'Rejected')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">Reject</button></>}{kind === 'refunds' && item.status === 'Requested' && <button onClick={() => updateStatus('refunds', item.orderId, item.requestIndex, 'Processing')} className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold">Process</button>}{kind === 'refunds' && item.status === 'Processing' && <><button onClick={() => updateStatus('refunds', item.orderId, item.requestIndex, 'Refunded')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold">Complete</button><button onClick={() => updateStatus('refunds', item.orderId, item.requestIndex, 'Failed')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold">Fail</button></>}</div></section>)}{items.length === 0 && <p className="text-sm text-slate-500">No requests found.</p>}</div>; };

    let content = view === 'dashboard' ? renderDashboard() : view === 'users' ? renderUsers('all') : view === 'sellers' ? renderUsers('seller') : view === 'products' ? renderProducts() : view === 'orders' ? renderOrders() : ['returns', 'refunds'].includes(view) ? renderRequests(view) : view === 'categories' ? <div className="space-y-4"><div className="flex gap-2"><input id="new-category" placeholder="Category name" className="px-3 py-2 rounded-xl border bg-white dark:bg-slate-900 text-xs" /><button onClick={async () => { const input = document.getElementById('new-category'); if (!input.value.trim()) return; await request('post', '/categories', { name: input.value.trim() }); input.value = ''; notify('success', 'Category created.'); load(); }} className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Add category</button></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{data.categories.map((category) => <div key={category._id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border rounded-xl text-sm font-bold">{category.name}<button onClick={() => deleteItem('categories', category._id, category.name)} className="text-red-500"><Trash2 size={15} /></button></div>)}</div></div> : view === 'market' ? <div className="space-y-6"><section className="grid grid-cols-1 md:grid-cols-2 gap-4">{market.prices.map((price) => <div key={price._id || price.category} className="p-4 bg-white dark:bg-slate-900 border rounded-xl"><div className="flex justify-between gap-2"><p className="font-black">{price.productName || price.category}</p><button onClick={() => updateMarketSource(price)} className="text-xs text-rose-600 font-bold">Edit source</button></div><p className="text-lg font-black text-rose-600">₹{price.currentPrice}</p><p className="text-xs text-slate-500">Range ₹{price.referenceRange?.min || 0}–₹{price.referenceRange?.max || 0} · {price.source || price.dataSource}</p><p className="text-xs text-slate-400">As of {price.dataAsOf ? new Date(price.dataAsOf).toLocaleString() : 'n/a'} · ML {price.prediction?.model || 'not available'}</p></div>)}</section><section className="bg-white dark:bg-slate-900 border rounded-xl p-5"><h2 className="font-black text-sm mb-3">Recommendation and trend signals</h2>{market.trends.map((trend) => <div key={trend._id || trend.category} className="flex justify-between border-t py-3 text-xs"><span className="font-bold">{trend.category}</span><span>{trend.demandTrend} demand · {trend.supplyTrend} supply · {trend.dataSource || trend.source}</span></div>)}</section></div> : view === 'reports' ? <div className="space-y-5"><div className="flex flex-wrap gap-2"><input type="date" value={dateRange.from} onChange={(event) => setDateRange({ ...dateRange, from: event.target.value })} className="px-3 py-2 rounded-xl border text-xs" /><input type="date" value={dateRange.to} onChange={(event) => setDateRange({ ...dateRange, to: event.target.value })} className="px-3 py-2 rounded-xl border text-xs" /><button onClick={load} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Generate report</button></div>{report && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><Metric label="Orders" value={report.orders} /><Metric label="Revenue" value={`₹${Number(report.revenue).toLocaleString('en-IN')}`} /><Metric label="Days reported" value={Object.keys(report.daily || {}).length} /></div>}</div> : <div className="space-y-3">{data.notifications.map((notification) => <div key={notification._id} className="p-4 bg-white dark:bg-slate-900 border rounded-xl"><p className="text-sm">{notification.text}</p><p className="text-xs text-slate-500 mt-1">{notification.recipient?.email || 'System'} · {new Date(notification.createdAt).toLocaleString()}</p></div>)}</div>;

    return <Shell>{content}</Shell>;
};

export default AdminDashboardComplete;
