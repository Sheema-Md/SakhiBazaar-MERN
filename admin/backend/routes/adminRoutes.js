const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  getUsers,
  updateUserStatus,
  deleteUser,
  getProducts,
  updateProductStatus,
  deleteProduct,
  getOrders,
  getAnalytics,
  updateOrderStatus,
  getCategories, createCategory, updateCategory, deleteCategory,
  getReturns, updateReturn, getRefunds, updateRefund,
  getNotifications, getMarketData, updateMarketPrice, getReport,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public Auth routes (Login only - Admin accounts must not be registered via unauthenticated public endpoints)
router.post('/auth/login', loginAdmin);

// Moderation routes (Protected)
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

router.get('/products', getProducts);
router.put('/products/:id/status', updateProductStatus);
router.delete('/products/:id', deleteProduct);

router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/analytics', getAnalytics);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/returns', getReturns);
router.put('/returns/:orderId/:requestIndex', updateReturn);
router.get('/refunds', getRefunds);
router.put('/refunds/:orderId/:requestIndex', updateRefund);
router.get('/notifications', getNotifications);
router.get('/market-data', getMarketData);
router.put('/market-data/prices/:id', updateMarketPrice);
router.get('/reports/revenue', getReport);

module.exports = router;
