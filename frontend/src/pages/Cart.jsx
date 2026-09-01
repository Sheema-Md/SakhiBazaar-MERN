import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag, 
  CreditCard, Sparkles, Clock, ShoppingCart 
} from 'lucide-react';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    toggleSaveForLater, 
    clearCart, 
    getCartTotal, 
    getCartCount 
  } = useCart();
  const navigate = useNavigate();

  const activeCartItems = cartItems.filter(item => !item.savedForLater);
  const savedForLaterItems = cartItems.filter(item => item.savedForLater);

  const total = getCartTotal();
  const itemsCount = getCartCount();
  const shipping = total > 1000 ? 0 : total === 0 ? 0 : 99; // Free shipping over ₹1000
  const gst = Math.round(total * 0.05); // 5% GST
  const grandTotal = total + shipping + gst;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const continueShoppingLink = user?.role === 'seller' ? '/dashboard?view=browse' : '/customer-dashboard?view=browse';

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-105 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-rose-500" />
              {t('shoppingCart') || 'Your Shopping Cart'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Manage your selections and support independent women entrepreneurs.
            </p>
          </div>
          <Link
            to={continueShoppingLink}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 dark:text-rose-455 hover:text-rose-700 transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {activeCartItems.length > 0 ? (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1.5 rounded-xl"
                >
                  <Trash2 size={12} />
                  Clear Cart
                </button>
              </div>

              <div className="space-y-4">
                {activeCartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Product Details info (Image, Title, Seller) */}
                    <div className="flex items-center space-x-4 min-w-0">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 shrink-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-455 px-2 py-0.5 rounded-full capitalize">
                          {item.product.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate mt-1">
                          {item.product.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Crafted by: <span className="font-semibold text-gray-600 dark:text-slate-350">{item.product.seller?.name || 'Seller'}</span>
                        </p>
                        <p className="text-sm font-extrabold text-rose-605 mt-1 sm:hidden">
                          ₹{Number(item.product.price).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Quantity controls and pricing */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-gray-50 dark:border-slate-750 pt-3 sm:border-0 sm:pt-0 shrink-0">
                      
                      {/* Quantity Selector Widget */}
                      <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg text-gray-500 transition-colors"
                          title="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-850 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-600 rounded-lg text-gray-500 transition-colors"
                          title="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Price, Save For Later, and delete button */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                            ₹{Number(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            ₹{Number(item.product.price).toLocaleString('en-IN')} each
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:items-end gap-1.5">
                          <button
                            onClick={() => toggleSaveForLater(item.product._id)}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer"
                          >
                            Save for Later
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-gray-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Remove Item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-md h-fit space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-50 dark:border-slate-750 pb-3 flex items-center gap-1.5">
                <Sparkles size={16} className="text-yellow-500" />
                {t('orderSummary') || 'Order Summary'}
              </h2>

              {/* Order breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
                  <span>{t('price') || 'Price'} ({itemsCount} {t('items') || 'items'})</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
                  <span>{t('gst') || 'GST (Estimated 5%)'}</span>
                  <span>₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-slate-400 font-medium">
                  <span>{t('shipping') || 'Shipping Fee'}</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-[10px] text-rose-500 bg-rose-50 dark:bg-rose-955/20 p-2 rounded-lg font-medium leading-normal mt-2">
                    Tip: Add products worth ₹{Number(1000 - total).toLocaleString('en-IN')} more to unlock <b>FREE shipping!</b>
                  </div>
                )}
                
                <div className="border-t border-gray-100 dark:border-slate-750 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{t('grandTotal') || 'Total Amount'}</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-455">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-rose-600 to-purple-650 hover:from-rose-700 hover:to-purple-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <CreditCard size={18} />
                {t('proceedToCheckout') || 'Proceed to Checkout'}
              </button>

              <div className="text-[11px] text-gray-400 text-center leading-relaxed">
                Secure SSL encrypted payments session integrated.
              </div>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl shadow-sm max-w-lg mx-auto">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-955/20 flex items-center justify-center text-rose-500 mb-6">
              <ShoppingBag size={30} />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Your cart is empty</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2 max-w-sm mx-auto text-sm leading-relaxed">
              Explore our catalogs, search items, and support independent creators.
            </p>
            <Link
              to={continueShoppingLink}
              className="mt-8 inline-flex items-center gap-1.5 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              Browse Products
            </Link>
          </div>
        )}

        {/* Saved For Later Shelf */}
        {savedForLaterItems.length > 0 && (
          <div className="mt-16 border-t border-slate-200 dark:border-slate-700 pt-10 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Clock className="text-indigo-500" size={18} />
              Saved For Later ({savedForLaterItems.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {savedForLaterItems.map((item) => (
                <div
                  key={item.product._id}
                  className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative"
                >
                  <div>
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="w-full h-full object-cover animate-fadeIn"
                      />
                    </div>
                    <div className="mt-3.5 space-y-1">
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400 px-2 py-0.5 rounded-full capitalize">
                        {item.product.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 line-clamp-1">{item.product.title}</h4>
                      <p className="text-xs text-slate-400">By: {item.product.seller?.name || 'Seller'}</p>
                      <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-1">₹{item.product.price}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => toggleSaveForLater(item.product._id)}
                      className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={11} />
                      Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-955/20 text-gray-400 hover:text-red-500 rounded-xl transition-colors cursor-pointer"
                      title="Delete Selection"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;
