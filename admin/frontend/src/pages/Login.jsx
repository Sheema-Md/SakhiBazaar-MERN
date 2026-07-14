import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { ShieldAlert, Key, Mail, RefreshCw } from 'lucide-react';

const Login = () => {
  const { adminUser, login } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (adminUser) {
      navigate('/');
    }
  }, [adminUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5001/api/admin/auth/login', {
        emailOrUsername,
        password,
      });
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700/60 p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/20 rounded-2xl flex items-center justify-center text-rose-500 mb-4">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white">Admin Control Console</h2>
          <p className="text-xs text-slate-400 dark:text-slate-450 mt-1">
            Access platform moderation, vetting logs, and transactional analysis.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-650 dark:text-red-400 text-xs font-semibold rounded-xl animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Username or Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="admin@sakhibazaar.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-850 dark:text-slate-105"
              />
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-850 dark:text-slate-105"
              />
              <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-500 to-indigo-650 hover:from-rose-600 hover:to-indigo-750 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : 'Log In to Console'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
