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
router.get('/analytics', getAnalytics);

module.exports = router;
