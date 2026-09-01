const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Helper to safely delete local temp files
const deleteLocalFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error('Failed to delete temporary file:', err.message);
    }
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller only)
// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller only)
const createProduct = async (req, res) => {
  try {
    const { 
      title, description, price, category, subcategory, 
      offerPercentage, stockStatus, stockQuantity, sku, 
      deliveryLocations, tags, marketingCaption 
    } = req.body;

    if (!title || !description || !price || !category) {
      if (req.file) deleteLocalFile(req.file.path);
      if (req.files) {
        if (req.files.image) req.files.image.forEach(f => deleteLocalFile(f.path));
        if (req.files.images) req.files.images.forEach(f => deleteLocalFile(f.path));
      }
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    let imageUrls = [];

    // Parse existing image URLs if provided in body
    if (req.body.images) {
      try {
        if (typeof req.body.images === 'string') {
          imageUrls = JSON.parse(req.body.images);
        } else if (Array.isArray(req.body.images)) {
          imageUrls = req.body.images;
        }
      } catch (e) {
        imageUrls = [req.body.images];
      }
    }

    // Process single file upload fallback
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'sakhi_bazaar_products',
        });
        imageUrls.push(result.secure_url);
      } catch (err) {
        console.error('Cloudinary single upload failed:', err.message);
      } finally {
        deleteLocalFile(req.file.path);
      }
    }

    // Process multiple files upload
    if (req.files) {
      const filesToUpload = [];
      if (req.files.image) filesToUpload.push(...req.files.image);
      if (req.files.images) filesToUpload.push(...req.files.images);

      for (const file of filesToUpload) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sakhi_bazaar_products',
          });
          imageUrls.push(result.secure_url);
        } catch (err) {
          console.error('Cloudinary multiple upload failed:', err.message);
        } finally {
          deleteLocalFile(file.path);
        }
      }
    }

    if (imageUrls.length === 0) {
      imageUrls.push('https://via.placeholder.com/300?text=No+Image');
    }

    // Parse delivery locations and tags
    let parsedDeliveryLocations = [];
    if (deliveryLocations) {
      try {
        parsedDeliveryLocations = typeof deliveryLocations === 'string' ? JSON.parse(deliveryLocations) : deliveryLocations;
      } catch (e) {
        console.error('Failed to parse delivery locations:', e);
      }
    }

    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    // Create product
    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      subcategory: subcategory || '',
      imageUrl: imageUrls[0],
      images: imageUrls,
      offerPercentage: Number(offerPercentage || 0),
      stockStatus: stockStatus || 'In Stock',
      stockQuantity: Number(stockQuantity || 0),
      sku: sku || '',
      deliveryLocations: parsedDeliveryLocations,
      tags: parsedTags,
      marketingCaption: marketingCaption || '',
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    if (req.files) {
      if (req.files.image) req.files.image.forEach(f => deleteLocalFile(f.path));
      if (req.files.images) req.files.images.forEach(f => deleteLocalFile(f.path));
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (with search and basic filtering)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('seller', 'name email username phone address')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email username phone address')
      .populate('reviews.userId', 'name avatar');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing product
// @route   PUT /api/products/:id
// @access  Private (Seller owner or Admin only)
const updateProduct = async (req, res) => {
  try {
    const { 
      title, description, price, category, subcategory, 
      offerPercentage, stockStatus, stockQuantity, sku, 
      deliveryLocations, tags, marketingCaption, status 
    } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product) {
      if (req.file) deleteLocalFile(req.file.path);
      if (req.files) {
        if (req.files.image) req.files.image.forEach(f => deleteLocalFile(f.path));
        if (req.files.images) req.files.images.forEach(f => deleteLocalFile(f.path));
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership or admin role
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      if (req.file) deleteLocalFile(req.file.path);
      if (req.files) {
        if (req.files.image) req.files.image.forEach(f => deleteLocalFile(f.path));
        if (req.files.images) req.files.images.forEach(f => deleteLocalFile(f.path));
      }
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    let imageUrls = product.images && product.images.length > 0 ? product.images : [product.imageUrl];

    // Parse existing image URLs if provided in body
    if (req.body.images) {
      try {
        if (typeof req.body.images === 'string') {
          imageUrls = JSON.parse(req.body.images);
        } else if (Array.isArray(req.body.images)) {
          imageUrls = req.body.images;
        }
      } catch (e) {
        imageUrls = [req.body.images];
      }
    }

    // Handle single file upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'sakhi_bazaar_products',
        });
        imageUrls.push(result.secure_url);
      } catch (err) {
        console.error('Cloudinary single upload failed:', err.message);
      } finally {
        deleteLocalFile(req.file.path);
      }
    }

    // Handle multiple files upload
    if (req.files) {
      const filesToUpload = [];
      if (req.files.image) filesToUpload.push(...req.files.image);
      if (req.files.images) filesToUpload.push(...req.files.images);

      for (const file of filesToUpload) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'sakhi_bazaar_products',
          });
          imageUrls.push(result.secure_url);
        } catch (err) {
          console.error('Cloudinary multiple upload failed:', err.message);
        } finally {
          deleteLocalFile(file.path);
        }
      }
    }

    // Parse delivery locations and tags
    let parsedDeliveryLocations = product.deliveryLocations;
    if (deliveryLocations) {
      try {
        parsedDeliveryLocations = typeof deliveryLocations === 'string' ? JSON.parse(deliveryLocations) : deliveryLocations;
      } catch (e) {
        console.error('Failed to parse delivery locations:', e);
      }
    }

    let parsedTags = product.tags;
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch (e) {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      }
    }

    // Update fields
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.category = category || product.category;
    product.subcategory = subcategory !== undefined ? subcategory : product.subcategory;
    product.imageUrl = imageUrls[0] || product.imageUrl;
    product.images = imageUrls;
    product.offerPercentage = offerPercentage !== undefined ? Number(offerPercentage) : product.offerPercentage;
    product.stockStatus = stockStatus || product.stockStatus;
    product.stockQuantity = stockQuantity !== undefined ? Number(stockQuantity) : product.stockQuantity;
    product.sku = sku !== undefined ? sku : product.sku;
    product.deliveryLocations = parsedDeliveryLocations;
    product.tags = parsedTags;
    product.markModified('deliveryLocations');
    product.markModified('tags');
    product.marketingCaption = marketingCaption !== undefined ? marketingCaption : product.marketingCaption;
    if (status !== undefined) product.status = status;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    if (req.file) deleteLocalFile(req.file.path);
    if (req.files) {
      if (req.files.image) req.files.image.forEach(f => deleteLocalFile(f.path));
      if (req.files.images) req.files.images.forEach(f => deleteLocalFile(f.path));
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller owner or Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify ownership or admin role
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get products listed by the logged-in seller
// @route   GET /api/products/seller/me
// @access  Private (Seller only)
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Advanced filters endpoint (Multi-select category tree, price, stockStatus, offer)
// @route   GET /api/products/filter
// @access  Public
const filterProducts = async (req, res) => {
  try {
    const { 
      categories, category, 
      subcategories, subcategory, 
      minPrice, maxPrice, priceRange, 
      stockStatus, 
      offer, offerStatus, 
      location, search 
    } = req.query;
    
    let query = { status: 'active' };
    let andConditions = [];

    // 1. Search Query (optimized and doesn't overwrite $or)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { sku: searchRegex },
          { tags: searchRegex },
          { category: searchRegex },
          { subcategory: searchRegex }
        ]
      });
    }

    // 2. Location Filtering
    if (location && location.trim()) {
      const locRegex = new RegExp(location.trim(), 'i');
      andConditions.push({
        $or: [
          { deliveryLocations: { $size: 0 } }, // Delivers everywhere if no locations listed
          { 'deliveryLocations.state': /anywhere/i },
          { 'deliveryLocations.district': /anywhere/i },
          { 'deliveryLocations.city': /anywhere/i },
          { 'deliveryLocations.state': locRegex },
          { 'deliveryLocations.district': locRegex },
          { 'deliveryLocations.city': locRegex }
        ]
      });
    }

    // Add $and conditions if present
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // 3. Category Filter
    const activeCategories = category || categories;
    if (activeCategories) {
      const catList = Array.isArray(activeCategories) 
        ? activeCategories 
        : activeCategories.split(',').map(s => s.trim()).filter(Boolean);
      if (catList.length > 0) {
        query.category = { $in: catList.map(c => new RegExp(`^${c}$`, 'i')) };
      }
    }

    // 4. Subcategory Filter
    const activeSubcategories = subcategory || subcategories;
    if (activeSubcategories) {
      const subList = Array.isArray(activeSubcategories)
        ? activeSubcategories
        : activeSubcategories.split(',').map(s => s.trim()).filter(Boolean);
      if (subList.length > 0) {
        query.subcategory = { $in: subList.map(s => new RegExp(`^${s}$`, 'i')) };
      }
    }

    // 5. Price Filter
    let finalMin = minPrice;
    let finalMax = maxPrice;
    if (priceRange) {
      const parts = priceRange.split('-');
      if (parts.length === 2) {
        finalMin = parts[0];
        finalMax = parts[1];
      }
    }
    if (finalMin || finalMax) {
      query.price = {};
      if (finalMin) query.price.$gte = Number(finalMin);
      if (finalMax) query.price.$lte = Number(finalMax);
    }

    // 6. Stock Status Filter
    if (stockStatus) {
      const stockList = Array.isArray(stockStatus)
        ? stockStatus
        : stockStatus.split(',').map(s => s.trim()).filter(Boolean);
      if (stockList.length > 0) {
        query.stockStatus = { $in: stockList };
      }
    }

    // 7. Offers Filter
    const isOffer = offer === 'true' || offerStatus === 'true' || offer === true || offerStatus === true;
    if (isOffer) {
      query.offerPercentage = { $gt: 0 };
    }

    const products = await Product.find(query)
      .populate('seller', 'name email username phone address')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search products by keyword and optional category
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    let query = { status: 'active' };

    if (category && category !== 'All' && category !== 'all') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (keyword) {
      query.$or = [
        { $text: { $search: keyword } },
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { sku: { $regex: keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(keyword, 'i')] } }
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'name email username phone address')
      .limit(30);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get average, min, max product prices for a category
