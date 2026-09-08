
import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Printer,
  RefreshCw,
  PackageCheck,
  CreditCard,
} from 'lucide-react';
import api from '../services/api';

const money = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const orderDetails = location.state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  /*
   * IMPORTANT:
   * Do not call setState synchronously in the main body of the effect.
   *
   * The effect only performs the external API request.
   * State is updated from the async request callback.
   */
  useEffect(() => {
    const orderId = orderDetails.orderId;

    if (!orderId) {
      return;
    }

    let cancelled = false;

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/track/${orderId}`);

        if (cancelled) return;

        setOrder(response.data);
        setFetchError('');
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to retrieve order details:', err);

        setFetchError(
          err.response?.data?.message ||
          'We could not load the order details.'
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [orderDetails.orderId]);

  /*
   * Handle missing order ID outside the effect.
   *
   * This avoids:
   * setFetchError(...)
   * setLoading(...)
   *
   * directly inside useEffect.
   */
  useEffect(() => {
    if (orderDetails.orderId) return;

    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 0);

    return () => clearTimeout(timer);
  }, [orderDetails.orderId, navigate]);

  const handlePrintInvoice = () => {
    window.print();
  };

  /*
   * No order ID means this page was opened directly
   * instead of coming from checkout.
   */
  if (!orderDetails.orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <RefreshCw
            size={30}
            className="animate-spin text-rose-600 mx-auto mb-4"
          />

          <h2 className="text-lg font-black text-gray-900">
            Returning to shopping...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            No order was selected.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
          <RefreshCw
            size={30}
            className="animate-spin text-rose-600 mx-auto mb-4"
          />

          <h2 className="text-lg font-black text-gray-900">
            Confirming your order...
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Please wait while we retrieve your order details.
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-lg p-8 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <PackageCheck size={32} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mt-5">
            Order Confirmation Unavailable
          </h1>

          <p className="text-sm text-gray-500 mt-3">
            {fetchError ||
              'We could not retrieve your order details.'}
          </p>

          <div className="mt-6 space-y-2">

            <Link
              to="/customer-dashboard"
              className="w-full py-3.5 bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              Check My Orders
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/"
              className="w-full py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              Continue Shopping
            </Link>

          </div>
        </div>
      </div>
    );
  }

  /*
   * Stripe and COD now use the SAME success UI.
   *
   * Prefer the payment method stored on the order.
   * Fall back to checkout state only if necessary.
   */
  const paymentMethod =
    order.paymentMethod ||
    orderDetails.paymentMethod ||
    'stripe';

  const products = Array.isArray(order.products)
    ? order.products
    : [];

  const subtotal =
    typeof order.subtotal === 'number'
      ? order.subtotal
      : products.reduce(
        (sum, item) =>
          sum +
          Number(
            item.price ??
            item.product?.price ??
            0
          ) *
          Number(item.quantity || 0),
        0
      );

  const gst =
    typeof order.gst === 'number'
      ? order.gst
      : Math.round(subtotal * 0.05);

  const shippingFee =
    typeof order.shippingFee === 'number'
      ? order.shippingFee
      : subtotal > 1000
        ? 0
        : subtotal === 0
          ? 0
          : 99;

  const totalAmount = Number(
    order.totalAmount ??
    subtotal + gst + shippingFee
  );

  return (
    <>
      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 15mm;
            }

            body {
              background: white !important;
            }

            .no-print {
              display: none !important;
            }

            .invoice-print {
              display: block !important;
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }

            .invoice-print * {
              visibility: visible !important;
            }

            table {
              display: table !important;
            }

            thead {
              display: table-header-group !important;
            }

            tbody {
              display: table-row-group !important;
            }

            tr {
              display: table-row !important;
            }

            th,
            td {
              display: table-cell !important;
            }

            .invoice-grid {
              display: grid !important;
            }

            .print-break-inside {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          SUCCESS PAGE
      ===================================================== */}

      <div className="no-print min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4">

        <div className="max-w-xl w-full mx-auto">

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">

            {/* SUCCESS ICON */}

            <div className="w-24 h-24 mx-auto rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2
                size={54}
                className="stroke-[1.5]"
              />
            </div>

            {/* SUCCESS MESSAGE */}

            <span className="inline-block mt-6 text-[10px] uppercase tracking-widest font-black text-green-700 bg-green-50 px-4 py-2 rounded-full">
              Order Confirmed
            </span>

            <h1 className="text-3xl font-black text-gray-900 mt-4">
              Your Order Was Placed Successfully!
            </h1>

            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Thank you for shopping with Sakhi Bazaar.
              Your order has been received successfully.
            </p>

            {/* ORDER ID */}

            <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] uppercase tracking-wider font-black text-gray-400">
                Order Number
              </p>

              <p className="font-mono text-sm font-black text-gray-900 mt-1 break-all">
                {order._id}
              </p>
            </div>

            {/* TOTAL */}

            <div className="mt-3 flex justify-between items-center p-4 bg-rose-50 rounded-2xl">

              <span className="text-sm font-bold text-gray-600">
                Total
              </span>

              <span className="text-xl font-black text-rose-600">
                ₹{money(totalAmount)}
              </span>

            </div>

            {/* PAYMENT */}

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">

              <CreditCard size={15} />

              <span>
                Payment:{' '}
                <strong className="text-gray-800 capitalize">
                  {paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery'
                    ? 'Cash on Delivery'
                    : paymentMethod === 'Stripe Payment' ? 'Stripe payment' : paymentMethod}
                </strong>
              </span>

            </div>

            {/* SUCCESS NOTICE */}

            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-left">

              <div className="flex items-start gap-3">

                <CheckCircle2
                  size={20}
                  className="text-green-600 shrink-0 mt-0.5"
                />

                <div>

                  <p className="text-sm font-black text-green-800">
                    Order successfully recorded
                  </p>

                  <p className="text-xs text-green-700 mt-1">
                    Your payment and order have been recorded.
                    You can now track your order from your
                    customer dashboard.
                  </p>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 space-y-3">

              <button
                type="button"
                onClick={handlePrintInvoice}
                className="w-full py-3.5 border-2 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Printer size={17} />
                Print / Save Invoice
              </button>

              <Link
                to="/customer-dashboard"
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                Track My Order
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/"
                className="w-full py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag size={17} />
                Continue Shopping
              </Link>

            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          PRINTABLE INVOICE
          Header removed intentionally.
      ===================================================== */}

      <div
        className="invoice-print max-w-4xl mx-auto bg-white p-10 text-gray-800 font-sans"
      >

        {/* INVOICE TITLE */}

        <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">

          <div>
            <h1 className="text-2xl font-black">
              TAX INVOICE
            </h1>

            <p className="text-xs text-gray-500 mt-2">
              Order #{order._id}
            </p>
          </div>

          <div className="text-right">

            <p className="text-xs text-gray-500">
              Invoice Date
            </p>

            <p className="text-sm font-bold mt-1">
              {order.createdAt
                ? new Date(
                  order.createdAt
                ).toLocaleDateString('en-IN')
                : '-'}
            </p>

          </div>

        </div>

        {/* CUSTOMER + ORDER */}

        <div className="invoice-grid grid grid-cols-2 gap-10 mb-8">

          <div className="print-break-inside">

            <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Billed To
            </h3>

            <p className="font-black text-sm">
              {order.customer?.name ||
                orderDetails.name ||
                'Customer'}
            </p>

            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {order.shippingAddress ||
                'Delivery address unavailable'}
            </p>

            {order.customer?.email && (
              <p className="text-sm text-gray-600 mt-1">
                {order.customer.email}
              </p>
            )}

          </div>

          <div className="text-right print-break-inside">

            <h3 className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">
              Order Details
            </h3>

            <p className="text-sm">
              <strong>Payment:</strong>{' '}
              {paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery'
                ? 'Cash on Delivery'
                : paymentMethod === 'Stripe Payment' ? 'Stripe payment' : paymentMethod}
            </p>

            <p className="text-sm mt-1">
              <strong>Status:</strong>{' '}
              {order.orderStatus || 'Confirmed'}
            </p>

            {order.trackingNumber && (
              <p className="text-sm mt-1">
                <strong>Tracking:</strong>{' '}
                {order.trackingNumber}
              </p>
            )}

          </div>

        </div>

        {/* PRODUCTS TABLE */}

        <table className="w-full border-collapse mb-8">

          <thead>

            <tr className="border-b-2 border-gray-300">

              <th className="py-3 text-left text-xs font-black uppercase">
                Product
              </th>

              <th className="py-3 text-center text-xs font-black uppercase">
                Qty
              </th>

              <th className="py-3 text-right text-xs font-black uppercase">
                Unit Price
              </th>

              <th className="py-3 text-right text-xs font-black uppercase">
                Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map((item, index) => {

              const unitPrice = Number(
                item.price ??
                item.product?.price ??
                0
              );

              const quantity = Number(
                item.quantity || 0
              );

              return (
                <tr
                  key={
                    item._id ||
                    item.product?._id ||
                    index
                  }
                  className="border-b border-gray-100"
                >

                  <td className="py-4 text-sm font-bold">
                    {item.product?.title ||
                      item.title ||
                      'Product'}
                  </td>

                  <td className="py-4 text-center text-sm">
                    {quantity}
                  </td>

                  <td className="py-4 text-right text-sm">
                    ₹{money(unitPrice)}
                  </td>

                  <td className="py-4 text-right text-sm font-black">
                    ₹{money(unitPrice * quantity)}
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

        {/* TOTALS */}

        <div className="flex justify-end">

          <div className="w-80 space-y-3">

            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{money(subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>GST (5%)</span>
              <span>₹{money(gst)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {shippingFee === 0
                  ? 'FREE'
                  : `₹${money(shippingFee)}`}
              </span>
            </div>

            <div className="border-t-2 border-gray-300 pt-3 flex justify-between">

              <span className="font-black">
                Grand Total
              </span>

              <span className="font-black text-lg text-rose-600">
                ₹{money(totalAmount)}
              </span>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="mt-20 border-t border-gray-200 pt-6 text-center">

          <p className="text-xs font-bold text-gray-500">
            Thank you for supporting women entrepreneurs.
          </p>

          <p className="text-[10px] text-gray-400 mt-1">
            This invoice was generated electronically.
          </p>

        </div>

      </div>
    </>
  );
};

export default OrderSuccess;