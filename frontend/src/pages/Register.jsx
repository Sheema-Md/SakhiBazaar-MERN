import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Lock, Mail, User, AlertCircle, Store, UserCheck, Eye, EyeOff, Phone, CreditCard } from 'lucide-react';

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

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        window.location.href = 'http://localhost:5174/login';
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
      const stored = localStorage.getItem('sakhi_user');
      if (stored) {
        const loggedUser = JSON.parse(stored);
        if (loggedUser.role === 'seller') navigate('/dashboard');
        else navigate('/customer-dashboard');
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 px-4 py-12 dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-xl w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-rose-100/50 dark:border-slate-700/50 shadow-xl shadow-rose-100/30 dark:shadow-none transition-all duration-300">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-650 text-white shadow-md shadow-rose-200">
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
              <label htmlFor="password" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-605 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock size={16} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-rose-605 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  role === 'customer'
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
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                  role === 'seller'
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
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-rose-500 to-indigo-650 hover:from-rose-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-md shadow-rose-200 dark:shadow-none transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
