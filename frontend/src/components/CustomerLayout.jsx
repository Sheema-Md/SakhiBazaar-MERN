import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = () => {
  const location = useLocation();
  const isOrderSuccess = location.pathname === '/order-success';
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      <div className={isOrderSuccess ? 'no-print' : ''}><Header /></div>
      <main className="grow">
        <Outlet />
      </main>
      <div className={isOrderSuccess ? 'no-print' : ''}><Footer /></div>
    </div>
  );
};

export default CustomerLayout;
