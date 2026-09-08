import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext.jsx';
import { API_URL } from '../config/api';
import CategoryTreeFilter from '../components/CategoryTreeFilter';
import ProductCard from '../components/ProductCard';
import {
  INDIA_STATES,
  getIndiaDistricts,
  getIndiaCities,
  normalizeDeliveryLocations,
  normalizeLocation
} from '../utils/indiaLocations';
import MarketPriceWidget from '../components/MarketPriceWidget';
import {
  ShoppingBag, Edit, Trash2, CheckCircle, DollarSign, Mail, Camera,
  RefreshCw, Sparkles, Heart, ShoppingCart, Globe, AlertCircle,
  MapPin, Truck, TrendingUp, Key, X, ChevronLeft, ChevronRight
} from 'lucide-react';

const CATEGORY_TREE = {
  'Clothing': ['Sarees', 'Kurtis', 'Shawls', 'Kids Wear'],
  'Handmade Crafts': ['Wooden Toys', 'Pottery', 'Embroidered Bags', 'Paintings'],
  'Food': ['Spices', 'Pickles', 'Organic Honey', 'Sweets'],
  'Jewelry': ['Terracotta Jewelry', 'Silver Filigree', 'Beaded Necklaces', 'Earrings'],
  'Home Decor': ['Wall Hangings', 'Cushion Covers', 'Candles', 'Table Runners']
};



