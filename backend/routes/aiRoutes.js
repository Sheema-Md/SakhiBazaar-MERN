const express = require('express');
const router = express.Router();
const {
  generateDescription,
  generateCaption,
  translateText,
} = require('../controllers/aiController');
const { protect, seller } = require('../middleware/authMiddleware');

router.post('/generate-description', protect, seller, generateDescription);
router.post('/generate-caption', protect, seller, generateCaption);
router.post('/translate', translateText);

module.exports = router;
