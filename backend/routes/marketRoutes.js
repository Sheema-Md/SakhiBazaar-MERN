const express = require('express');
const router = express.Router();
const {
  getMarketPrices,
  getMarketTrends,
} = require('../controllers/marketController');

router.get('/market-prices', getMarketPrices);
router.get('/market-trends', getMarketTrends);

module.exports = router;
