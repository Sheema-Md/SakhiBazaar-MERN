
import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPin,
} from 'lucide-react';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

const Checkout = () => {
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();

  const directBuyItem = location.state?.directBuyItem;

  const checkoutItems = directBuyItem
    ? [
      {
        product: directBuyItem.product,
        quantity: directBuyItem.quantity,
      },
    ]
    : cartItems.filter((item) => !item.savedForLater);

  /*
   * ------------------------------------------------------------
   * SAVED ADDRESS
   * ------------------------------------------------------------
   *
   * Your current User schema stores address as a String.
   * Therefore we reuse that saved address as the Street Address.
   *
   * If later you change the schema to store city/state/zip
   * separately, those fields can also be auto-filled.
   */
  const savedAddress =
    typeof user?.address === 'string' ? user.address.trim() : '';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: savedAddress,
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || '',
    country: user?.country || 'India',
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [serverTotalAmount, setServerTotalAmount] = useState(null);

  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  const [paymentError, setPaymentError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeConfigError, setStripeConfigError] = useState('');

  /*
   * ------------------------------------------------------------
   * KEEP USER DETAILS IN SYNC
   * ------------------------------------------------------------
   *
   * This effect only initializes missing account information.
   * It does NOT synchronously set state on every render.
   */
  useEffect(() => {
    let active = true;
    api.get('/auth/addresses').then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      setSavedAddresses(data);
      const defaultAddress = data.find((address) => address.isDefault) || data[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setFormData((prev) => ({ ...prev, ...defaultAddress }));
      }
    }).catch(() => { });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    api.get('/payments/config').then(({ data }) => {
      const publishableKey = data?.publishableKey;
      if (active && publishableKey) {
        setStripePromise(loadStripe(publishableKey));
        setStripeConfigError('');
      }
    }).catch((error) => {
      if (active) setStripeConfigError(error.response?.data?.message || 'Stripe payment configuration is unavailable.');
    });
    return () => { active = false; };
  }, []);

  const total = directBuyItem
    ? Number(directBuyItem.product.price || 0) *
    Number(directBuyItem.quantity || 0)
    : getCartTotal();

  const itemsCount = directBuyItem
    ? directBuyItem.quantity
    : getCartCount();

  const shipping =
    total === 0
      ? 0
      : total > 1000
        ? 0
        : 99;

  const gst = Math.round(total * 0.05);
  const grandTotal = total + shipping + gst;

  /*
   * ------------------------------------------------------------
   * INPUT HANDLING
   * ------------------------------------------------------------
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    if (paymentError) {
      setPaymentError(null);
    }
  };

  /*
   * ------------------------------------------------------------
   * REUSE SAVED ADDRESS
   * ------------------------------------------------------------
   */
  const handleUseSavedAddress = () => {
    const selected = savedAddresses.find((address) => address._id === selectedAddressId);
    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      name: selected.name,
      address: selected.address,
      city: selected.city,
      state: selected.state,
      zip: selected.zip,
      country: selected.country || 'India',
    }));

    setValidationErrors((prev) => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    }));

    setPaymentError(null);
  };

  const handleSaveAddress = async () => {
    if (!saveNewAddress || selectedAddressId !== 'new') return;
    try {
      const { data } = await api.post('/auth/addresses', { ...formData, label: 'Checkout address' });
      setSavedAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data._id);
    } catch (error) {
      console.error('Could not save delivery address:', error);
    }
  };

  /*
   * ------------------------------------------------------------
   * SHIPPING VALIDATION
   * ------------------------------------------------------------
   */
  const validateShippingDetails = () => {
    const errors = {};

    const name = String(formData.name || '').trim();
    const email = String(formData.email || '').trim();
    const address = String(formData.address || '').trim();
    const city = String(formData.city || '').trim();
    const state = String(formData.state || '').trim();
    const zip = String(formData.zip || '').trim();
    const country = String(formData.country || '').trim();

    if (!name) {
      errors.name = t('fullNameRequired');
    } else if (name.length < 2) {
      errors.name = t('validName');
    }

    if (!email) {
      errors.email = t('emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t('validEmail');
    }

    if (!address) {
      errors.address = t('addressRequired');
    } else if (address.length < 5) {
      errors.address = t('completeAddress');
    }

    if (!city) {
      errors.city = t('cityRequired');
    } else if (city.length < 2) {
      errors.city = t('validCity');
    }

    if (!state) {
      errors.state = t('stateRequired');
    } else if (state.length < 2) {
      errors.state = t('validState');
    }

    if (!zip) {
      errors.zip = t('zipRequired');
    } else if (!/^\d{6}$/.test(zip)) {
      errors.zip = t('validZip');
    }

    if (!country) {
      errors.country = t('countryRequired');
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /*
   * ------------------------------------------------------------
   * STEP 1
   * ------------------------------------------------------------
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (checkoutItems.length === 0) {
      setPaymentError(t('checkoutEmpty'));
      return;
    }

    if (!validateShippingDetails()) {
      setPaymentError(
        t('shippingCorrection')
      );
      return;
    }

    setPaymentError(null);
    setShowConfirmation(true);
  };

  /*
   * ------------------------------------------------------------
   * STEP 2
   * CREATE ORDER + PAYMENT INTENT
   * ------------------------------------------------------------
   */
  const handleConfirm = async () => {
    if (submitting) return;

    setSubmitting(true);
    setPaymentError(null);

    try {
      const addressString = [
        formData.name.trim(),
        `Address: ${formData.address.trim()}`,
        `City: ${formData.city.trim()}`,
        `State: ${formData.state.trim()}`,
        `ZIP: ${formData.zip.trim()}`,
        `Country: ${formData.country.trim()}`,
      ].join(', ');

      const orderProducts = checkoutItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      /*
       * CREATE ORDER
       */
      const res = await api.post('/orders', {
        products: orderProducts,
        shippingAddress: addressString,
      });

      const orderData = res.data;
      await handleSaveAddress();

      setCreatedOrderId(orderData._id);
      setServerTotalAmount(orderData.totalAmount);

      /*
       * --------------------------------------------------------
       * COD
       * --------------------------------------------------------
       */
      if (paymentMethod === 'cod') {
        await api.post('/payments', {
          orderId: orderData._id,
          paymentMethod: 'Cash on Delivery',
        });
        if (!directBuyItem) {
          await clearCart();
        }

        setShowConfirmation(false);

        navigate('/order-success', {
          state: {
            orderId: orderData._id,
            name: formData.name.trim(),
            paymentMethod: 'Cash on Delivery',
            paymentSuccessful: true,
          },
        });

        return;
      }

      /*
       * --------------------------------------------------------
       * STRIPE
       * --------------------------------------------------------
       */
      const intentRes = await api.post('/payments/create-intent', {
        orderId: orderData._id,
      });

      if (!intentRes.data?.clientSecret) {
        throw new Error(
          'Unable to initialize secure card payment.'
        );
      }

      setPaymentIntentId(
        intentRes.data.paymentIntentId || null
      );

      setStripeClientSecret(
        intentRes.data.clientSecret
      );

      /*
       * Close confirmation modal.
       * StripePaymentForm now takes over payment.
       */
      setShowConfirmation(false);
    } catch (err) {
      console.error('Checkout confirmation error:', err);

      setPaymentError(
        err.response?.data?.message ||
        err.message ||
        'Unable to place your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * STRIPE PAYMENT SUCCESS
   * ------------------------------------------------------------
   *
   * StripePaymentForm should call this ONLY after the backend
   * confirms the PaymentIntent successfully.
   */
  const handlePaymentSuccess = async (paymentResult = {}) => {
    try {
      setPaymentError(null);

      /*
       * Clear cart exactly like COD.
       */
      if (!directBuyItem) {
        await clearCart();
      }

      /*
       * Navigate to the SAME success page as COD.
       */
      navigate('/order-success', {
        replace: true,
        state: {
          orderId: createdOrderId,
          name: formData.name.trim(),
          paymentMethod: 'Credit Card (Stripe)',
          paymentSuccessful: true,
          paymentIntentId:
            paymentResult?.paymentIntentId ||
            paymentIntentId ||
            null,
        },
      });
    } catch (err) {
      console.error('Post-payment redirect error:', err);

      setPaymentError(
        'Payment succeeded, but we could not open the order confirmation page. Please check your order history.'
      );
    }
  };

  /*
   * ------------------------------------------------------------
   * STRIPE PAYMENT FAILURE
   * ------------------------------------------------------------
   */
  const handlePaymentError = (errorMsg, state = 'failed') => {
    setPaymentError(
      state === 'cancelled' ? 'Payment was cancelled. Your order is still available to retry.' : errorMsg || 'Payment could not be completed.'
    );
  };

  /*
   * ------------------------------------------------------------
   * EMPTY CART
   * ------------------------------------------------------------
   */
  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <ShoppingBag size={24} />
        </div>

        <h2 className="text-xl font-bold text-gray-900">
          {t('checkoutEmpty')}
        </h2>

        <p className="text-gray-500 mt-2">
          Cannot check out with an empty cart.
        </p>

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

  /*
   * ------------------------------------------------------------
   * MAIN CHECKOUT
   * ------------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-gray-50/30 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-rose-600 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* ==================================================
              SHIPPING DETAILS
             ================================================== */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Shipping Information
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                Provide the delivery address for your order.
              </p>
            </div>

            {/* SAVED ADDRESS */}
            {savedAddresses.length > 0 && (
              <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 space-y-3">
                <label htmlFor="saved-address" className="flex items-center gap-2 text-xs font-black text-gray-900"><MapPin size={16} className="text-rose-600" /> Saved delivery addresses</label>
                <select id="saved-address" value={selectedAddressId} disabled={!!stripeClientSecret} onChange={(event) => { setSelectedAddressId(event.target.value); if (event.target.value !== 'new') { const selected = savedAddresses.find((item) => item._id === event.target.value); if (selected) setFormData((prev) => ({ ...prev, ...selected })); } }} className="w-full px-3 py-2.5 bg-white border border-rose-100 rounded-xl text-sm">
                  {savedAddresses.map((saved) => <option key={saved._id} value={saved._id}>{saved.label} · {saved.address}, {saved.city}</option>)}
                  <option value="new">Enter a new address</option>
                </select>
                <button type="button" onClick={handleUseSavedAddress} disabled={!!stripeClientSecret || selectedAddressId === 'new'} className="text-xs font-bold text-rose-700 disabled:opacity-50">Use selected address</button>
              </div>
            )}

            <div className="space-y-4">

              {/* NAME + EMAIL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1">
                  <label
                    htmlFor="name"
                    className="text-xs font-bold text-gray-500"
                  >
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
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.name
                      ? 'border-red-400'
                      : 'border-gray-100'
                      }`}
                  />

                  {validationErrors.name && (
                    <p className="text-[11px] text-red-500">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-xs font-bold text-gray-500"
                  >
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
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.email
                      ? 'border-red-400'
                      : 'border-gray-100'
                      }`}
                  />

                  {validationErrors.email && (
                    <p className="text-[11px] text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* ADDRESS */}
              <div className="space-y-1">
                <label
                  htmlFor="address"
                  className="text-xs font-bold text-gray-500"
                >
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
                  placeholder="Apartment, building, street, area"
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.address
                    ? 'border-red-400'
                    : 'border-gray-100'
                    }`}
                />

                {validationErrors.address && (
                  <p className="text-[11px] text-red-500">
                    {validationErrors.address}
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                <input type="checkbox" checked={saveNewAddress} disabled={!!stripeClientSecret || selectedAddressId !== 'new'} onChange={(event) => setSaveNewAddress(event.target.checked)} />
                Save this address for future checkout
              </label>

              {/* CITY / STATE / ZIP */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                <div className="space-y-1">
                  <label
                    htmlFor="city"
                    className="text-xs font-bold text-gray-500"
                  >
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
                    placeholder="City"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.city
                      ? 'border-red-400'
                      : 'border-gray-100'
                      }`}
                  />

                  {validationErrors.city && (
                    <p className="text-[11px] text-red-500">
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="state"
                    className="text-xs font-bold text-gray-500"
                  >
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
                    placeholder="State"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.state
                      ? 'border-red-400'
                      : 'border-gray-100'
                      }`}
                  />

                  {validationErrors.state && (
                    <p className="text-[11px] text-red-500">
                      {validationErrors.state}
                    </p>
                  )}
                </div>

                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <label
                    htmlFor="zip"
                    className="text-xs font-bold text-gray-500"
                  >
                    Postal Code (ZIP)
                  </label>

                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                    inputMode="numeric"
                    maxLength={6}
                    disabled={!!stripeClientSecret}
                    placeholder="110001"
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.zip
                      ? 'border-red-400'
                      : 'border-gray-100'
                      }`}
                  />

                  {validationErrors.zip && (
                    <p className="text-[11px] text-red-500">
                      {validationErrors.zip}
                    </p>
                  )}
                </div>
              </div>

              {/* COUNTRY */}
              <div className="space-y-1">
                <label
                  htmlFor="country"
                  className="text-xs font-bold text-gray-500"
                >
                  Country
                </label>

                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  disabled={!!stripeClientSecret}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white disabled:opacity-75 ${validationErrors.country
                    ? 'border-red-400'
                    : 'border-gray-100'
                    }`}
                >
                  <option value="">
                    Select country
                  </option>

                  <option value="India">
                    India
                  </option>

                  <option value="United States">
                    United States
                  </option>

                  <option value="United Kingdom">
                    United Kingdom
                  </option>

                  <option value="Canada">
                    Canada
                  </option>

                  <option value="Australia">
                    Australia
                  </option>
                </select>

                {validationErrors.country && (
                  <p className="text-[11px] text-red-500">
                    {validationErrors.country}
                  </p>
                )}
              </div>

              {Object.keys(validationErrors).length > 0 && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                  Please correct the highlighted shipping details before continuing.
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE
             ================================================== */}
          <div className="space-y-6">

            {/* ORDER REVIEW */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-4">

              <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2">
                Order Review ({itemsCount} items)
              </h3>

              <div className="max-h-[180px] overflow-y-auto divide-y divide-gray-50 pr-1">
                {checkoutItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="w-8 h-8 object-cover rounded-lg bg-gray-50 shrink-0"
                      />

                      <span className="font-bold text-gray-700 truncate">
                        {item.product.title}
                      </span>

                      <span className="text-gray-400 font-semibold shrink-0">
                        x{item.quantity}
                      </span>
                    </div>

                    <span className="font-extrabold text-gray-900 shrink-0">
                      ₹
                      {Number(
                        item.product.price * item.quantity
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOTAL + PAYMENT */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md space-y-6">

              <div className="space-y-3 text-sm">

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal</span>
                  <span>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>GST (Estimated 5%)</span>
                  <span>
                    ₹{gst.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Shipping Fee</span>
                  <span>
                    {shipping === 0
                      ? 'FREE'
                      : `₹${shipping}`}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-900">
                    Grand Total
                  </span>

                  <span className="text-lg font-black text-rose-600">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div className="space-y-2 pt-2 border-t border-gray-100">

                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('stripe');
                      setPaymentError(null);
                    }}
                    disabled={!!stripeClientSecret}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${paymentMethod === 'stripe'
                      ? 'bg-rose-50 border-rose-600 text-rose-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <CreditCard size={16} />
                    Stripe Card
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('cod');
                      setPaymentError(null);
                    }}
                    disabled={!!stripeClientSecret}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${paymentMethod === 'cod'
                      ? 'bg-rose-50 border-rose-600 text-rose-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <ShieldCheck size={16} />
                    COD
                  </button>

                </div>
              </div>

              {/* SECURITY MESSAGE */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-[11px] text-green-800 font-medium">
                <ShieldCheck
                  size={16}
                  className="text-green-600 shrink-0"
                />

                {paymentMethod === 'stripe'
                  ? 'Secure Stripe card processing'
                  : 'Cash on delivery'}
              </div>

              {/* STRIPE PAYMENT */}
              {paymentMethod === 'stripe' &&
                stripeClientSecret ? (
                <div className="space-y-4 pt-2">

                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Secure Card Details
                  </h4>

                  {stripePromise ? (
                    <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                      <StripePaymentForm
                        clientSecret={stripeClientSecret}
                        orderId={createdOrderId}
                        totalAmount={serverTotalAmount || grandTotal}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </Elements>
                  ) : (
                    <p className="text-xs font-semibold text-red-600">{stripeConfigError || 'Stripe payment configuration is loading...'}</p>
                  )}

                  {paymentError && (
                    <p className="text-xs font-semibold text-red-500 text-center">
                      {paymentError}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Review & Confirm Order
                      </>
                    )}
                  </button>

                  {paymentError && (
                    <p className="text-xs font-semibold text-red-500 text-center">
                      {paymentError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ======================================================
          CONFIRMATION MODAL
         ====================================================== */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">

          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">

              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Confirm Your Order
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Please review everything before placing your order.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!submitting) {
                    setShowConfirmation(false);
                    setPaymentError(null);
                  }
                }}
                disabled={submitting}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500 disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* PRODUCTS */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-3">
                  Products
                </h3>

                <div className="space-y-2">
                  {checkoutItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="flex items-center gap-3 min-w-0">

                        <img
                          src={item.product.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {item.product.title}
                          </p>

                          <p className="text-xs text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="text-sm font-black text-gray-900 shrink-0">
                        ₹
                        {Number(
                          item.product.price *
                          item.quantity
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DELIVERY ADDRESS */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  Delivery Address
                </h3>

                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-relaxed">

                  <p className="font-bold text-gray-900">
                    {formData.name}
                  </p>

                  <p>{formData.address}</p>

                  <p>
                    {formData.city},{' '}
                    {formData.state} -{' '}
                    {formData.zip}
                  </p>

                  <p>{formData.country}</p>

                  <p className="text-xs text-gray-500 mt-2">
                    {formData.email}
                  </p>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                  Payment Method
                </h3>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">

                  {paymentMethod === 'stripe' ? (
                    <CreditCard
                      size={20}
                      className="text-rose-600"
                    />
                  ) : (
                    <ShieldCheck
                      size={20}
                      className="text-green-600"
                    />
                  )}

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {paymentMethod === 'stripe'
                        ? 'Stripe Card'
                        : 'Cash on Delivery'}
                    </p>

                    <p className="text-xs text-gray-500">
                      {paymentMethod === 'stripe'
                        ? 'Secure card payment'
                        : 'Pay when your order is delivered'}
                    </p>
                  </div>
                </div>
              </div>

              {/* PRICE BREAKDOWN */}
              <div className="border-t border-gray-100 pt-4 space-y-2">

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>GST (5%)</span>
                  <span>
                    ₹{gst.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? 'FREE'
                      : `₹${shipping}`}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">

                  <span className="font-black text-gray-900">
                    Final Total
                  </span>

                  <span className="text-xl font-black text-rose-600">
                    ₹
                    {grandTotal.toLocaleString(
                      'en-IN'
                    )}
                  </span>
                </div>
              </div>

              {/* MODAL ERROR */}
              {paymentError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
                  <AlertCircle
                    size={16}
                    className="shrink-0 mt-0.5"
                  />

                  <span>{paymentError}</span>
                </div>
              )}

              {/* CONFIRM BUTTON */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {paymentMethod === 'cod'
                      ? 'Confirm Order · ₹'
                      : 'Continue to Payment · ₹'}
                    {grandTotal.toLocaleString(
                      'en-IN'
                    )}
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowConfirmation(false);
                  setPaymentError(null);
                }}
                className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-800 disabled:opacity-40"
              >
                Go Back & Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
