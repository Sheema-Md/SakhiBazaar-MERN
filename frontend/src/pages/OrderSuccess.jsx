import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetails = location.state || {};

  // If no state details were passed, redirect back to home page to prevent orphan routing
  useEffect(() => {
    if (!orderDetails.orderId) {
      navigate('/', { replace: true });
    }
  }, [orderDetails.orderId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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

        {/* Transaction Summary Card */}
        {orderDetails.orderId && (
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-left space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="font-bold text-gray-400">Order ID:</span>
              <span className="font-mono font-bold text-gray-900">{orderDetails.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-400">Recipient:</span>
              <span className="font-bold text-gray-900">{orderDetails.name || 'Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-400">Fulfillment:</span>
              <span className="font-bold text-gray-900 capitalize">Processing</span>
            </div>
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
    </div>
  );
};

export default OrderSuccess;
