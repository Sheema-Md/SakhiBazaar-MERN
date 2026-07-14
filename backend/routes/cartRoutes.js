const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  toggleSaveForLater,
  moveToWishlist,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItemQuantity);
router.delete('/', clearCart);
router.delete('/:id', removeFromCart);
router.put('/save-for-later', toggleSaveForLater);
router.post('/move-to-wishlist', moveToWishlist);

module.exports = router;
