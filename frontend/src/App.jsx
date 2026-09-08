
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';

import { AuthProvider } from './context/AuthProvider';
import { AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeProvider';
import { SocketProvider } from './context/SocketProvider';
import { CartProvider } from './context/CartProvider';
import { WishlistProvider } from './context/WishlistProvider';
import { LanguageProvider } from './context/LanguageProvider';

import ProtectedRoute from './components/ProtectedRoute';
import CustomerLayout from './components/CustomerLayout';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetails from './pages/ProductDetails';
import Chat from './pages/Chat';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderFailure from './pages/OrderFailure';
import CustomerDashboard from './pages/CustomerDashboard';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import InfoPage from './pages/InfoPage';


// ---------------------------------------------------------
// ROOT ROUTE
// Logged-in users go directly to their dashboard.
// Logged-out users see the landing page.
// ---------------------------------------------------------
function HomeRedirect() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <LandingPage />;
  }

  if (user.role === 'seller') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === 'customer') {
    return <Navigate to="/customer-dashboard?view=dashboard" replace />;
  }

  // Fallback for any unexpected role
  return <LandingPage />;
}


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <WishlistProvider>
            <CartProvider>
              <SocketProvider>
                <Router>
                  <Routes>

                    {/* -------------------------------------------------
                        ROOT
                        / → Landing page when logged out
                        / → Dashboard when logged in
                    -------------------------------------------------- */}
                    <Route path="/" element={<HomeRedirect />} />


                    {/* -------------------------------------------------
                        CUSTOMER / PUBLIC ROUTES
                    -------------------------------------------------- */}
                    <Route element={<CustomerLayout />}>

                      <Route path="/login" element={<Login />} />

                      <Route path="/register" element={<Register />} />

                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />

                      <Route path="/about" element={<InfoPage />} />
                      <Route path="/privacy-policy" element={<InfoPage />} />
                      <Route path="/terms-conditions" element={<InfoPage />} />

                      <Route
                        path="/product/:id"
                        element={<ProductDetails />}
                      />

                      <Route
                        path="/cart"
                        element={<Cart />}
                      />

                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/order-success"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <OrderSuccess />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/order-failure"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <OrderFailure />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/chat"
                        element={
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <Chat />
                          </ProtectedRoute>
                        }
                      />

                    </Route>


                    {/* -------------------------------------------------
                        CUSTOMER DASHBOARD
                    -------------------------------------------------- */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['customer']}>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route
                        path="/customer-dashboard"
                        element={<CustomerDashboard />}
                      />
                    </Route>


                    {/* -------------------------------------------------
                        SELLER DASHBOARD
                    -------------------------------------------------- */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['seller']}>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route
                        path="/dashboard"
                        element={<SellerDashboard />}
                      />

                      <Route
                        path="/add-product"
                        element={<AddProduct />}
                      />

                      <Route
                        path="/edit-product/:id"
                        element={<EditProduct />}
                      />
                    </Route>


                    {/* -------------------------------------------------
                        CATCH-ALL 404
                    -------------------------------------------------- */}
                    <Route
                      path="*"
                      element={<NotFound />}
                    />

                  </Routes>
                </Router>
              </SocketProvider>
            </CartProvider>
          </WishlistProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
