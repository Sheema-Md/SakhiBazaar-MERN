import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  PlusCircle, ArrowLeft, Image as ImageIcon, Sparkles, 
  AlertCircle, RefreshCw, MapPin, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import SeasonalPricingGuide from '../components/SeasonalPricingGuide';

const CATEGORY_TREE = {
  'Clothing': ['Sarees', 'Kurtis', 'Shawls', 'Kids Wear'],
  'Handmade Crafts': ['Wooden Toys', 'Pottery', 'Embroidered Bags', 'Paintings'],
  'Food': ['Spices', 'Pickles', 'Organic Honey', 'Sweets'],
  'Jewelry': ['Terracotta Jewelry', 'Silver Filigree', 'Beaded Necklaces', 'Earrings'],
  'Home Decor': ['Wall Hangings', 'Cushion Covers', 'Candles', 'Table Runners']
};

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

const AddProduct = () => {
  const navigate = useNavigate();
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPercentage, setOfferPercentage] = useState('0');
  const [stockStatus, setStockStatus] = useState('In Stock');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [marketingCaption, setMarketingCaption] = useState('');

  // Multiple Images State
  const [images, setImages] = useState([]); // File objects
  const [imagesPreviews, setImagesPreviews] = useState([]); // Data URLs for preview
  const [dragActive, setDragActive] = useState(false);

  // Tags pill state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Delivery target locations
  const [locState, setLocState] = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locCity, setLocCity] = useState('');
  const [deliveryLocations, setDeliveryLocations] = useState([]);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Drag & Drop Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesAdded(e.target.files);
    }
  };

  const handleFilesAdded = (filesList) => {
    const newFiles = Array.from(filesList);
    if (images.length + newFiles.length > 10) {
      setError('You can upload a maximum of 10 images.');
      return;
    }

    const updatedFiles = [...images, ...newFiles];
    setImages(updatedFiles);

    const newPreviews = [];
    let loadedCount = 0;
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ name: file.name, preview: reader.result });
        loadedCount++;
        if (loadedCount === newFiles.length) {
          // Sort previews to match the files selection order
          const orderedNewPreviews = newFiles.map(f => newPreviews.find(p => p.name === f.name).preview);
          setImagesPreviews([...imagesPreviews, ...orderedNewPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveImage = (index, direction) => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;

    const newIdx = direction === 'left' ? index - 1 : index + 1;

    // Swap files
    const updatedFiles = [...images];
    const tempFile = updatedFiles[index];
    updatedFiles[index] = updatedFiles[newIdx];
    updatedFiles[newIdx] = tempFile;
    setImages(updatedFiles);

    // Swap previews
    const updatedPreviews = [...imagesPreviews];
    const tempPreview = updatedPreviews[index];
    updatedPreviews[index] = updatedPreviews[newIdx];
    updatedPreviews[newIdx] = tempPreview;
    setImagesPreviews(updatedPreviews);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagesPreviews(imagesPreviews.filter((_, i) => i !== index));
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Location Handlers
  const handleAddLocation = () => {
    if (!locState.trim()) return;
    setDeliveryLocations([
      ...deliveryLocations,
      { state: locState.trim(), district: locDistrict.trim(), city: locCity.trim() }
    ]);
    setLocState('');
    setLocDistrict('');
    setLocCity('');
  };

  const handleRemoveLocation = (index) => {
    setDeliveryLocations(deliveryLocations.filter((_, i) => i !== index));
  };

  // AI Description Generation Handler
  const handleGenerateDescription = async () => {
    if (!title || !category) {
      setError('Please provide a product title and category first so Gemini has context!');
      return;
    }
    setError('');
    setIsGeneratingDesc(true);
    try {
      const response = await api.post('/ai/generate-description', {
        title,
        category,
        keywords: description // use current description as keywords if any
      });
      if (response.data?.description) {
        setDescription(response.data.description);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate AI description. Make sure backend is running.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // AI Caption Generation Handler
  const handleGenerateCaption = async () => {
    if (!title || !description) {
      setError('Please enter a product title and description first so Gemini has context!');
      return;
    }
    setError('');
    setIsGeneratingCaption(true);
    try {
      const response = await api.post('/ai/generate-caption', {
        title,
        description
      });
      if (response.data?.caption) {
        setMarketingCaption(response.data.caption);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate marketing caption. Make sure backend is running.');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  // Submit Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!title || !category || !price || !description) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one product image.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('subcategory', subcategory);
    formData.append('price', price);
    formData.append('offerPercentage', offerPercentage);
    formData.append('stockStatus', stockStatus);
    formData.append('stockQuantity', stockQuantity);
    formData.append('sku', sku);
    formData.append('description', description);
    formData.append('marketingCaption', marketingCaption);
    formData.append('deliveryLocations', JSON.stringify(deliveryLocations));
    formData.append('tags', JSON.stringify(tags));

    images.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Product listed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list product. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto animate-fadeIn">
        {/* Back Link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 font-semibold text-sm transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Form Container */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="pb-6 border-b border-slate-100 dark:border-slate-700 mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="text-rose-500" />
              List New Catalog Product
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Showcase your products to buyers and manage your inventories</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 dark:bg-rose-955/20 dark:border-rose-900 text-rose-800 dark:text-rose-400 p-4 rounded-xl mb-6">
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 dark:bg-green-955/20 dark:border-green-900 text-green-800 dark:text-green-400 p-4 rounded-xl mb-6 animate-pulse">
              <span className="text-sm font-semibold">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Product Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Handcrafted Box"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Category *</label>
                <select
                  required
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setSubcategory('');
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">Select Category</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Handmade Crafts">Handmade Crafts</option>
                  <option value="Food">Food</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
            </div>

            {/* Subcategory & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  disabled={!category}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Subcategory</option>
                  {category && (CATEGORY_TREE[category] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="E.g. CRAFT-BOX-RED-01"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Price, Discount & Stock Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="E.g. 1500"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Offer Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={offerPercentage}
                  onChange={(e) => setOfferPercentage(e.target.value)}
                  placeholder="E.g. 10"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Stock Availability</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100 cursor-pointer"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Live Seasonal Pricing Calculator Widget */}
            <SeasonalPricingGuide basePrice={price} category={category} />

            {/* Stock Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="E.g. 25"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-100"
              />
            </div>

            {/* Multiple Images Drag & Drop Manager */}
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1.5">Product Images (Upload up to 10 files) *</label>
              
              <div 
                className={`w-full border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  dragActive 
                    ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-955/10' 
                    : 'border-slate-250 dark:border-slate-700 hover:border-rose-400'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="image-upload-input"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <label 
                  htmlFor="image-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2 group"
                >
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-955/20 text-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon size={24} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Drag and drop your images here, or <span className="text-rose-600 hover:underline">browse files</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Supports PNG, JPG, JPEG (Max 10 files, drag to reorder once uploaded)</p>
                </label>
              </div>

              {/* Images Previews Grid */}
              {imagesPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-750">
                  {imagesPreviews.map((src, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square relative rounded-xl overflow-hidden border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 group shadow-sm"
                    >
                      <img src={src} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      
                      {/* Delete Overlay Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-650 cursor-pointer shadow-sm"
                        title="Delete Image"
                      >
                        <X size={12} />
                      </button>

                      {/* Reordering Controls Overlay */}
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/75 backdrop-blur-xs p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'left')}
                          disabled={idx === 0}
                          className="text-white hover:text-rose-400 disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        <span className="text-[9px] text-slate-350 font-bold px-1 select-none">{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'right')}
                          disabled={idx === images.length - 1}
                          className="text-white hover:text-rose-400 disabled:opacity-30 disabled:hover:text-white cursor-pointer"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Target Locations */}
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-750">
              <label className="text-xs font-bold text-slate-550 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-500" />
                Delivery Target Locations (Geographical Shipping Filters)
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={locState}
                  onChange={(e) => {
                    setLocState(e.target.value);
                    setLocDistrict('');
                    setLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-100 cursor-pointer"
                >
                  <option value="">Select State</option>
                  <option value="Anywhere">Anywhere</option>
                  {Object.keys(DELIVERY_LOCATIONS).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <select
                  value={locDistrict}
                  disabled={!locState || locState === 'Anywhere'}
                  onChange={(e) => {
                    setLocDistrict(e.target.value);
                    setLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-100 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {locState && locState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {locState && locState !== 'Anywhere' && Object.keys(DELIVERY_LOCATIONS[locState] || {}).map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
                <select
                  value={locCity}
                  disabled={!locDistrict || locDistrict === 'Anywhere' || locState === 'Anywhere'}
                  onChange={(e) => setLocCity(e.target.value)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-100 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select City/Town</option>
                  {locDistrict && locDistrict !== 'Anywhere' && locState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {locState && locState !== 'Anywhere' && locDistrict && locDistrict !== 'Anywhere' && (DELIVERY_LOCATIONS[locState][locDistrict] || []).map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              <button 
                type="button" 
                onClick={handleAddLocation}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1"
              >
                + Add Target Location
              </button>

              {deliveryLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-250/50 mt-2">
                  {deliveryLocations.map((loc, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-900/40 px-2.5 py-1 rounded-xl text-[10px] font-bold"
                    >
                      {loc.state} {loc.district ? `> ${loc.district}` : ''} {loc.city ? `> ${loc.city}` : ''}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLocation(index)} 
                        className="text-red-500 hover:text-red-750 font-black cursor-pointer text-xs"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Pills Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider mb-1">Search Keywords / Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Type tag and press Enter"
                  className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-slate-850 dark:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    >
                      #{tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)} 
                        className="text-slate-400 hover:text-red-500 font-bold cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">Product Description *</label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDesc}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 disabled:opacity-50 transition-opacity"
                >
                  {isGeneratingDesc ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      AI Write Description
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product's materials, craftsmanship, and story..."
                className="block w-full border border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* AI Marketing Caption */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                  Marketing Caption (Social Media Copy)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCaption}
                  disabled={isGeneratingCaption}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 disabled:opacity-50 transition-opacity"
                >
                  {isGeneratingCaption ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      AI Create Social Caption
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={marketingCaption}
                onChange={(e) => setMarketingCaption(e.target.value)}
                placeholder="A catchy tagline generated by AI to sell this product on Instagram or WhatsApp!"
                className="block w-full border border-gray-250 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Form Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-purple-650 hover:from-rose-600 hover:to-purple-700 shadow-md transition-all duration-300 transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Uploading details...' : 'List Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
