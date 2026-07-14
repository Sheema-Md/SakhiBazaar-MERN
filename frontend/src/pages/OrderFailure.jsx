import { Link } from 'react-router-dom';
import { XCircle, ShoppingBag, RefreshCw } from 'lucide-react';

const OrderFailure = () => {
  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white border border-gray-100 p-8 rounded-3xl shadow-xl text-center space-y-6">
        
        {/* Animated red error cross */}
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse">
          <XCircle size={44} className="stroke-[1.5]" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-black text-rose-700 bg-rose-50 px-3 py-1 rounded-full tracking-wider">
            Transaction Failed
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-2">
            Payment Not Completed
          </h1>
          <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
            Your payment attempt could not be processed. This could be due to card rejection, an authentication timeout, or cancellation.
          </p>
        </div>

        {/* Advisory Tips Card */}
        <div className="p-4 bg-rose-50/30 border border-rose-100/30 rounded-2xl text-left space-y-2 text-xs text-rose-800 font-medium">
          <p className="font-bold border-b border-rose-100 pb-1 flex items-center gap-1.5">
            Suggested Actions:
          </p>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed">
            <li>Verify your card numbers and expiration date.</li>
            <li>Ensure you complete the OTP/3D secure step.</li>
            <li>Check if your bank card is authorized for international charges.</li>
          </ul>
        </div>

        {/* Actions CTAs */}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/cart"
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </Link>
          <Link
            to="/"
            className="w-full py-3.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag size={16} className="text-gray-400" />
            <span>Return to Marketplace</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderFailure;
