import { Link, useLocation } from 'react-router-dom';
import {
  XCircle,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

const OrderFailure = () => {
  const location = useLocation();
  const details = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full bg-white border border-red-100 p-8 rounded-3xl shadow-xl text-center space-y-6">

        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <XCircle
            size={46}
            className="stroke-[1.5]"
          />
        </div>

        <div className="space-y-2">

          <span className="text-[10px] uppercase font-black text-red-700 bg-red-50 px-3 py-1 rounded-full tracking-wider">
            Payment Failed
          </span>

          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-2">
            We Couldn't Complete Your Order
          </h1>

          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your payment was not completed. Please try again.
            Your order will only be confirmed after successful
            payment.
          </p>

        </div>

        {details.message && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-left">

            <p className="text-[10px] uppercase font-black text-red-400 mb-1">
              Payment Message
            </p>

            <p className="text-xs font-semibold text-red-700">
              {details.message}
            </p>

          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">

          <Link
            to="/checkout"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCw size={16} />
            Try Payment Again
          </Link>

          <Link
            to="/cart"
            className="w-full py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Return to Cart
          </Link>

          <Link
            to="/customer-dashboard?view=orders"
            className="w-full py-3 border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            View My Orders
          </Link>

        </div>

      </div>

    </div>
  );
};

export default OrderFailure;