import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import SeasonalPricingGuide from '../components/SeasonalPricingGuide';
import {
  ArrowLeft, Sparkles, User, Tag, Mail, Copy, Check,
  MessageSquare, ShoppingCart, Heart, Globe, Star, MapPin, ChevronLeft, ChevronRight,
  RefreshCw
} from 'lucide-react';

const DELIVERY_LOCATIONS = {
  "Jammu & Kashmir": {
    "Srinagar": ["Lal Bazar", "Hazratbal", "Downtown Srinagar", "Rajbagh", "Sonwar", "Nishat", "Shalimar", "Soura"],
    "Budgam": ["Budgam Town", "Beerwah", "Chadoora", "Magam", "Khan Sahib"],
    "Baramulla": ["Baramulla Town", "Sopore", "Pattan", "Tangmarg", "Uri"],
    "Anantnag": ["Anantnag Town", "Bijbehara", "Pahalgam", "Kokernag", "Verinag"],
    "Pulwama": ["Pulwama Town", "Pampore", "Tral", "Awantipora"],
    "Ganderbal": ["Ganderbal Town", "Kangan", "Tullamulla"],
    "Kupwara": ["Kupwara Town", "Handwara", "Karnah", "Lolab"]
  },
  "Delhi": {
    "New Delhi": ["Connaught Place", "Chanakyapuri", "Vasant Kunj", "Saket"],
    "North Delhi": ["Model Town", "Civil Lines", "GTB Nagar"],
    "South Delhi": ["Hauz Khas", "Greater Kailash", "Lajpat Nagar"]
  },
  "Punjab": {
    "Amritsar": ["Amritsar City", "Ajnala", "Baba Bakala"],
    "Ludhiana": ["Ludhiana City", "Khanna", "Jagraon"]
  }
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useContext(AuthContext);
  const [chatLoading, setChatLoading] = useState(false);
  const { addToCart } = useCart();
  const [addedAlert, setAddedAlert] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { t } = useLanguage();

  // Images Carousel State
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Delivery check states
  const [chkState, setChkState] = useState('');
  const [chkDistrict, setChkDistrict] = useState('');
  const [chkCity, setChkCity] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(null); // true, false, or null

  // Dropdown states for Fashion / Footwear / Weight
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideos, setReviewVideos] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // AI Translation States
  const [translatedTitle, setTranslatedTitle] = useState('');
  const [translatedDesc, setTranslatedDesc] = useState('');
  const [translatedReviews, setTranslatedReviews] = useState({});
  const [translating, setTranslating] = useState(false);
  const { language } = useLanguage();

  const handleTranslateDetails = async () => {
    if (!product || translating) return;
    setTranslating(true);
    try {
      const [titleRes, descRes] = await Promise.all([
        api.post('/ai/translate', { text: product.title, targetLanguage: language }),
        api.post('/ai/translate', { text: product.description, targetLanguage: language })
      ]);
      setTranslatedTitle(titleRes.data.translatedText);
      setTranslatedDesc(descRes.data.translatedText);

      // Translate reviews if present
      if (product.reviews && product.reviews.length > 0) {
        const reviewMap = {};
        await Promise.all(
          product.reviews.map(async (r) => {
            if (r.comment) {
              try {
                const res = await api.post('/ai/translate', { text: r.comment, targetLanguage: language });
                reviewMap[r._id] = res.data.translatedText;
              } catch (e) {
                console.error(e);
              }
            }
          })
        );
        setTranslatedReviews(reviewMap);
      }
    } catch (err) {
      console.error('Failed to translate details using AI:', err);
    } finally {
      setTranslating(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    // Append selected choices if present
    const productWithChoices = {
      ...product,
      title: `${product.title}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` [${selectedColor}]` : ''}${selectedWeight ? ` (${selectedWeight})` : ''}`
    };
    addToCart(productWithChoices, 1);
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }
    const productWithChoices = {
      ...product,
      title: `${product.title}${selectedSize ? ` (${selectedSize})` : ''}${selectedColor ? ` [${selectedColor}]` : ''}${selectedWeight ? ` (${selectedWeight})` : ''}`
    };
    navigate('/checkout', { state: { directBuyItem: { product: productWithChoices, quantity: 1 } } });
  };

  const handleStartChat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setChatLoading(true);
    try {
      const response = await api.post('/chat/conversations', {
        recipientId: product.seller?._id,
        productId: product._id,
      });
      navigate('/chat', { state: { startConversation: response.data } });
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
      alert(err.response?.data?.message || 'Error starting chat. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      setActiveImageIdx(0);
      
      // Fetch related products
      try {
        const resRelated = await api.get(`/products/filter?category=${encodeURIComponent(response.data.category)}`);
        setRelatedProducts((resRelated.data || []).filter(p => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    } catch (err) {
      setError('Failed to retrieve product details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const runAsync = async () => {
      await Promise.resolve();
      setLoading(true);
      setTranslatedTitle('');
      setTranslatedDesc('');
      fetchProduct();
    };
    runAsync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const copyCaption = () => {
    if (product?.marketingCaption) {
      navigator.clipboard.writeText(product.marketingCaption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Delivery check logic
  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!product || !product.deliveryLocations || product.deliveryLocations.length === 0) {
      // If seller doesn't list locations, assume general delivery
      setDeliveryAvailable(true);
      return;
    }

    const inputState = chkState.trim().toLowerCase();
    const inputDistrict = chkDistrict.trim().toLowerCase();
    const inputCity = chkCity.trim().toLowerCase();

    // Check matches
    const isMatched = product.deliveryLocations.some(loc => {
      const matchState = (loc.state || '').toLowerCase();
      const matchDistrict = (loc.district || '').toLowerCase();
      const matchCity = (loc.city || '').toLowerCase();

      // If seller configures 'anywhere' at any level, that level matches anything.
      if (matchState === 'anywhere') return true;
      if (matchState && matchState !== inputState) return false;

      if (matchDistrict === 'anywhere') return true;
      if (matchDistrict && matchDistrict !== inputDistrict) return false;

      if (matchCity === 'anywhere') return true;
      if (matchCity && matchCity !== inputCity) return false;

      return true;
    });

    setDeliveryAvailable(isMatched);
  };

  // Submit product review
  const handlePostReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    const formData = new FormData();
    formData.append('rating', reviewRating);
    formData.append('comment', reviewComment);
    for (let i = 0; i < reviewImages.length; i++) {
      formData.append('images', reviewImages[i]);
    }
    for (let i = 0; i < reviewVideos.length; i++) {
      formData.append('videos', reviewVideos[i]);
    }

    try {
      await api.post(`/products/${id}/review`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReviewSuccess('Review posted successfully!');
      setReviewComment('');
      setReviewRating(5);
      setReviewImages([]);
      setReviewVideos([]);
      fetchProduct(); // reload product and reviews list
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to post review. You might have already reviewed this item.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white dark:bg-slate-800 border border-rose-100 rounded-2xl shadow-sm text-slate-800 dark:text-slate-100">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product not found</h2>
        <p className="text-gray-500 dark:text-slate-450 mt-2">{error || 'The product you are looking for does not exist.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );
  }

  // Pre-calculate prices
  const discount = product.offerPercentage || 0;
  const originalPrice = product.price;
  const discountedPrice = discount > 0 ? Math.round(originalPrice - (originalPrice * discount / 100)) : originalPrice;

  // Determine category options for sizing/color dropdowns
  const cat = (product.category || '').toLowerCase();
  const isClothing = cat.includes('clothing') || cat.includes('apparel') || cat.includes('textile');
  const isFootwear = cat.includes('footwear') || cat.includes('shoe');
  const isFashion = isClothing || isFootwear;
  const isFoodOrAgri = cat.includes('food') || cat.includes('spices') || cat.includes('grocery') || cat.includes('groceries') || cat.includes('agriculture') || cat.includes('crop') || cat.includes('honey') || cat.includes('commodities') || cat.includes('raw');

  // Images list
  const imageUrls = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-slate-900 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-rose-655 font-semibold text-sm transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('back') || 'Back'}
        </button>

        {/* Product Grid */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
          
          {/* Left: Product Images Slideshow Carousel */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700 relative group">
              <img
                src={imageUrls[activeImageIdx]}
                alt={product.title}
                className="h-full w-full object-cover object-center transition-all duration-300"
              />
              
              {imageUrls.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? imageUrls.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-slate-700 dark:text-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx(prev => (prev === imageUrls.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs text-slate-700 dark:text-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1">
                {imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${
                      activeImageIdx === idx ? 'border-rose-500' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 capitalize">
                <Tag size={12} />
                {product.category} {product.subcategory ? `> ${product.subcategory}` : ''}
              </span>

              {/* Title & Price */}
              <div>
                <div className="flex justify-between items-start gap-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {translatedTitle || product.title}
                  </h1>
                  {user && user._id !== product.seller?._id && (
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="p-2.5 rounded-xl border border-gray-150 dark:border-slate-700 shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors cursor-pointer shrink-0"
                      title="Save to Wishlist"
                    >
                      <Heart
                        size={18}
                        className={isWishlisted(product._id) ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}
                      />
                    </button>
                  )}
                </div>

                {/* SKU Code */}
                {product.sku && (
                  <p className="text-[10px] font-mono text-slate-400 mt-1">SKU: {product.sku}</p>
                )}

                {/* Discount price crossed display */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-450">
                    ₹{discountedPrice.toLocaleString('en-IN')}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-sm font-semibold line-through text-slate-400">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 px-2 py-0.5 rounded-lg border border-green-100 dark:border-green-950/30">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Status & Delivery Allowed Locations Badge */}
                <div className="mt-2.5 flex flex-wrap gap-2 items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    product.stockStatus === 'Out of Stock' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-955/20 dark:text-red-400' 
                      : product.stockStatus === 'Low Stock' 
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/20 dark:text-amber-400' 
                      : 'bg-green-105 text-green-800 dark:bg-green-955/20 dark:text-green-400'
                  }`}>
                    {product.stockStatus || 'In Stock'} {product.stockStatus === 'Low Stock' && `(Only ${product.stockQuantity} items left!)`}
                  </span>
                  {product.deliveryLocations && product.deliveryLocations.length > 0 && (
                    <span className="text-[10px] text-slate-400 font-bold">
                      Ships to: {product.deliveryLocations.map(loc => loc.city || loc.district || loc.state).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Size & Color Selectors if Clothing/Footwear or Weight if Food/Agri */}
              {(isFashion || isFoodOrAgri) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-750">
                  {isFashion && (
                    <>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Choose Size
                        </label>
                        <select
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                        >
                          <option value="">Select</option>
                          {isClothing ? (
                            <>
                              <option value="S">Small (S)</option>
                              <option value="M">Medium (M)</option>
                              <option value="L">Large (L)</option>
                              <option value="XL">Extra Large (XL)</option>
                            </>
                          ) : (
                            <>
                              <option value="6">UK 6</option>
                              <option value="7">UK 7</option>
                              <option value="8">UK 8</option>
                              <option value="9">UK 9</option>
                              <option value="10">UK 10</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Choose Color
                        </label>
                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                        >
                          <option value="">Select</option>
                          <option value="Red">Red</option>
                          <option value="Blue">Blue</option>
                          <option value="Black">Black</option>
                          <option value="Cream">Cream</option>
                          <option value="Maroon">Maroon</option>
                        </select>
                      </div>
                    </>
                  )}

                  {isFoodOrAgri && (
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Choose Weight / Quantity
                      </label>
                      <select
                        value={selectedWeight}
                        onChange={(e) => setSelectedWeight(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                      >
                        <option value="">Select</option>
                        <option value="250g">250g</option>
                        <option value="500g">500g</option>
                        <option value="1kg">1kg</option>
                        <option value="5kg">5kg</option>
                        <option value="10kg">10kg</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Delivery check widget */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-750 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-rose-500" /> Check Delivery Locations
                </h4>
                
                <form onSubmit={handleCheckDelivery} className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      required
                      value={chkState}
                      onChange={(e) => {
                        setChkState(e.target.value);
                        setChkDistrict('');
                        setChkCity('');
                      }}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                    >
                      <option value="">Select State</option>
                      {Object.keys(DELIVERY_LOCATIONS).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    <select
                      value={chkDistrict}
                      disabled={!chkState}
                      onChange={(e) => {
                        setChkDistrict(e.target.value);
                        setChkCity('');
                      }}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select District</option>
                      {chkState && Object.keys(DELIVERY_LOCATIONS[chkState] || {}).map(dt => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                    <select
                      value={chkCity}
                      disabled={!chkDistrict}
                      onChange={(e) => setChkCity(e.target.value)}
                      className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select City/Town</option>
                      {chkState && chkDistrict && (DELIVERY_LOCATIONS[chkState][chkDistrict] || []).map(ct => (
                        <option key={ct} value={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-slate-850 dark:bg-slate-700 hover:bg-slate-950 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors">
                    Verify Delivery Options
                  </button>
                </form>

                {deliveryAvailable !== null && (
                  <p className={`text-[10px] font-bold ${deliveryAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {deliveryAvailable ? '✓ Delivery is available to your location!' : '✗ Sorry, delivery is not available to this location.'}
                  </p>
                )}
              </div>

              {/* Description & Market Prices */}
              <div className="pt-2 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    {t('productDescription')}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {translatedDesc || product.description}
                  </p>

                  {/* AI Translation Widget */}
                  {language !== 'en' && !translatedDesc && (
                    <button
                      onClick={handleTranslateDetails}
                      disabled={translating}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-rose-50 dark:from-purple-950/20 dark:to-rose-950/20 hover:from-purple-100 hover:to-rose-100 border border-purple-100 dark:border-purple-900/40 text-purple-700 dark:text-purple-400 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {translating ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          Translating with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          Translate details to {language.toUpperCase()}
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Market Price Awareness Widget - Only for Sellers */}
                  {user && user.role === 'seller' && (
                    (() => {
                      const getMarketAverage = () => {
                        const categoryMap = {
                          'clothing': 1800,
                          'handmade crafts': 1200,
                          'food': 400,
                          'art': 3000,
                        };
                        const normalized = (product.category || '').toLowerCase();
                        return categoryMap[normalized] || Math.round(product.price * 0.95);
                      };
                      const marketAvg = getMarketAverage();
                      const priceDiff = product.price - marketAvg;
                      const percentageDiff = Math.min(Math.max(Math.round((priceDiff / marketAvg) * 100), -50), 50);

                      return (
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-750 rounded-2xl space-y-2 mt-4">
                          <h4 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe size={12} className="text-rose-500" />
                            {t('marketPriceGuideline')}
                          </h4>
                          <div className="flex justify-between text-[10px] font-bold text-slate-550 mt-2">
                            <span>₹{Math.round(marketAvg * 0.7)} (Low)</span>
                            <span className="text-rose-600">₹{marketAvg} ({t('marketPrices')} Avg)</span>
                            <span>₹{Math.round(marketAvg * 1.3)} (Premium)</span>
                          </div>
                          
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-visible mt-1.5">
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 border-2 border-white rounded-full shadow-md transition-all duration-300"
                              style={{ left: `${percentageDiff + 50}%` }}
                              title={`Your Price is ${percentageDiff >= 0 ? '+' : ''}${percentageDiff}% of Market Avg`}
                            />
                          </div>
                          <p className="text-[10px] font-semibold text-slate-400 mt-1 leading-relaxed text-center">
                            {percentageDiff < 0 
                              ? `This item is listed ${Math.abs(percentageDiff)}% below standard platform benchmarks (Great Deal!)`
                              : percentageDiff === 0
                              ? `This item matches standard platform benchmarks.`
                              : `This item is listed ${percentageDiff}% above category benchmarks (Premium Quality).`}
                          </p>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-4">
              
              {/* AI Marketing Caption Card */}
              {product.marketingCaption && (
                <div className="relative p-4 bg-gradient-to-r from-rose-50/50 to-indigo-50/50 dark:from-rose-950/10 dark:to-indigo-950/10 border border-rose-100 dark:border-rose-900/30 rounded-2xl shadow-sm">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={copyCaption}
                      className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700"
                      title="Copy Caption"
                    >
                      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-750 dark:text-slate-350 italic font-medium leading-relaxed">
                    "{product.marketingCaption}"
                  </p>
                </div>
              )}

              {/* Seller details card */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-slate-900/30 border border-gray-100 dark:border-slate-700 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-405 uppercase tracking-wider leading-none">
                    Entrepreneur Details
                  </h4>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {product.seller?.name || 'Seller'}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <Mail size={12} />
                    {product.seller?.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Seasonal Market Pricing Calculator Widget */}
              <SeasonalPricingGuide basePrice={product.price} category={product.category} />

              {/* Add to Cart & Buy Now action buttons */}
              {(!user || user._id !== product.seller?._id) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      addedAlert 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    <ShoppingCart size={16} />
                    {addedAlert ? 'Added to Cart ✓' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              {/* Chat action button */}
              {(!user || user._id !== product.seller?._id) && (
                <button
                  onClick={handleStartChat}
                  disabled={chatLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <MessageSquare size={16} />
                  {chatLoading ? 'Connecting...' : user ? 'Chat with Seller' : 'Login to Chat with Seller'}
                </button>
              )}

            </div>
          </div>

        {/* Reviews Section */}
        {(() => {
          const revs = product.reviews || [];
          const revsCount = revs.length;
          const avgRating = revsCount > 0 
            ? (revs.reduce((acc, r) => acc + r.rating, 0) / revsCount).toFixed(1) 
            : '0.0';
          
          const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          revs.forEach(r => {
            if (ratingCounts[r.rating] !== undefined) {
              ratingCounts[r.rating]++;
            }
          });

          return (
            <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/60 rounded-3xl p-6 sm:p-8 mt-8 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest border-b border-rose-50 dark:border-slate-750 pb-3 flex items-center gap-1.5">
                <Star size={16} className="text-yellow-500" /> Customer Reviews ({revsCount})
              </h3>

              {/* Rating Summary & Breakdown Widget */}
              {revsCount > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-750">
                  <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700/60 pb-6 md:pb-0 md:pr-6">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{avgRating}</span>
                    <div className="flex gap-0.5 my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={18} 
                          className={star <= Math.round(Number(avgRating)) ? 'fill-yellow-450 text-yellow-405' : 'text-slate-350'} 
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-semibold">Based on {revsCount} reviews</span>
                  </div>
                  
                  <div className="col-span-2 space-y-2 flex flex-col justify-center">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingCounts[stars] || 0;
                      const pct = revsCount > 0 ? Math.round((count / revsCount) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3 text-xs">
                          <span className="w-12 text-slate-550 dark:text-slate-400 font-bold shrink-0">{stars} Star</span>
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-500 animate-pulse" 
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-slate-400 font-semibold shrink-0">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* List reviews */}
              <div className="space-y-4">
                {revs.length > 0 ? (
                  revs.map((rev, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-800 dark:text-white">{rev.userName || 'Buyer'}</span>
                        <span className="text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= rev.rating ? 'fill-yellow-450 text-yellow-405' : 'text-slate-350'} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed font-semibold italic">"{translatedReviews[rev._id] || rev.comment}"</p>

                      {/* Attached images and videos */}
                      {((rev.images && rev.images.length > 0) || (rev.videos && rev.videos.length > 0)) && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-850/40">
                          {rev.images?.map((img, iIdx) => (
                            <a key={iIdx} href={img} target="_blank" rel="noopener noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                              <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                            </a>
                          ))}
                          {rev.videos?.map((vid, vIdx) => (
                            <video key={vIdx} src={vid} controls className="h-16 max-w-[120px] rounded-lg border border-slate-200 shrink-0 object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-450 italic pl-1">No reviews have been posted for this product yet.</p>
                )}
              </div>

              {/* Post Review Form */}
              {user && user._id !== product.seller?._id && (
                <div className="border-t border-rose-50 dark:border-slate-750 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Share Your Experience</h4>
                  
                  {reviewError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 text-xs font-semibold rounded-xl">{reviewError}</div>}
                  {reviewSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 text-xs font-semibold rounded-xl">{reviewSuccess}</div>}

                  <form onSubmit={handlePostReview} className="space-y-4">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)}>
                          <Star size={20} className={star <= reviewRating ? 'fill-yellow-450 text-yellow-405' : 'text-slate-350'} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share details of your purchase experience, product quality, etc..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105"
                    />

                    {/* Media uploads selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Upload Images (Max 5)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setReviewImages(Array.from(e.target.files))}
                          className="w-full text-xs text-slate-550 border border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Upload Videos (Max 2)</label>
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={(e) => setReviewVideos(Array.from(e.target.files))}
                          className="w-full text-xs text-slate-550 border border-slate-200 dark:border-slate-700 p-2 rounded-xl bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer">
                      Post Review
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })()}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-rose-500" size={20} />
              Related Products You May Like
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
