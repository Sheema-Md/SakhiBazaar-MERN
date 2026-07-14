const mongoose = require('mongoose');

const marketTrendSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  demandTrend: {
    type: String,
    enum: ['Increasing', 'Decreasing', 'Stable', 'High', 'Medium', 'Low'],
    default: 'Stable',
  },
  supplyTrend: {
    type: String,
    enum: ['Increasing', 'Decreasing', 'Stable', 'High', 'Medium', 'Low'],
    default: 'Stable',
  },
  popularProducts: {
    type: [String],
    default: [],
  },
  priceIncreaseItems: [
    {
      name: { type: String, required: true },
      change: { type: Number, required: true }
    }
  ],
  priceDecreaseItems: [
    {
      name: { type: String, required: true },
      change: { type: Number, required: true }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('MarketTrend', marketTrendSchema);
