import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (user.role === 'seller' && user.status !== 'approved') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50 p-6 text-center">
        <div className="max-w-md w-full bg-white border border-gray-150 p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {user.status === 'suspended' ? 'Account Suspended' : 'Entrepreneur Vetting in Progress'}
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              {user.status === 'suspended'
                ? 'Your seller account has been temporarily suspended by the administration. Please contact support@sakhibazaar.com for assistance.'
                : 'To maintain high quality standards on Sakhi Bazaar, new entrepreneur applications are reviewed manually. We will notify you by email once your store is approved.'}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Log Out / Switch Account
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
