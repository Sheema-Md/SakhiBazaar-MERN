import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;
