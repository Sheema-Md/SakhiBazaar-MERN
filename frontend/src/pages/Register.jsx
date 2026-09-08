import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  ShoppingBag,
  Lock,
  Mail,
  User,
  AlertCircle,
  Store,
  UserCheck,
  Phone,
  CreditCard
} from 'lucide-react';
import { ADMIN_APP_URL } from '../config/api';

const Register = () => {
  const { user, register, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(() => {
    const r = searchParams.get('role');
    if (r === 'seller' || r === 'customer') {
      return r;
    }
    return 'customer';
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        window.location.href = `${ADMIN_APP_URL}/login`;
      }
      else if (user.role === 'seller') navigate('/dashboard');
      else navigate('/customer-dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. @$!%*?&#).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    console.log('Register page submitting:', { name, email, phoneNumber, password, confirmPassword, role });
    const result = await register(name, undefined, email, phoneNumber, undefined, password, confirmPassword, role);
    setIsSubmitting(false);

    if (result.success) {
      // Navigates automatically due to useEffect, but fallback:
      const stored = sessionStorage.getItem('sakhi_user');
      if (stored) {
        const loggedUser = JSON.parse(stored);
        if (loggedUser.role === 'seller') navigate('/dashboard');
        else navigate('/customer-dashboard');
      }
    } else {
      setError(result.message);
    }
  };
  const handleGoogleSignIn = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      const result = await loginWithGoogle();

      if (!result?.success) {
        setError(result?.message || 'Google sign-in failed. Please try again.');
      }
    } catch (error) {
      console.error('Google registration error:', error);
      setError('Unable to continue with Google. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-linear-to-br from-rose-50 via-white to-indigo-50 px-4 py-12 dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-rose-100/50 dark:border-slate-700/50 shadow-xl shadow-rose-100/30 dark:shadow-none transition-all duration-300">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-linear-to-tr from-rose-500 to-indigo-650 text-white shadow-md shadow-rose-200">
            <ShoppingBag size={24} />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 font-medium">
            Join Sakhi Bazaar - marketplace for women entrepreneurs
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-sm animate-shake">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>

            <span>Continue with Google</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500">
                OR
              </span>
            </div>
          </div>
        </div>
        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="E.g. Priya Sharma"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label htmlFor="phoneNumber" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                Phone Number (10 digits)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone size={16} />
                </div>
                <input
                  id="phoneNumber"
                  type="text"
                  required
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="9876543210"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase"
              >
                Password
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>

                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                />


              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase"
              >
                Confirm Password
              </label>

              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>

                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                />


              </div>
            </div>

          </div>

          {/* Select Role */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase mb-2">
              Select Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Customer */}
              <div
                onClick={() => setRole('customer')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${role === 'customer'
                  ? 'border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-455'
                  : 'border-gray-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 text-gray-500 dark:text-slate-400'
                  }`}
              >
                <UserCheck size={22} className="mb-1" />
                <span className="text-xs font-bold">Customer</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 font-medium">Browse & Buy</span>
              </div>

              {/* Seller */}
              <div
                onClick={() => setRole('seller')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${role === 'seller'
                  ? 'border-rose-500 bg-rose-50/50 text-rose-700 dark:bg-rose-955/20 dark:text-rose-455'
                  : 'border-gray-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 text-gray-500 dark:text-slate-400'
                  }`}
              >
                <Store size={22} className="mb-1" />
                <span className="text-xs font-bold">Seller</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5 font-medium">List & Sell</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-linear-to-r from-rose-500 to-indigo-650 hover:from-rose-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-md shadow-rose-200 dark:shadow-none transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
