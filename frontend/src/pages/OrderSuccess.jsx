import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Printer, RefreshCw } from 'lucide-react';
import api from '../services/api';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // If no state details were passed, redirect back to home page to prevent orphan routing
  useEffect(() => {
    if (!orderDetails.orderId) {
      navigate('/', { replace: true });
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/track/${orderDetails.orderId}`);
        setOrder(response.data);
      } catch (err) {
        console.error('Failed to retrieve order metadata for invoice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderDetails.orderId, navigate]);

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Dynamic Style Injection for browser printing layout */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            display: none !important;
          }
          #printable-invoice, #printable-invoice * {
            display: block !important;
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: #1e293b !important;
            padding: 32px !important;
          }
          #printable-invoice .flex {
            display: flex !important;
          }
          #printable-invoice .grid {
            display: grid !important;
          }
        }
      `}} />

      <div className="max-w-md w-full mx-auto bg-white border border-gray-100 p-8 rounded-3xl shadow-xl text-center space-y-6">
        
        {/* Animated green tick banner */}
        <div className="mx-auto w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-500 animate-pulse">
          <CheckCircle2 size={44} className="stroke-[1.5]" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-black text-green-700 bg-green-50 px-3 py-1 rounded-full tracking-wider">
            Payment Completed
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your transaction has been securely processed. We've notified the entrepreneur to begin crafting your item.
          </p>
        </div>

        {/* Loading Indicator or Transaction Summary Card */}
        {loading ? (
          <div className="flex justify-center items-center py-6">
            <RefreshCw size={20} className="animate-spin text-rose-500 mr-2" />
            <span className="text-xs text-slate-400 font-semibold">Fetching invoice details...</span>
          </div>
        ) : order ? (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="font-bold text-gray-400">Order ID:</span>
                <span className="font-mono font-bold text-gray-900">{order._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-400">Recipient:</span>
                <span className="font-bold text-gray-900">{order.customer?.name || orderDetails.name || 'Buyer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-400">Total Paid:</span>
                <span className="font-bold text-rose-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-400">Shipment Status:</span>
                <span className="font-bold text-green-600 capitalize">{order.orderStatus}</span>
              </div>
            </div>

            {/* Print Action Trigger */}
            <button
              onClick={handlePrintInvoice}
              className="w-full py-2.5 border-2 border-dashed border-rose-200 text-rose-600 hover:bg-rose-50/50 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              Download / Print Tax Invoice
            </button>
          </div>
        ) : (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-650 text-xs font-semibold text-left">
            Failed to fetch invoice data. If this error persists, check server logs.
          </div>
        )}

        {/* Actions CTAs */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/customer-dashboard"
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <span>View Order Status</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/"
            className="w-full py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag size={16} className="text-gray-400" />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>

      {/* HIDDEN INVOICE BLOCK (Only displayed when printing/window.print is called) */}
      {order && (
        <div id="printable-invoice" className="hidden print:block p-12 bg-white text-slate-800 font-sans text-xs">
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-black text-rose-600 tracking-tight">SAKHI BAZAAR</h1>
              <p className="text-slate-400 mt-1 font-medium">Digital Hub for Women Entrepreneurs</p>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-extrabold uppercase tracking-widest">Tax Invoice / Receipt</h2>
              <p className="text-slate-400 mt-1 font-semibold">Order ID: <span className="font-mono">{order._id}</span></p>
              <p className="text-slate-400 font-semibold">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-extrabold uppercase text-slate-400 text-[9px] tracking-wider mb-2">Billed To</h3>
              <p className="font-bold text-sm text-slate-880">{order.customer?.name || orderDetails.name || 'Valued Customer'}</p>
              <p className="text-slate-500 mt-1 font-medium whitespace-pre-wrap">{order.shippingAddress || 'Address on file'}</p>
              <p className="text-slate-500 font-medium">{order.customer?.email}</p>
            </div>
            <div className="text-right">
              <h3 className="font-extrabold uppercase text-slate-400 text-[9px] tracking-wider mb-2">Fulfillment Details</h3>
              <p className="font-semibold text-slate-650"><span className="font-bold text-slate-400">Tracking Number:</span> {order.trackingNumber}</p>
              <p className="font-semibold text-slate-650"><span className="font-bold text-slate-400">Gateway Status:</span> Paid (Stripe Secure)</p>
              <p className="font-semibold text-slate-650"><span className="font-bold text-slate-400">Order Status:</span> {order.orderStatus}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                <th className="py-3">Item Description</th>
                <th className="py-3 text-center">Quantity</th>
                <th className="py-3 text-right">Unit Price</th>
                <th className="py-3 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {order.products?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">
                    <span className="font-bold text-slate-850">{item.product?.title || 'Handcrafted Craft'}</span>
                    {item.product?.sku && <span className="block text-[8px] text-slate-400 font-mono mt-0.5">SKU: {item.product.sku}</span>}
                  </td>
                  <td className="py-3 text-center text-slate-650">{item.quantity}</td>
                  <td className="py-3 text-right text-slate-650">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right font-extrabold text-slate-850">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2 border-t pt-4 font-semibold text-slate-500">
              <div className="flex justify-between text-[11px]">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount - Math.round(order.totalAmount * 0.05 / 1.05)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>GST (Estimated 5%)</span>
                <span>₹{Math.round(order.totalAmount * 0.05 / 1.05).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-850 border-t pt-2 text-xs font-black">
                <span>Grand Total Paid</span>
                <span className="text-rose-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t pt-6 text-center text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
            Thank you for supporting self-employed women creators.
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess;
