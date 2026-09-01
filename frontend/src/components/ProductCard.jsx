import { Link } from 'react-router-dom';
import { Tag, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ product }) => {
  const { t } = useLanguage();
  const discount = product.offerPercentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discount > 0 ? Math.round(originalPrice - (originalPrice * discount / 100)) : originalPrice;

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="group bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-850/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/40 flex items-center gap-1 shadow-sm">
          <Tag size={10} />
          <span className="capitalize text-[10px]">{t(product.category) || product.category}</span>
        </div>

        {/* AI Caption Indicator (If product has marketing caption) */}
        {product.marketingCaption && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-rose-500 to-purple-650 text-white p-1.5 rounded-full shadow-sm" title="AI Marketing Ready">
            <Sparkles size={10} />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Seller Name */}
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {t('by') || 'By'} {product.seller?.name || 'Seller'}
          </span>
          {/* Product Title */}
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mt-1 line-clamp-1 group-hover:text-rose-600 transition-colors">
            {product.title}
          </h3>
          {/* Description Snippet */}
          <p className="text-xs text-gray-550 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Offer Display */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-slate-700">
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-gray-900 dark:text-white">
              ₹{discountedPrice.toLocaleString('en-IN')}
            </span>
            {discount > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] line-through text-slate-400">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] font-bold text-green-600 dark:text-green-400">
                  {discount}% {t('off') || 'OFF'}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold text-rose-600 group-hover:underline">
            {t('viewDetails') || 'View Details'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
