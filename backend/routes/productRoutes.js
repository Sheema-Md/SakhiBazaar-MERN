const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/productController');
const { protect, seller } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Define multi-upload fields configuration
const productUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 }
]);

// Protected routes (higher precedence items)
router.get('/seller/me', protect, seller, getMyProducts);

// Public routes
router.get('/', getProducts);
router.get('/filter', filterProducts);
router.get('/search', searchProducts);
router.get('/stats/category', getProductStatsByCategory);
router.get('/:id', getProductById);

// Define upload fields for reviews
const reviewUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// Protected editing routes
router.post('/', protect, seller, productUpload, createProduct);
router.put('/:id', protect, productUpload, updateProduct);
router.delete('/:id', protect, deleteProduct);
router.post('/:id/review', protect, reviewUpload, createProductReview);

module.exports = router;