const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const SellerDashboard = () => {

  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleChatWithCustomer = (customer) => {
    if (!customer) return;
    navigate('/chat', {
      state: {
        startConversation: {
          _id: generateConversationId(),
          participants: [user, customer],
          productId: null,
        },
      },
    });
  };

  const translateStatus = (status) => t(`orderStatus${String(status || '').replace(/\s+/g, '')}`, status);

  // Dynamic Content Tab Selector
  const currentView = searchParams.get('view') || 'dashboard';
  const editingProductId = searchParams.get('id') || '';

  // Core API states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Profile settings
  const [avatar, setAvatar] = useState(() => {
    return localStorage.getItem(`sakhi_avatar_${user?._id || 'guest'}`) || '';
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });

  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Browse products state
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseFilters, setBrowseFilters] = useState({
    categories: '',
    subcategories: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: '',
    offer: false
  });

  // Sync the shared header search query with seller browse state
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      const timer = setTimeout(() => {
        setBrowseSearch(urlSearch);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Add Product Form States
  const [addTitle, setAddTitle] = useState('');
  const [addCategory, setAddCategory] = useState('');
  const [addSubcategory, setAddSubcategory] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addOfferPercentage, setAddOfferPercentage] = useState('0');
  const [addStockStatus, setAddStockStatus] = useState('In Stock');
  const [addStockQuantity, setAddStockQuantity] = useState('0');
  const [addSku, setAddSku] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addCaption, setAddCaption] = useState('');
  const [addImages, setAddImages] = useState([]);
  const [addImagesPreviews, setAddImagesPreviews] = useState([]);

  // Tags states
  const [addTagInput, setAddTagInput] = useState('');
  const [addTags, setAddTags] = useState([]);

  // Location states
  const [addLocState, setAddLocState] = useState('');
  const [addLocDistrict, setAddLocDistrict] = useState('');
  const [addLocCity, setAddLocCity] = useState('');
  const [addDeliveryLocations, setAddDeliveryLocations] = useState([]);
  const locationStates = INDIA_STATES;

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Product Form States
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSubcategory, setEditSubcategory] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOfferPercentage, setEditOfferPercentage] = useState('0');
  const [editStockStatus, setEditStockStatus] = useState('In Stock');
  const [editStockQuantity, setEditStockQuantity] = useState('0');
  const [editSku, setEditSku] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editMediaItems, setEditMediaItems] = useState([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [editLocState, setEditLocState] = useState('');
  const [editLocDistrict, setEditLocDistrict] = useState('');
  const [editLocCity, setEditLocCity] = useState('');
  const [editDeliveryLocations, setEditDeliveryLocations] = useState([]);

  // Shipment timeline form states (for specific shipments update)
  const [updatingShipmentId, setUpdatingShipmentId] = useState('');
  const [shipStatusUpdate, setShipStatusUpdate] = useState('');
  const [trackingNumUpdate, setTrackingNumUpdate] = useState('');
  const [timelineEvent, setTimelineEvent] = useState('');
  const [timelineDesc, setTimelineDesc] = useState('');

  // Fetch listed products
  const fetchMyProducts = async () => {
    if (user && user.token) {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_URL}/products/seller/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to fetch your inventory.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch orders received
  const fetchMyOrders = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/orders/history`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error('Failed to load seller orders:', err.message);
      }
    }
  };



  // Fetch shipments
  const fetchShipments = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/shipments`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setShipments(res.data || []);
      } catch (err) {
        console.error('Failed to load shipments:', err.message);
      }
    }
  };

  // Load profile details
  const loadProfile = async () => {
    if (user && user.token) {
      try {
        const res = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProfileData({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
        });
        if (res.data.avatar) {
          setAvatar(res.data.avatar);
        }
      } catch (err) {
        console.error('Failed to fetch profile settings:', err.message);
      }
    }
  };

  // Load product stats for pricing recommendations
  const [categoryStats, setCategoryStats] = useState(null);
  const fetchCategoryStats = async (categoryName) => {
    if (!categoryName) return;
    try {
      const res = await axios.get(`${API_URL}/products/stats/category?category=${categoryName}`);
      setCategoryStats(res.data);
    } catch (err) {
      console.error('Failed to load category stats:', err);
    }
  };

  useEffect(() => {
    const runAsync = async () => {
      await Promise.resolve();
      fetchCategoryStats(addCategory);
    };
    if (addCategory) {
      runAsync();
    }
  }, [addCategory]);

  useEffect(() => {
    const runAsync = async () => {
      await Promise.resolve();
      fetchCategoryStats(editCategory);
    };
    if (editCategory) {
      runAsync();
    }
  }, [editCategory]);

  // Run initial fetching based on view
  useEffect(() => {
    const runAsync = async () => {
      await Promise.resolve();
      fetchMyProducts();
      fetchMyOrders();
      fetchShipments();
      loadProfile();
    };
    if (user) {
      runAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, currentView]);

  // Fetch product for editing
  useEffect(() => {
    const loadEditProduct = async () => {
      if (currentView === 'edit-product' && editingProductId) {
        try {
          const res = await axios.get(`${API_URL}/products/${editingProductId}`);
          const p = res.data;
          setEditTitle(p.title);
          setEditCategory(p.category);
          setEditSubcategory(p.subcategory || '');
          setEditPrice(p.price);
          setEditOfferPercentage(p.offerPercentage || '0');
          setEditStockStatus(p.stockStatus || 'In Stock');
          setEditStockQuantity(p.stockQuantity || '0');
          setEditSku(p.sku || '');
          setEditDesc(p.description);
          setEditCaption(p.marketingCaption || '');
          const existingImages = p.images && p.images.length > 0 ? p.images : [p.imageUrl];
          setEditMediaItems(existingImages.map((url, idx) => ({
            id: `existing-${idx}`,
            isExisting: true,
            url
          })));
          setEditTags(p.tags || []);
          const savedLocations = normalizeDeliveryLocations(p.deliveryLocations || []);
          setEditDeliveryLocations(savedLocations);
          const firstLocation = savedLocations[0];
          if (firstLocation) {
            setEditLocState(firstLocation.state);
            setEditLocDistrict(firstLocation.district);
            setEditLocCity(firstLocation.city);
          }
        } catch (err) {
          console.error('Failed to fetch product details:', err.message);
        }
      }
    };
    Promise.resolve().then(() => {
      loadEditProduct();
    });
  }, [currentView, editingProductId]);

  // Fetch filtered browse products
  useEffect(() => {
    const loadBrowseProducts = async () => {
      if (currentView === 'browse') {
        setLoading(true);
        try {
          const queryParams = {
            ...browseFilters,
            search: browseSearch
          };
          const res = await axios.get(`${API_URL}/products/filter`, { params: queryParams });
          setFilteredProducts(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error('Failed to filter products:', err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    const delayDebounceFn = setTimeout(() => {
      loadBrowseProducts();
    }, 150);

    return () => clearTimeout(delayDebounceFn);
  }, [browseFilters, browseSearch, currentView]);

  // Handle location badges
  const handleAddLocation = () => {
    if (!addLocState) return;
    setAddDeliveryLocations(prev => normalizeDeliveryLocations([
      ...prev,
      normalizeLocation({ state: addLocState, district: addLocDistrict, city: addLocCity })
    ]));
    setAddLocState('');
    setAddLocDistrict('');
    setAddLocCity('');
  };

  const handleRemoveLocation = (index) => {
    setAddDeliveryLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditAddLocation = () => {
    if (!editLocState) return;
    setEditDeliveryLocations(prev => normalizeDeliveryLocations([
      ...prev,
      normalizeLocation({ state: editLocState, district: editLocDistrict, city: editLocCity })
    ]));
    setEditLocState('');
    setEditLocDistrict('');
    setEditLocCity('');
  };

  const handleEditRemoveLocation = (index) => {
    setEditDeliveryLocations(prev => prev.filter((_, i) => i !== index));
  };

  // Handle tags pills
  const handleAddTag = () => {
    if (!addTagInput.trim()) return;
    if (!addTags.includes(addTagInput.trim())) {
      setAddTags(prev => [...prev, addTagInput.trim()]);
    }
    setAddTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setAddTags(prev => prev.filter(t => t !== tag));
  };

  const handleEditAddTag = () => {
    if (!editTagInput.trim()) return;
    if (!editTags.includes(editTagInput.trim())) {
      setEditTags(prev => [...prev, editTagInput.trim()]);
    }
    setEditTagInput('');
  };

  const handleEditRemoveTag = (tag) => {
    setEditTags(prev => prev.filter(t => t !== tag));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/auth/profile`,
        {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          avatar: avatar,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      sessionStorage.setItem('sakhi_user', JSON.stringify({ ...user, ...res.data }));
      alert('Profile details updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('passwordMismatch') || 'Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/auth/profile`,
        { password: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setPasswordSuccess(t('passwordUpdatedSeller'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || t('passwordUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem(`sakhi_avatar_${user?._id || 'guest'}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    localStorage.removeItem(`sakhi_avatar_${user?._id || 'guest'}`);
  };

  // Add Product Multi Images
  const handleAddImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (addImages.length + files.length > 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }
    const updatedFiles = [...addImages, ...files];
    setAddImages(updatedFiles);

    const previews = [];
    let loadedCount = 0;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push({ name: file.name, preview: reader.result });
        loadedCount++;
        if (loadedCount === files.length) {
          const sortedNewPreviews = files.map(f => previews.find(p => p.name === f.name).preview);
          setAddImagesPreviews([...addImagesPreviews, ...sortedNewPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveAddImage = (index, direction) => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === addImages.length - 1) return;
    const newIdx = direction === 'left' ? index - 1 : index + 1;

    const files = [...addImages];
    const tempF = files[index];
    files[index] = files[newIdx];
    files[newIdx] = tempF;
    setAddImages(files);

    const previews = [...addImagesPreviews];
    const tempP = previews[index];
    previews[index] = previews[newIdx];
    previews[newIdx] = tempP;
    setAddImagesPreviews(previews);
  };

  const handleRemoveAddImage = (index) => {
    setAddImages(addImages.filter((_, i) => i !== index));
    setAddImagesPreviews(addImagesPreviews.filter((_, i) => i !== index));
  };

  // Edit Product Multi Images
  const handleEditImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (editMediaItems.length + files.length > 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }

    let loadedCount = 0;
    const itemsToAdd = [];

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        itemsToAdd.push({
          id: `new-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          isExisting: false,
          file,
          preview: reader.result
        });
        loadedCount++;
        if (loadedCount === files.length) {
          const orderedItems = files.map(f => itemsToAdd.find(item => item.file.name === f.name));
          setEditMediaItems(prev => [...prev, ...orderedItems]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleMoveEditMediaItem = (index, direction) => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === editMediaItems.length - 1) return;
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    const updated = [...editMediaItems];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    setEditMediaItems(updated);
  };

  const handleRemoveEditMediaItem = (index) => {
    setEditMediaItems(editMediaItems.filter((_, i) => i !== index));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!addTitle || !addCategory || !addPrice || !addDesc || addImages.length === 0) {
      setFormError(t('productRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('title', addTitle);
    formData.append('category', addCategory);
    formData.append('subcategory', addSubcategory);
    formData.append('price', addPrice);
    formData.append('offerPercentage', addOfferPercentage);
    formData.append('stockStatus', addStockStatus);
    formData.append('stockQuantity', addStockQuantity);
    formData.append('sku', addSku);
    formData.append('description', addDesc);
    formData.append('marketingCaption', addCaption);
    formData.append('deliveryLocations', JSON.stringify(normalizeDeliveryLocations(addDeliveryLocations)));
    formData.append('tags', JSON.stringify(addTags));

    addImages.forEach(file => {
      formData.append('images', file);
    });

    setLoading(true);
    try {
      await axios.post(`${API_URL}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });
      setFormSuccess(t('productListed'));
      setAddTitle('');
      setAddCategory('');
      setAddSubcategory('');
      setAddPrice('');
      setAddOfferPercentage('0');
      setAddStockStatus('In Stock');
      setAddStockQuantity('0');
      setAddSku('');
      setAddDesc('');
      setAddCaption('');
      setAddImages([]);
      setAddImagesPreviews([]);
      setAddTags([]);
      setAddDeliveryLocations([]);
      setTimeout(() => setSearchParams({ view: 'products' }), 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || t('productListFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!editTitle || !editCategory || !editPrice || !editDesc) {
      setFormError(t('productRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('category', editCategory);
    formData.append('subcategory', editSubcategory);
    formData.append('price', editPrice);
    formData.append('offerPercentage', editOfferPercentage);
    formData.append('stockStatus', editStockStatus);
    formData.append('stockQuantity', editStockQuantity);
    formData.append('sku', editSku);
    formData.append('description', editDesc);
    formData.append('marketingCaption', editCaption);
    formData.append('deliveryLocations', JSON.stringify(normalizeDeliveryLocations(editDeliveryLocations)));
    formData.append('tags', JSON.stringify(editTags));

    if (editMediaItems.length === 0) {
      setFormError(t('imageRequired'));
      return;
    }

    // Remaining existing images
    const remainingExistingUrls = editMediaItems
      .filter(item => item.isExisting)
      .map(item => item.url);
    formData.append('images', JSON.stringify(remainingExistingUrls));

    // New image uploads
    const newFiles = editMediaItems.filter(item => !item.isExisting).map(item => item.file);
    newFiles.forEach(file => {
      formData.append('images', file);
    });

    setLoading(true);
    try {
      await axios.put(`${API_URL}/products/${editingProductId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });
      setFormSuccess(t('productUpdated'));
      setTimeout(() => setSearchParams({ view: 'products' }), 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || t('productUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async (isEditMode = false) => {
    const activeTitle = isEditMode ? editTitle : addTitle;
    const activeCategory = isEditMode ? editCategory : addCategory;
    const activeDesc = isEditMode ? editDesc : addDesc;

    if (!activeTitle || !activeCategory) {
      alert('Please enter a title and category first to provide context for Gemini!');
      return;
    }

    setIsGeneratingDesc(true);
    try {
      const response = await axios.post(
        `${API_URL}/ai/generate-description`,
        { title: activeTitle, category: activeCategory, keywords: activeDesc },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (response.data?.description) {
        if (isEditMode) setEditDesc(response.data.description);
        else setAddDesc(response.data.description);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate AI description.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateCaption = async (isEditMode = false) => {
    const activeTitle = isEditMode ? editTitle : addTitle;
    const activeDesc = isEditMode ? editDesc : addDesc;

    if (!activeTitle || !activeDesc) {
      alert('Please enter a title and description first to provide context for Gemini!');
      return;
    }

    setIsGeneratingCaption(true);
    try {
      const response = await axios.post(
        `${API_URL}/ai/generate-caption`,
        { title: activeTitle, description: activeDesc },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (response.data?.caption) {
        if (isEditMode) setEditCaption(response.data.caption);
        else setAddCaption(response.data.caption);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate marketing caption.');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete product: "${title}"?`)) {
      try {
        await axios.delete(`${API_URL}/products/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts(products.filter((p) => p._id !== id));
        alert('Product deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete listing.');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/orders/status/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
      alert(`Order status updated to "${newStatus}"!`);
      fetchShipments(); // refresh tracking timelines
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleUpdateShipmentTimeline = async (e) => {
    e.preventDefault();
    if (!updatingShipmentId) return;

    try {
      await axios.put(
        `${API_URL}/shipments/${updatingShipmentId}`,
        {
          status: shipStatusUpdate || undefined,
          trackingNumber: trackingNumUpdate || undefined,
          timelineEvent: timelineEvent || undefined,
          timelineDescription: timelineDesc || undefined
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Shipment tracking timeline updated successfully!');
      setUpdatingShipmentId('');
      setShipStatusUpdate('');
      setTrackingNumUpdate('');
      setTimelineEvent('');
      setTimelineDesc('');
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shipment.');
    }
  };



  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {error && (
        <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-800 dark:text-red-400 p-4 rounded-2xl">
          <AlertCircle size={20} className="shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: MAIN WORKSPACE DASHBOARD */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'dashboard' && (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-rose-500 to-indigo-650 p-6 sm:p-8 rounded-3xl text-white shadow-md">
            <h1 className="text-xl sm:text-2xl font-black">{t('hello') || 'Welcome back'}, {profileData.name || user?.name || 'Seller'}!</h1>
            <p className="text-xs text-rose-100 mt-1 max-w-sm">
              {t('welcomeDashboard') || 'Sakhi Bazaar partner dashboard. Showcase products, optimize margins, and generate marketing copy.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700/50 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
                <ShoppingBag size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t('myProducts') || 'Listed Products'}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{products.length}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700/50 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t('ordersFulfilled') || 'Fulfill Orders'}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length} {t('active') || 'Active'}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-100/30 dark:border-slate-700/50 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">{t('salesRevenue') || 'Earnings Balance'}</p>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  ₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}
                </h3>
              </div>
            </div>
          </div>

          {/* Market Price guidelines Insights */}
          <MarketPriceWidget />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: BROWSE OTHER PRODUCTS */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'browse' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Browse Marketplace Listings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Explore listed craft products across categories.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-1">
              <CategoryTreeFilter onFilterChange={(f) => setBrowseFilters(f)} />
            </div>
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <RefreshCw size={24} className="animate-spin text-rose-500" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl text-slate-400 text-xs font-semibold">
                  No listings match current search parameters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: MY PRODUCTS LIST TABLE */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-rose-100/30 dark:border-slate-700">
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white">{t('myProducts') || 'Active Catalog Inventory'}</h1>
              <p className="text-xs text-slate-400 mt-0.5">Review, modify, or list new catalog options.</p>
            </div>
            <button
              onClick={() => setSearchParams({ view: 'add-product' })}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-rose-500 to-indigo-650 hover:from-rose-600 hover:to-indigo-700 shadow-md cursor-pointer"
            >
              {t('addProduct') || 'Add Product'}
            </button>
          </div>

          {products.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                      <th className="px-6 py-4">Image</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Category / Sub</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Stock Status (Qty)</th>
                      <th className="px-6 py-4">Price / Offer</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                        <td className="px-6 py-4">
                          <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-105">
                          <div>
                            <p>{p.title}</p>
                            {p.status === 'flagged' && (
                              <span className="inline-block mt-1 text-[8px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded uppercase font-bold">Flagged by Admin</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 capitalize">
                          <p>{p.category}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{p.subcategory || 'No Subcategory'}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{p.sku || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${p.stockStatus === 'In Stock' ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400' :
                            p.stockStatus === 'Low Stock' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400' :
                              'bg-red-50 text-red-750 dark:bg-red-950/20 dark:text-red-400'
                            }`}>
                            {p.stockStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-bold">({p.stockQuantity})</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-rose-600 dark:text-rose-400">₹{p.price}</p>
                          {p.offerPercentage > 0 && <p className="text-[9px] text-green-600 font-bold">{p.offerPercentage}% Off</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSearchParams({ view: 'edit-product', id: p._id })}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-rose-500 rounded-lg cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p._id, p.title)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-red-500 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl">
              <p className="text-xs text-slate-400 font-semibold">No active products.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: ADD PRODUCT INLINE FORM */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'add-product' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="pb-4 border-b border-rose-50 dark:border-slate-750 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">List New Catalog Product</h2>
              <p className="text-xs text-slate-400 mt-0.5">Use Gemini AI prompts to auto-generate description content.</p>
            </div>
            {categoryStats && categoryStats.count > 0 && (
              <div className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-2 rounded-xl max-w-xs font-bold leading-relaxed text-right">
                <p className="text-rose-500 flex items-center justify-end gap-1"><Globe size={10} /> Market Prices for {categoryStats.category}:</p>
                <p>Min: ₹{categoryStats.minPrice} | Avg: ₹{categoryStats.avgPrice} | Max: ₹{categoryStats.maxPrice}</p>
              </div>
            )}
          </div>

          {formError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl mb-4">{formError}</div>}
          {formSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-xl mb-4 animate-pulse">{formSuccess}</div>}

          <form onSubmit={handleAddProductSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Title</label>
                <input type="text" required value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="E.g. Pashmina Shawl" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Category</label>
                <select required value={addCategory} onChange={(e) => { setAddCategory(e.target.value); setAddSubcategory(''); }} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer">
                  <option value="">Select Category</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Handmade Crafts">Handmade Crafts</option>
                  <option value="Food">Food</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Subcategory</label>
                <select
                  value={addSubcategory}
                  onChange={(e) => setAddSubcategory(e.target.value)}
                  disabled={!addCategory}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Subcategory</option>
                  {addCategory && (CATEGORY_TREE[addCategory] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">SKU (Stock Keeping Unit)</label>
                <input type="text" value={addSku} onChange={(e) => setAddSku(e.target.value)} placeholder="E.g. SHAWL-PASH-RED" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Price (₹)</label>
                <input type="number" required value={addPrice} onChange={(e) => setAddPrice(e.target.value)} placeholder="E.g. 1500" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Offer Percentage (%)</label>
                <input type="number" min="0" max="99" value={addOfferPercentage} onChange={(e) => setAddOfferPercentage(e.target.value)} placeholder="E.g. 10" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Stock Availability</label>
                <select value={addStockStatus} onChange={(e) => setAddStockStatus(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer">
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Stock Quantity</label>
              <input type="number" min="0" value={addStockQuantity} onChange={(e) => setAddStockQuantity(e.target.value)} placeholder="E.g. 25" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            {/* Delivery Locations Section */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-750/70">
              <label className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> Delivery Target Locations</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={addLocState}
                  onChange={(e) => {
                    setAddLocState(e.target.value);
                    setAddLocDistrict('');
                    setAddLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                >
                  <option value="">Select State</option>
                  <option value="Anywhere">Anywhere</option>
                  {locationStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <select
                  value={addLocDistrict}
                  disabled={!addLocState || addLocState === 'Anywhere'}
                  onChange={(e) => {
                    setAddLocDistrict(e.target.value);
                    setAddLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {addLocState && addLocState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {addLocState && addLocState !== 'Anywhere' && getIndiaDistricts(addLocState).map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
                <select
                  value={addLocCity}
                  disabled={!addLocDistrict || addLocDistrict === 'Anywhere' || addLocState === 'Anywhere'}
                  onChange={(e) => setAddLocCity(e.target.value)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select City/Town</option>
                  {addLocDistrict && addLocDistrict !== 'Anywhere' && addLocState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {addLocState && addLocDistrict && addLocDistrict !== 'Anywhere' && getIndiaCities(addLocState, addLocDistrict).map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <button type="button" onClick={handleAddLocation} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer">
                + Add Delivery Location
              </button>

              {addDeliveryLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 mt-2">
                  {addDeliveryLocations.map((loc, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                      {loc.state} {loc.district ? `> ${loc.district}` : ''} {loc.city ? `> ${loc.city}` : ''}
                      <button type="button" onClick={() => handleRemoveLocation(index)} className="text-red-500 hover:text-red-750 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Search Tags</label>
              <div className="flex gap-2">
                <input type="text" value={addTagInput} onChange={(e) => setAddTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Add product tag (press Enter)" className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105" />
                <button type="button" onClick={handleAddTag} className="px-4 bg-slate-850 dark:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer">Add</button>
              </div>

              {addTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {addTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-red-500 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Product Images (Upload up to 10 files) *</label>
              <input type="file" multiple accept="image/*" onChange={handleAddImagesChange} className="w-full mt-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl cursor-pointer" />
            </div>

            {addImagesPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-750">
                {addImagesPreviews.map((src, idx) => (
                  <div key={idx} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 group shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveAddImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-650 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/75 backdrop-blur-xs p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveAddImage(idx, 'left')}
                        disabled={idx === 0}
                        className="text-white hover:text-rose-450 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft size={10} />
                      </button>
                      <span className="text-[8px] text-white font-bold select-none">{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveAddImage(idx, 'right')}
                        disabled={idx === addImages.length - 1}
                        className="text-white hover:text-rose-455 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <button type="button" onClick={() => handleGenerateDescription(false)} className="text-[10px] font-bold text-purple-600 flex items-center gap-1 hover:underline">
                  {isGeneratingDesc ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />} Write with AI
                </button>
              </div>
              <textarea rows={3} required value={addDesc} onChange={(e) => setAddDesc(e.target.value)} placeholder="Story of the craft..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500">Social Caption taglines</label>
                <button type="button" onClick={() => handleGenerateCaption(false)} className="text-[10px] font-bold text-purple-600 flex items-center gap-1 hover:underline">
                  {isGeneratingCaption ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />} Create tags with AI
                </button>
              </div>
              <input type="text" value={addCaption} onChange={(e) => setAddCaption(e.target.value)} placeholder="Instagram hashtags..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-indigo-650 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
              {loading ? 'Uploading details...' : 'Publish Product Listing'}
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: EDIT PRODUCT INLINE FORM */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'edit-product' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="pb-4 border-b border-rose-50 dark:border-slate-750 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Modify Catalog Product</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Edit details or request descriptions using Gemini AI assistant.</p>
            </div>
            {categoryStats && categoryStats.count > 0 && (
              <div className="text-[10px] text-slate-550 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 p-2 rounded-xl max-w-xs font-bold leading-relaxed text-right">
                <p className="text-rose-500 flex items-center justify-end gap-1"><Globe size={10} /> Market Prices for {categoryStats.category}:</p>
                <p>Min: ₹{categoryStats.minPrice} | Avg: ₹{categoryStats.avgPrice} | Max: ₹{categoryStats.maxPrice}</p>
              </div>
            )}
          </div>

          {formError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl mb-4">{formError}</div>}
          {formSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-xl mb-4 animate-pulse">{formSuccess}</div>}

          <form onSubmit={handleEditProductSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Title</label>
                <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="E.g. Handcrafted Box" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Category</label>
                <select required value={editCategory} onChange={(e) => { setEditCategory(e.target.value); setEditSubcategory(''); }} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer">
                  <option value="Clothing">Clothing</option>
                  <option value="Handmade Crafts">Handmade Crafts</option>
                  <option value="Food">Food</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Subcategory</label>
                <select
                  value={editSubcategory}
                  onChange={(e) => setEditSubcategory(e.target.value)}
                  disabled={!editCategory}
                  className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Subcategory</option>
                  {editCategory && (CATEGORY_TREE[editCategory] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">SKU (Stock Keeping Unit)</label>
                <input type="text" value={editSku} onChange={(e) => setEditSku(e.target.value)} placeholder="E.g. SHAWL-RED" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Price (₹)</label>
                <input type="number" required value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="E.g. 1500" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Offer Percentage (%)</label>
                <input type="number" min="0" max="99" value={editOfferPercentage} onChange={(e) => setEditOfferPercentage(e.target.value)} placeholder="E.g. 10" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-550 dark:text-slate-400">Stock Availability</label>
                <select value={editStockStatus} onChange={(e) => setEditStockStatus(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105 cursor-pointer">
                  <option value="In Stock">In Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500">Stock Quantity</label>
              <input type="number" min="0" value={editStockQuantity} onChange={(e) => setEditStockQuantity(e.target.value)} placeholder="E.g. 25" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            {/* Delivery Locations Section */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-750/70">
              <label className="text-xs font-bold text-slate-550 flex items-center gap-1.5"><MapPin size={14} className="text-rose-500" /> Delivery Target Locations</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={editLocState}
                  onChange={(e) => {
                    setEditLocState(e.target.value);
                    setEditLocDistrict('');
                    setEditLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer"
                >
                  <option value="">Select State</option>
                  <option value="Anywhere">Anywhere</option>
                  {locationStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <select
                  value={editLocDistrict}
                  disabled={!editLocState || editLocState === 'Anywhere'}
                  onChange={(e) => {
                    setEditLocDistrict(e.target.value);
                    setEditLocCity('');
                  }}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {editLocState && editLocState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {editLocState && editLocState !== 'Anywhere' && getIndiaDistricts(editLocState).map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
                <select
                  value={editLocCity}
                  disabled={!editLocDistrict || editLocDistrict === 'Anywhere' || editLocState === 'Anywhere'}
                  onChange={(e) => setEditLocCity(e.target.value)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select City/Town</option>
                  {editLocDistrict && editLocDistrict !== 'Anywhere' && editLocState !== 'Anywhere' && <option value="Anywhere">Anywhere</option>}
                  {editLocState && editLocDistrict && editLocDistrict !== 'Anywhere' && getIndiaCities(editLocState, editLocDistrict).map(ct => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleEditAddLocation}
                className="px-3 py-1.5 bg-white hover:bg-black text-black hover:text-white dark:bg-slate-800 dark:text-white dark:hover:bg-black dark:hover:text-white border border-slate-300 dark:border-slate-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
              >
                + Add Location
              </button>
              {editDeliveryLocations.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/50 mt-2">
                  {editDeliveryLocations.map((loc, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                      {loc.state} {loc.district ? `> ${loc.district}` : ''} {loc.city ? `> ${loc.city}` : ''}
                      <button type="button" onClick={() => handleEditRemoveLocation(index)} className="text-red-500 hover:text-red-750 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">Search Tags</label>
              <div className="flex gap-2">
                <input type="text" value={editTagInput} onChange={(e) => setEditTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditAddTag(); } }} placeholder="Add product tag (press Enter)" className="flex-grow p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105" />
                <button type="button" onClick={handleEditAddTag} className="px-4 bg-slate-850 dark:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer">Add</button>
              </div>

              {editTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {editTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-750 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      #{tag}
                      <button type="button" onClick={() => handleEditRemoveTag(tag)} className="text-slate-400 hover:text-red-500 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-550">Product Images (Upload up to 10 files) *</label>
                <input type="file" multiple accept="image/*" onChange={handleEditImagesChange} className="w-full mt-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-750 p-2.5 rounded-xl cursor-pointer" />
              </div>
            </div>

            {editMediaItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-150 dark:border-slate-750">
                {editMediaItems.map((item, idx) => (
                  <div key={item.id} className="aspect-square relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 group shadow-sm">
                    <img src={item.isExisting ? item.url : item.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveEditMediaItem(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-650 cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                    <span className={`absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-bold text-white select-none ${item.isExisting ? 'bg-indigo-650/80' : 'bg-green-600/80'
                      }`}>
                      {item.isExisting ? 'Saved' : 'New'}
                    </span>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/75 backdrop-blur-xs p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleMoveEditMediaItem(idx, 'left')}
                        disabled={idx === 0}
                        className="text-white hover:text-rose-450 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft size={10} />
                      </button>
                      <span className="text-[8px] text-white font-bold select-none">{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleMoveEditMediaItem(idx, 'right')}
                        disabled={idx === editMediaItems.length - 1}
                        className="text-white hover:text-rose-455 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500">Description</label>
                <button type="button" onClick={() => handleGenerateDescription(true)} className="text-[10px] font-bold text-purple-600 flex items-center gap-1 hover:underline">
                  {isGeneratingDesc ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />} Write with AI
                </button>
              </div>
              <textarea rows={3} required value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Story of the craft..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500">Social Caption taglines</label>
                <button type="button" onClick={() => handleGenerateCaption(true)} className="text-[10px] font-bold text-purple-600 flex items-center gap-1 hover:underline">
                  {isGeneratingCaption ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />} Create tags with AI
                </button>
              </div>
              <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} placeholder="Instagram hashtags..." className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-850 dark:text-slate-105" />
            </div>

            <div className="flex gap-2 justify-end pt-3">
              <button type="button" onClick={() => setSearchParams({ view: 'products' })} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-550 rounded-xl text-xs font-bold cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 bg-gradient-to-r from-rose-500 to-indigo-650 text-white rounded-xl text-xs font-bold cursor-pointer">
                {loading ? 'Saving...' : 'Update Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: ORDER LOG & STATUS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Orders Log Book</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track items purchased from your catalog and modify fulfillment statuses.</p>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-rose-50 dark:border-slate-750 pb-3 gap-2 text-xs text-slate-400">
                    <span className="font-mono text-[10px] text-rose-500">ORDER ID: {o._id}</span>
                    <span>Placed on: {new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="divide-y divide-rose-50 dark:divide-slate-750">
                    {o.products.map((item) => (
                      <div key={item._id} className="py-2.5 flex justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-850 dark:text-slate-105">{item.product?.title || 'Catalog Item'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-rose-600">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 gap-4 border-t border-rose-50 dark:border-slate-750">
                    <div className="text-xs">
                      <span className="text-slate-450 dark:text-slate-400 font-bold">Shipment Status: </span>
                      <span className="font-bold capitalize text-rose-600 dark:text-rose-400">{translateStatus(o.orderStatus)}</span>
                    </div>

                    {/* Fulfill Status selector */}
                    <div className="flex gap-2">
                      {o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled' && (
                        <>
                          <button
                            onClick={() => handleUpdateOrderStatus(o._id, 'Processing')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Processing
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o._id, 'Shipped')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Shipped
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(o._id, 'Delivered')}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl text-slate-400 text-xs">
              No orders received yet.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: SHIPMENT TRACKER TIMELINE */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'shipments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Shipment Status Tracker & Fulfillment</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage details of package deliveries, update tracking numbers, and add custom timeline events.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timeline Editor Form (Sticky) */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm h-fit">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1"><Truck size={14} className="text-rose-500" /> Update Shipment Info</h3>
              <form onSubmit={handleUpdateShipmentTimeline} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Select Active Order</label>
                  <select required value={updatingShipmentId} onChange={(e) => {
                    setUpdatingShipmentId(e.target.value);
                    const selected = shipments.find(s => s._id === e.target.value);
                    if (selected) {
                      setTrackingNumUpdate(selected.trackingNumber || '');
                      setShipStatusUpdate(selected.shipmentStatus || 'Pending');
                    }
                  }} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer">
                    <option value="">Choose Order</option>
                    {shipments.map(s => (
                      <option key={s._id} value={s._id}>Order #{s._id.slice(-6)} - {s.customer?.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Shipment Status</label>
                  <select value={shipStatusUpdate} onChange={(e) => setShipStatusUpdate(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105 cursor-pointer">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500">Tracking Number</label>
                  <input type="text" value={trackingNumUpdate} onChange={(e) => setTrackingNumUpdate(e.target.value)} placeholder="Courier Tracking ID" className="w-full mt-1 p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105" />
                </div>

                <div className="border-t border-rose-50 dark:border-slate-750 pt-3">
                  <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">New Timeline Log Event</h4>
                  <div className="space-y-3">
                    <div>
                      <input type="text" value={timelineEvent} onChange={(e) => setTimelineEvent(e.target.value)} placeholder="E.g. Dispatched from center" className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105" />
                    </div>
                    <div>
                      <textarea rows={2} value={timelineDesc} onChange={(e) => setTimelineDesc(e.target.value)} placeholder="Description details..." className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-xs rounded-xl focus:outline-none text-slate-850 dark:text-slate-105" />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  Save Shipment Changes
                </button>
              </form>
            </div>

            {/* Shipments List & Details (Accordion style timeline) */}
            <div className="lg:col-span-2 space-y-4">
              {shipments.length > 0 ? (
                shipments.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono text-rose-500 font-bold">ORDER ID: {s._id}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Customer: {s.customer?.name} ({s.customer?.email})</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${s.shipmentStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                          s.shipmentStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-indigo-100 text-indigo-800'
                          }`}>
                          {s.shipmentStatus || 'Pending'}
                        </span>
                        {s.trackingNumber && <p className="text-[9px] font-mono text-slate-400 mt-1">TRACKING ID: {s.trackingNumber}</p>}
                      </div>
                    </div>

                    {/* Timeline Tracker list */}
                    <div className="pl-4 border-l-2 border-rose-100 dark:border-slate-700 space-y-3">
                      {s.timeline && s.timeline.length > 0 ? (
                        s.timeline.map((event, idx) => (
                          <div key={idx} className="relative pl-3">
                            <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white capitalize">{event.status}</p>
                            <p className="text-[10px] text-slate-400">{event.description}</p>
                            <span className="text-[8px] text-slate-400 block mt-0.5">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-450 italic pl-2">No timeline logged yet. Updates on status will be listed here.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl text-slate-450 text-xs">
                  No shipments logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: MY CUSTOMERS LOG */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'customers' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Customer Log Sheet</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Directory of shoppers who have checked out items from your catalog.</p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 uppercase tracking-wider border-b border-rose-100/20 dark:border-slate-700">
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">Phone Number</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 dark:divide-slate-750 font-semibold font-sans">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                      <td className="px-6 py-4 font-bold text-slate-850 dark:text-slate-105">{o.customer?.name || 'Shopper'}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{o.customer?.email || 'N/A'}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500 dark:text-slate-400">{o.customer?.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-slate-550 dark:text-slate-400 truncate max-w-xs">{o.customer?.address || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleChatWithCustomer(o.customer)}
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-bold rounded-lg flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
                        >
                          <Mail size={10} /> Message
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: DETAILED SALES ANALYTICS */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Earnings Analytics Report</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Review gross values, sales charts, and platform commission charges.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Fees Deducted (10%)</h3>
              <p className="text-2xl font-black text-rose-600">
                ₹{(orders.reduce((acc, o) => acc + o.totalAmount, 0) * 0.1).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">Charged at settlement verification processing.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Partner Income</h3>
              <p className="text-2xl font-black text-green-600">
                ₹{(orders.reduce((acc, o) => acc + o.totalAmount, 0) * 0.9).toFixed(2)}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">Transferred automatically weekly to bank record.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Sales Orders</h3>
              <p className="text-2xl font-black text-indigo-600">
                {orders.length} Completed
              </p>
              <p className="text-[10px] text-slate-500 font-semibold">Average order value: ₹{(orders.length > 0 ? (orders.reduce((acc, o) => acc + o.totalAmount, 0) / orders.length) : 0).toFixed(0)}</p>
            </div>
          </div>

          {/* Graphical Analytics Charts (Pure Tailwind/HTML elements) */}
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={16} className="text-rose-500" /> Platform Sales Performance Metrics</h3>

            {/* Visual HTML Bar Chart */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                  <span>Gross Sales Volume</span>
                  <span>₹{orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750">
                  <div className="h-full bg-rose-500 rounded-full shadow-xs" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                  <span>Settled Net Earnings</span>
                  <span>₹{(orders.reduce((acc, o) => acc + o.totalAmount, 0) * 0.9).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750">
                  <div className="h-full bg-green-500 rounded-full shadow-xs" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-350 mb-1">
                  <span>Platform Commission Charges</span>
                  <span>₹{(orders.reduce((acc, o) => acc + o.totalAmount, 0) * 0.1).toLocaleString('en-IN')}</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-750">
                  <div className="h-full bg-indigo-500 rounded-full shadow-xs" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: SELLER WISHLIST */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'wishlist' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Saved Wishlist Items</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Your favorite item listings saved to wishlist.</p>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item._id} className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="aspect-square relative overflow-hidden bg-gray-50 border-b border-rose-50 dark:border-slate-750">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => toggleWishlist(item)}
                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs rounded-xl shadow-xs text-rose-500 hover:scale-105 cursor-pointer"
                      >
                        <Heart size={16} className="fill-current" />
                      </button>
                    </div>
                    <div className="p-4 space-y-1.5">
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 rounded-lg">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-850 dark:text-slate-105 line-clamp-2">{item.title}</h4>
                      <p className="text-sm font-black text-rose-600 dark:text-rose-400">₹{item.price}</p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        alert('Added to Cart!');
                      }}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={12} /> Add to Cart
                    </button>
                    <button
                      onClick={() => navigate(`/product/${item._id}`)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl shadow-sm text-slate-400 text-xs">
              Wishlist is empty.
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: PROFILE DETAILS */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'profile' && (
        <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Storefront Profile Information</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Manage storefront business name, display avatar, and addresses.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-rose-50 dark:border-slate-750 pb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-rose-100 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-rose-500 font-extrabold text-2xl">
                {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : profileData.name?.charAt(0).toUpperCase()}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-105">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-sm text-slate-850 dark:text-slate-105">{profileData.name}</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{user?.role} Profile</p>
              {avatar && (
                <button onClick={handleRemoveAvatar} className="text-[9px] font-bold text-red-500 hover:text-red-700 mt-1 cursor-pointer">
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Entrepreneur Name</label>
              <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Email Address</label>
              <input type="email" disabled value={profileData.email} className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-400 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Contact Phone</label>
              <input type="text" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Storefront Address</label>
              <input type="text" value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs text-slate-850 dark:text-slate-105 focus:outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={loading} className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs">
                {loading ? 'Saving...' : 'Update Store Details'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW: SECURITY SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'settings' && (
        <div className="bg-white dark:bg-slate-800 border border-rose-100/30 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Security & Account Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Manage password updates and credentials security options.</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5"><Key size={16} className="text-rose-500" /> Security Update Password</h3>
            {passwordError && <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 text-xs font-semibold rounded-xl">{passwordError}</div>}
            {passwordSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 text-xs font-semibold rounded-xl">{passwordSuccess}</div>}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t('newPassword')}</label>
                  <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t('confirmPassword')}</label>
                  <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-755 text-xs text-slate-850 dark:text-slate-105 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
              </div>
              <button type="submit" className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs">
                {t('updatePassword')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SellerDashboard;
