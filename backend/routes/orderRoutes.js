const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderHistory,
  trackOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/history', protect, getOrderHistory);
router.get('/track/:id', protect, trackOrder);
router.put('/status/:id', protect, updateOrderStatus);

module.exports = router;
