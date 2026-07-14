import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
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
                    {/* Customer / Public Routes */}
                    <Route element={<CustomerLayout />}>
                      <Route path="/" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      
                      <Route
                        path="/checkout"
                        element = {
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/order-success"
                        element = {
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <OrderSuccess />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/order-failure"
                        element = {
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <OrderFailure />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/chat"
                        element = {
                          <ProtectedRoute allowedRoles={['customer', 'seller']}>
                            <Chat />
                          </ProtectedRoute>
                        }
                      />
                    </Route>

                    {/* Customer Dashboard Nested Under DashboardLayout */}
                    <Route
                      element = {
                        <ProtectedRoute allowedRoles={['customer', 'seller']}>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                    </Route>

                    {/* Seller Dashboard Nested Under DashboardLayout */}
                    <Route
                      element = {
                        <ProtectedRoute allowedRoles={['seller']}>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<SellerDashboard />} />
                      <Route path="/add-product" element={<AddProduct />} />
                      <Route path="/edit-product/:id" element={<EditProduct />} />
                    </Route>

                    {/* Catch-all 404 Route */}
                    <Route path="*" element={<NotFound />} />
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
