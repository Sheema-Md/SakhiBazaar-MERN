import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Sakhi Bazaar - Production Dynamic Notification Toast Component
 * Accessible, animated, auto-dismissing feedback banner.
 */
const Toast = ({ type = 'info', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100',
      icon: <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />,
      ring: 'focus:ring-emerald-500',
    },
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100',
      icon: <AlertCircle size={18} className="text-rose-600 dark:text-rose-400 shrink-0" />,
      ring: 'focus:ring-rose-500',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
      icon: <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />,
      ring: 'focus:ring-amber-500',
    },
    info: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-100',
      icon: <Info size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />,
      ring: 'focus:ring-indigo-500',
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-5 right-5 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-md max-w-md transition-all duration-300 animate-slideDown ${currentStyle.bg}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {currentStyle.icon}
        <span className="text-xs font-bold leading-relaxed truncate">{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Toast;
