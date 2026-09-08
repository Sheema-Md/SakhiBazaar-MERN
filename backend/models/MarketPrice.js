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
  unit: {
    type: String,
    default: 'listing',
    trim: true,
  },
  region: {
    type: String,
    default: 'India',
    trim: true,
  },
  source: {
    type: String,
    default: 'platform-benchmark',
    trim: true,
  },
  context: {
    type: String,
    default: 'Marketplace category benchmark',
    trim: true,
  },
  referenceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  dataAsOf: {
    type: Date,
    default: Date.now,
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable',
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
  observations: [
    {
      observedAt: { type: Date, required: true },
      value: { type: Number, required: true },
      source: { type: String, default: '' },
      unit: { type: String, default: '' },
      region: { type: String, default: '' },
    },
  ],
  normalization: {
    unit: { type: String, default: 'listing' },
    method: { type: String, default: 'none' },
    baseUnit: { type: String, default: 'listing' },
  },
  seasonalPricing: [
    {
      season: { type: String, required: true },
      multiplier: { type: Number, required: true },
      avgPrice: { type: Number, required: true }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