// @route   GET /api/products/stats/category
// @access  Public
const getProductStatsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const stats = await Product.aggregate([
      { $match: { category: { $regex: `^${category}$`, $options: 'i' }, status: 'active' } },
      {
        $group: {
          _id: '$category',
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        category,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        count: 0
      });
    }

    res.json({
      category: stats[0]._id,
      avgPrice: Math.round(stats[0].avgPrice),
      minPrice: stats[0].minPrice,
      maxPrice: stats[0].maxPrice,
      count: stats[0].count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/review
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      // Safely delete any uploaded files if product is not found
      if (req.files) {
        const allFiles = [...(req.files.images || []), ...(req.files.videos || [])];
        allFiles.forEach(f => deleteLocalFile(f.path));
      }
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      if (req.files) {
        const allFiles = [...(req.files.images || []), ...(req.files.videos || [])];
        allFiles.forEach(f => deleteLocalFile(f.path));
      }
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    let imageUrls = [];
    let videoUrls = [];

    // Process files if present
    if (req.files) {
      if (req.files.images) {
        for (const file of req.files.images) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'sakhi_bazaar_reviews',
              resource_type: 'auto'
            });
            imageUrls.push(result.secure_url);
            deleteLocalFile(file.path);
          } catch (uploadErr) {
            console.error('Cloudinary review image upload failed:', uploadErr.message);
            deleteLocalFile(file.path);
          }
        }
      }

      if (req.files.videos) {
        for (const file of req.files.videos) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'sakhi_bazaar_reviews',
              resource_type: 'auto'
            });
            videoUrls.push(result.secure_url);
            deleteLocalFile(file.path);
          } catch (uploadErr) {
            console.error('Cloudinary review video upload failed:', uploadErr.message);
            deleteLocalFile(file.path);
          }
        }
      }
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      images: imageUrls,
      videos: videoUrls,
    };

    product.reviews.push(review);
    
    // Calculate new average rating
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    
    const updatedProduct = await Product.findById(req.params.id)
      .populate('seller', 'name email username phone address')
      .populate('reviews.userId', 'name avatar');
      
    res.status(201).json(updatedProduct);
  } catch (error) {
    if (req.files) {
      const allFiles = [...(req.files.images || []), ...(req.files.videos || [])];
      allFiles.forEach(f => deleteLocalFile(f.path));
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  filterProducts,
  getProductStatsByCategory,
  createProductReview,
  searchProducts,
};
