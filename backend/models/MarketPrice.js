const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  yesterdayPrice: {
    type: Number,
    required: true,
  },
  weeklyChange: {
    type: Number,
    default: 0,
  },
  monthlyChange: {
    type: Number,
    default: 0,
  },
  priceTrend: {
    type: [Number],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
