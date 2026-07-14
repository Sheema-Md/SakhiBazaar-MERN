const express = require('express');
const router = express.Router();
const {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public route to view reviews
router.get('/:productId', getProductReviews);

// Protected routes to modify reviews
router.use(protect);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;
