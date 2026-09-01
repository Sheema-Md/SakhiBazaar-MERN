import { useState, useEffect, useContext } from 'react';
import { Outlet, Link, useLocation, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import {
  Home, Tag, CreditCard,
  Settings, User,
  PlusCircle, Sparkles, Search,
  Users, Heart, X, ArrowLeftRight, ShoppingCart
} from 'lucide-react';

const DashboardLayout = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentView = searchParams.get('view') || 'dashboard';

  // State controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer status
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  // Keep collapse status saved
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  // Adjust sidebar state on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define sidebar navigation lists based on user role
  const getSidebarMenu = () => {
    if (!user) return [];

    if (user.role === 'seller') {
      return [
        { label: t('dashboard') || 'Dashboard', view: 'dashboard', icon: Home, link: '/dashboard' },
        { label: t('browse') || 'Browse Products', view: 'browse', icon: Search, link: '/dashboard' },
        { label: t('addProduct') || 'Add Product', view: 'add-product', icon: PlusCircle, link: '/dashboard' },
        { label: t('myProducts') || 'My Products', view: 'products', icon: Tag, link: '/dashboard' },
        { label: t('yourOrders') || 'Orders', view: 'orders', icon: CreditCard, link: '/dashboard' },
        { label: t('shipments') || 'Shipments', view: 'shipments', icon: ArrowLeftRight, link: '/dashboard' },
        { label: t('myCustomers') || 'My Customers', view: 'customers', icon: Users, link: '/dashboard' },
        { label: t('salesAnalytics') || 'Sales Analytics', view: 'analytics', icon: Sparkles, link: '/dashboard' },
        { label: t('wishlistTitle') || 'Wishlist', view: 'wishlist', icon: Heart, link: '/dashboard' },
        { label: t('shoppingCart') || 'Cart', view: 'cart', icon: ShoppingCart, link: '/cart' },
        { label: t('profile') || 'Profile', view: 'profile', icon: User, link: '/dashboard' },
        { label: t('accountSettings') || 'Settings', view: 'settings', icon: Settings, link: '/dashboard' },
      ];
    }

    // Customer
    return [
      { label: t('dashboard') || 'Dashboard', view: 'dashboard', icon: Home, link: '/customer-dashboard' },
      { label: t('browse') || 'Browse', view: 'browse', icon: Search, link: '/customer-dashboard' },
      { label: t('yourOrders') || 'Orders', view: 'orders', icon: CreditCard, link: '/customer-dashboard' },
      { label: t('shipments') || 'Shipments', view: 'shipments', icon: ArrowLeftRight, link: '/customer-dashboard' },
      { label: t('wishlistTitle') || 'Wishlist', view: 'wishlist', icon: Heart, link: '/customer-dashboard' },
      { label: t('shoppingCart') || 'Cart', view: 'cart', icon: ShoppingCart, link: '/customer-dashboard' },
      { label: t('profile') || 'Profile', view: 'profile', icon: User, link: '/customer-dashboard' },
      { label: t('accountSettings') || 'Settings', view: 'settings', icon: Settings, link: '/customer-dashboard' },
    ];
  };

  const menuItems = getSidebarMenu();

  const isLinkActive = (item) => {
    return location.pathname === item.link && currentView === item.view;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans flex flex-col">
      
      {/* Universal header */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      {/* Main layout container with sidebar */}
      <div className="flex-grow flex relative">
        
        {/* 1. Mobile Sidebar Drawer overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 2. Responsive collapsible sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 border-r border-rose-100/30 dark:border-slate-700
            transform transition-all duration-300 lg:translate-x-0 lg:static flex flex-col shrink-0
            ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
            ${!isSidebarOpen && isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          `}
        >
          {/* Brand header on mobile sidebar */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-rose-100/30 dark:border-slate-700 lg:hidden">
            <span className="text-sm font-bold bg-gradient-to-r from-rose-600 to-purple-600 dark:from-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
              Sakhi Dashboard
            </span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toggle sidebar button (Desktop only) */}
          <div className="hidden lg:flex justify-end p-2 border-b border-rose-100/20 dark:border-slate-700/50">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 rounded-xl transition-all"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item);
              return (
                <Link
                  key={`${item.view}-${item.label}`}
                  to={`${item.link}?view=${item.view}`}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center rounded-2xl text-base font-bold transition-all duration-200 ${
                    isCollapsed ? 'justify-center p-3.5' : 'gap-3.5 px-4 py-3'
                  } ${
                    active
                      ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-md shadow-rose-200/50 dark:shadow-none'
                      : 'text-slate-750 dark:text-slate-200 hover:bg-rose-50/80 dark:hover:bg-slate-700/60 hover:text-rose-600 dark:hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="shrink-0" />
                  {(!isCollapsed || isSidebarOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom user quick detail */}
          <div className="p-4 border-t border-rose-100/30 dark:border-slate-700 bg-rose-50/10 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-rose-500 to-indigo-650 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              {(!isCollapsed || isSidebarOpen) && (
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-extrabold truncate text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs font-bold text-slate-400 truncate leading-none mt-0.5 capitalize">{user?.role}</p>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* 3. Main content area */}
        <div className="flex-grow flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-grow p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
          <Footer />
        </div>

      </div>

    </div>
  );
};

export default DashboardLayout;
