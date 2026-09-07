import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { KeyRound, Mail, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { t } = useLanguage();

  // Forgot password steps: 'email' -> 'otp' -> 'reset' -> 'success'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(res.data.message || 'OTP sent successfully.');
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Check email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle new password set
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError(t('passwordMismatch') || 'New passwords do not match!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        password,
      });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="flex justify-center">
          <div className="p-3 bg-linear-to-tr from-rose-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-rose-200 dark:shadow-none animate-bounce">
            <KeyRound size={28} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-black tracking-tight bg-linear-to-r from-rose-600 via-purple-600 to-indigo-600 dark:from-rose-400 dark:to-purple-400 bg-clip-text text-transparent">
          {step === 'email' && 'Forgot Password'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'reset' && 'Reset Password'}
          {step === 'success' && 'Reset Complete!'}
        </h2>
        <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {step === 'email' && 'Enter your registered email to receive verification code'}
          {step === 'otp' && `We sent a 6-digit OTP code to ${email}`}
          {step === 'reset' && 'Create a strong new password for your account'}
          {step === 'success' && 'Your credentials have been securely updated'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 sm:px-10 border border-rose-50/50 dark:border-slate-700/50 shadow-xl shadow-slate-100/50 dark:shadow-none rounded-3xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-950/30 rounded-2xl text-xs font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/30 rounded-2xl text-xs font-semibold">
              {message}
            </div>
          )}

          {/* STEP 1: Enter email */}
          {step === 'email' && (
            <form className="space-y-4" onSubmit={handleEmailSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-rose-500 focus:border-rose-500 text-sm focus:outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-linear-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transition-all"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Verify OTP code */}
          {step === 'otp' && (
            <form className="space-y-4" onSubmit={handleOtpVerify}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-rose-500 focus:border-rose-500 text-sm tracking-widest font-bold focus:outline-none transition-all"
                    placeholder="123456"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-linear-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transition-all"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-center text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline mt-2 flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Back to email
              </button>
            </form>
          )}

          {/* STEP 3: Enter and confirm new password */}
          {step === 'reset' && (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-rose-500 focus:border-rose-500 text-sm focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-2xl focus:ring-rose-500 focus:border-rose-500 text-sm focus:outline-none transition-all"
                    placeholder="••••••••"
                  />

                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-linear-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transition-all"
              >
                {loading ? 'Saving...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* STEP 4: Success confirmation */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center text-green-500">
                <CheckCircle size={56} className="animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password updated successfully!
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-linear-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-750 focus:outline-none shadow-md shadow-rose-200 dark:shadow-none hover:shadow-lg transition-all"
              >
                Go to Login
              </Link>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft size={12} /> Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
