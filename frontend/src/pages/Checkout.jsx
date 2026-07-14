import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingBag } from 'lucide-react';

// Stripe integration
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

// Initialize Stripe Promise
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const Checkout = () => {
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  const total = getCartTotal();
  const itemsCount = getCartCount();
  const shipping = total > 1000 ? 0 : total === 0 ? 0 : 99;
  const gst = Math.round(total * 0.05);
  const grandTotal = total + shipping + gst;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setSubmitting(true);
    setPaymentError(null);

    try {
      const addressString = `${formData.name}, Address: ${formData.address}, City: ${formData.city}, State: ${formData.state}, ZIP: ${formData.zip}, Country: ${formData.country}`;
      
      const orderProducts = cartItems.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      }));

      // 1. Create pending order on the backend
      const res = await api.post('/orders', {
        products: orderProducts,
        totalAmount: grandTotal,
        shippingAddress: addressString
      });

      const orderData = res.data;
      setCreatedOrderId(orderData._id);

      // 2. Fetch Stripe PaymentIntent clientSecret from payment controller
      const intentRes = await api.post('/payments/create-intent', {
        orderId: orderData._id
      });

      setStripeClientSecret(intentRes.data.clientSecret);
    } catch (err) {
      console.error('Checkout creation error:', err);
      alert(err.response?.data?.message || 'Checkout initiation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Clear cart state
      await clearCart();

      // Navigate to order-success page passing backend order ID and shipping name
      navigate('/order-success', {
        state: {
          orderId: createdOrderId,
          name: formData.name,
        },
      });
    } catch (err) {
      console.error('Post-payment redirect error:', err);
    }
  };

  const handlePaymentError = (errorMsg) => {
    setPaymentError(errorMsg);
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <ShoppingBag size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mt-2">Cannot check out with an empty cart.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-rose-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        {/* Layout split grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: SHIPPING DETAILS */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Provide the delivery address for your customized items.
              </p>
            </div>

            <div className="space-y-4">
              {/* Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-gray-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={!!stripeClientSecret}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-gray-500">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!stripeClientSecret}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="space-y-1">
                <label htmlFor="address" className="text-xs font-bold text-gray-500">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={!!stripeClientSecret}
                  placeholder="Apartment, building, street, area details"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="city" className="text-xs font-bold text-gray-500">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={!!stripeClientSecret}
                    placeholder="City name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="state" className="text-xs font-bold text-gray-500">
                    State / Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    disabled={!!stripeClientSecret}
                    placeholder="State name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label htmlFor="zip" className="text-xs font-bold text-gray-500">
                    Postal Code (ZIP)
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                    disabled={!!stripeClientSecret}
                    placeholder="110001"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-1">
                <label htmlFor="country" className="text-xs font-bold text-gray-500">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!!stripeClientSecret}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ITEMS & SUMMARY REVIEW */}
          <div className="space-y-6">
            
            {/* Items review box */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">
                Order Review ({itemsCount} items)
              </h3>
              <div className="max-h-[160px] overflow-y-auto divide-y divide-gray-50 pr-1">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="w-8 h-8 object-cover rounded-lg bg-gray-50 shrink-0"
                      />
                      <span className="font-bold text-gray-700 truncate">{item.product.title}</span>
                      <span className="text-gray-400 font-semibold shrink-0">x{item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-gray-900 shrink-0">
                      ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total pricing box & Checkout CTA */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>GST (Estimated 5%)</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-lg font-black text-rose-600">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Secure guarantee indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-[11px] text-green-800 font-medium leading-none">
                <ShieldCheck size={16} className="text-green-600 shrink-0" />
                Secure connection. Stripe payment processed.
              </div>

              {stripeClientSecret ? (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Secure Card Details</h4>
                  <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                    <StripePaymentForm
                      clientSecret={stripeClientSecret}
                      orderId={createdOrderId}
                      totalAmount={grandTotal}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  </Elements>
                  {paymentError && (
                    <p className="text-xs font-semibold text-red-500 text-center">{paymentError}</p>
                  )}
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-200/50 hover:shadow-xl hover:shadow-rose-200/80 transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <CreditCard size={18} />
                  {submitting ? 'Redirecting to Payment...' : 'Proceed to Pay'}
                </button>
              )}
            </div>

          </div>

        </form>
      </div>
    </div>
  );
};

export default Checkout;
