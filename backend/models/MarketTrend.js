const mongoose = require('mongoose');

const marketTrendSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    trim: true,
  },
  region: { type: String, default: 'India', trim: true },
  source: { type: String, default: 'platform-observations', trim: true },
  dataAsOf: { type: Date, default: Date.now },
  window: { type: String, default: 'current snapshot', trim: true },
  observations: [
    {
      observedAt: { type: Date, required: true },
      value: { type: Number, required: true },
      metric: { type: String, default: 'demand' },
      source: { type: String, default: '' },
    },
  ],
  forecast: { type: mongoose.Schema.Types.Mixed, default: null },
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
