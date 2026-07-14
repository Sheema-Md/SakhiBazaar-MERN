import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center px-6 py-12 transition-colors duration-300 font-sans">
      <div className="text-center max-w-md w-full space-y-6">
        
        {/* SVG Illustration Container */}
        <div className="flex justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-indigo-600/10 blur-3xl rounded-full scale-75 animate-pulse" />
          <div className="relative p-6 bg-white dark:bg-slate-800 border border-rose-100/50 dark:border-slate-700/50 rounded-full shadow-lg shadow-rose-100/20 dark:shadow-none animate-bounce">
            <Compass size={64} className="text-rose-500 dark:text-rose-400" />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <h1 className="text-8xl font-black bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight select-none">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The link you followed might be broken, or the page may have been removed. Let's get you back on track!
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transform active:scale-95 transition-all"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
