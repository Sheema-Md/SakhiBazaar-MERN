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
const { protect, seller, sellerOrAdmin } = require('../middleware/authMiddleware');
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
// create: seller only (new products can only be created by sellers)
router.post('/', protect, seller, productUpload, createProduct);
// update/delete: approved seller (owns product) or admin — ownership verified inside controllers
router.put('/:id', protect, sellerOrAdmin, productUpload, updateProduct);
router.delete('/:id', protect, sellerOrAdmin, deleteProduct);
router.post('/:id/review', protect, reviewUpload, createProductReview);

module.exports = router;
