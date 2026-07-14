const express = require('express');
const router = express.Router();
const {
  generateDescription,
  generateCaption,
} = require('../controllers/aiController');
const { protect, seller } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, seller, generateDescription);
router.post('/generate-caption', protect, seller, generateCaption);

module.exports = router;
