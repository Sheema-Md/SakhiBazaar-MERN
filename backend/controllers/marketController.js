const MarketPrice = require('../models/MarketPrice');
const MarketTrend = require('../models/MarketTrend');
const Product = require('../models/Product');

const forecastSeries = (observations) => {
  const values = observations.map((item) => Number(item.value)).filter(Number.isFinite);
  if (values.length < 2) return null;

  const meanX = (values.length - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
  const denominator = values.reduce((sum, _, index) => sum + ((index - meanX) ** 2), 0) || 1;
  const slope = values.reduce((sum, value, index) => sum + ((index - meanX) * (value - meanY)), 0) / denominator;
  const intercept = meanY - (slope * meanX);
  const predictedPrice = Math.max(0, Math.round(intercept + (slope * values.length)));
  const changePercent = meanY ? Number(((slope / meanY) * 100).toFixed(2)) : 0;

  return {
    model: 'linear-regression-v1',
    horizon: 'next observation window',
    predictedPrice,
    slope: Number(slope.toFixed(2)),
    changePercent,
    confidence: values.length >= 4 ? 'medium' : 'low',
  };
};

// Seed mock Market Prices data
const seedMarketPrices = async () => {
  const count = await MarketPrice.countDocuments();
  if (count === 0) {
    const prices = [
      {
        productName: 'Pashmina Wool (Per Kg)',
        category: 'Clothing',
        currentPrice: 3800,
        yesterdayPrice: 3750,
        weeklyChange: 2.1,
        monthlyChange: 5.4,
        priceTrend: [3500, 3600, 3700, 3720, 3750, 3800],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.20, avgPrice: 4560 },
          { season: 'Summer', multiplier: 0.90, avgPrice: 3420 },
          { season: 'Monsoon', multiplier: 1.00, avgPrice: 3800 },
          { season: 'Festive', multiplier: 1.10, avgPrice: 4180 }
        ]
      },
      {
        productName: 'Organic Wild Honey (Per Litre)',
        category: 'Food',
        currentPrice: 420,
        yesterdayPrice: 430,
        weeklyChange: -1.5,
        monthlyChange: 8.2,
        priceTrend: [380, 395, 410, 425, 430, 420],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.15, avgPrice: 483 },
          { season: 'Summer', multiplier: 1.00, avgPrice: 420 },
          { season: 'Monsoon', multiplier: 1.25, avgPrice: 525 },
          { season: 'Festive', multiplier: 1.10, avgPrice: 462 }
        ]
      },
      {
        productName: 'Mulberry Silk Yarn (Per Kg)',
        category: 'Clothing',
        currentPrice: 5200,
        yesterdayPrice: 5200,
        weeklyChange: 0.0,
        monthlyChange: -2.3,
        priceTrend: [5300, 5280, 5250, 5200, 5200, 5200],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.05, avgPrice: 5460 },
          { season: 'Summer', multiplier: 1.00, avgPrice: 5200 },
          { season: 'Monsoon', multiplier: 0.95, avgPrice: 4940 },
          { season: 'Festive', multiplier: 1.20, avgPrice: 6240 }
        ]
      },
      {
        productName: 'Silver Filigree Wire (Per 100g)',
        category: 'Jewelry',
        currentPrice: 8500,
        yesterdayPrice: 8400,
        weeklyChange: 3.2,
        monthlyChange: 12.5,
        priceTrend: [7500, 7800, 8100, 8250, 8400, 8500],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.10, avgPrice: 9350 },
          { season: 'Summer', multiplier: 1.00, avgPrice: 8500 },
          { season: 'Monsoon', multiplier: 1.00, avgPrice: 8500 },
          { season: 'Festive', multiplier: 1.30, avgPrice: 11050 }
        ]
      },
      {
        productName: 'Terracotta Clay (Per Ton)',
        category: 'Handmade Crafts',
        currentPrice: 12000,
        yesterdayPrice: 12000,
        weeklyChange: 0.8,
        monthlyChange: 1.5,
        priceTrend: [11800, 11850, 11900, 12000, 12000, 12000],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.00, avgPrice: 12000 },
          { season: 'Summer', multiplier: 1.10, avgPrice: 13200 },
          { season: 'Monsoon', multiplier: 0.80, avgPrice: 9600 },
          { season: 'Festive', multiplier: 1.15, avgPrice: 13800 }
        ]
      },
      {
        productName: 'Green Cardamom (Per Kg)',
        category: 'Food',
        currentPrice: 2200,
        yesterdayPrice: 2250,
        weeklyChange: -3.4,
        monthlyChange: -6.2,
        priceTrend: [2400, 2350, 2300, 2280, 2250, 2200],
        seasonalPricing: [
          { season: 'Winter', multiplier: 1.10, avgPrice: 2420 },
          { season: 'Summer', multiplier: 0.90, avgPrice: 1980 },
          { season: 'Monsoon', multiplier: 1.20, avgPrice: 2640 },
          { season: 'Festive', multiplier: 1.15, avgPrice: 2530 }
        ]
      }
    ];

    await MarketPrice.insertMany(prices);
    console.log('✅ Seeding market prices database successful.');
  }
};

// Seed mock Market Trends data
const seedMarketTrends = async () => {
  const count = await MarketTrend.countDocuments();
  if (count === 0) {
    const trends = [
      {
        category: 'Clothing',
        demandTrend: 'High',
        supplyTrend: 'Medium',
        popularProducts: ['Pashmina Shawls', 'Mulberry Silk Sarees', 'Bhandhej Kurtis'],
        priceIncreaseItems: [
          { name: 'Pashmina Wool (Per Kg)', change: 2.1 },
          { name: 'Zari Border Sarees', change: 1.5 }
        ],
        priceDecreaseItems: [
          { name: 'Cotton Yarn', change: -0.5 }
        ]
      },
      {
        category: 'Handmade Crafts',
        demandTrend: 'Increasing',
        supplyTrend: 'Stable',
        popularProducts: ['Channapatna Toys', 'Blue Pottery Vases', 'Macrame Wall Hangings'],
        priceIncreaseItems: [
          { name: 'Terracotta Clay', change: 0.8 },
          { name: 'Rosewood Timber', change: 4.2 }
        ],
        priceDecreaseItems: []
      },
      {
        category: 'Food',
        demandTrend: 'Stable',
        supplyTrend: 'High',
        popularProducts: ['Organic Honey', 'Homemade Mango Pickle', 'Kashmiri Saffron'],
        priceIncreaseItems: [
          { name: 'Raw Honey Scarcity', change: 8.2 }
        ],
        priceDecreaseItems: [
          { name: 'Green Cardamom (Per Kg)', change: -3.4 },
          { name: 'Mustard Seeds', change: -1.2 }
        ]
      },
      {
        category: 'Jewelry',
        demandTrend: 'High',
        supplyTrend: 'Low',
        popularProducts: ['Terracotta Earring Sets', 'Silver Filigree Necklaces', 'Beaded Anklets'],
        priceIncreaseItems: [
          { name: 'Silver Filigree Wire', change: 3.2 },
          { name: 'Beads raw stock', change: 2.7 }
        ],
        priceDecreaseItems: []
      }
    ];

    await MarketTrend.insertMany(trends);
    console.log('✅ Seeding market trends database successful.');
  }
};

// @desc    Get commodities price benchmarks
// @route   GET /api/market-prices
// @access  Public
const getMarketPrices = async (req, res) => {
  try {
    const listingStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          currentPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          listingCount: { $sum: 1 },
          dataAsOf: { $max: '$updatedAt' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyHistory = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: {
            category: '$category',
            month: { $dateToString: { format: '%Y-%m', date: { $ifNull: ['$updatedAt', '$createdAt'] } } },
          },
          value: { $avg: '$price' },
        },
      },
      { $sort: { '_id.category': 1, '_id.month': 1 } },
    ]);
    const historyByCategory = monthlyHistory.reduce((history, item) => {
      const category = item._id.category;
      history[category] = history[category] || [];
      history[category].push({ observedAt: item._id.month, value: item.value });
      return history;
    }, {});

    if (listingStats.length > 0) {
      return res.json(listingStats.map((item) => {
        const prediction = forecastSeries(historyByCategory[item._id] || []);
        const changePercent = prediction?.changePercent || 0;
        return {
          productName: `${item._id} marketplace listings`,
          category: item._id,
          currentPrice: Math.round(item.currentPrice),
          referenceRange: { min: Math.round(item.minPrice), max: Math.round(item.maxPrice) },
          unit: 'per marketplace listing',
          region: 'India',
          context: `Current active ${item._id} listings (${item.listingCount} observations)`,
          source: 'Sakhi Bazaar active listings',
          dataSource: 'platform-listings',
          dataAsOf: item.dataAsOf || new Date(),
          isLive: false,
          prediction,
          trend: changePercent > 0.5 ? 'up' : changePercent < -0.5 ? 'down' : 'stable',
          weeklyChange: Number(changePercent.toFixed(2)),
          monthlyChange: 0,
          priceTrend: [],
        };
      }));
    }

    const prices = await MarketPrice.find().sort({ productName: 1 }).lean();
    res.json(prices.map((price) => ({
      ...price,
      dataSource: price.source || 'curated-reference',
      context: price.context || 'Curated reference benchmark; not a live quote',
      dataAsOf: price.dataAsOf || price.updatedAt,
      isLive: false,
      prediction: forecastSeries(price.observations || []),
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get marketplace trends
// @route   GET /api/market-trends
// @access  Public
const getMarketTrends = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', listingCount: { $sum: 1 }, dataAsOf: { $max: '$updatedAt' } } },
      { $sort: { _id: 1 } },
    ]);

    if (categories.length > 0) {
      const trends = await Promise.all(categories.map(async (item) => {
        const popularProducts = await Product.find({ category: item._id, status: 'active' })
          .sort({ ratings: -1, createdAt: -1 }).limit(5).select('title').lean();
        return {
          category: item._id,
          demandTrend: 'Stable',
          supplyTrend: 'Stable',
          popularProducts: popularProducts.map((product) => product.title),
          priceIncreaseItems: [],
          priceDecreaseItems: [],
          listingCount: item.listingCount,
          region: 'India',
          source: 'Sakhi Bazaar active listings',
          dataSource: 'platform-listings',
          dataAsOf: item.dataAsOf || new Date(),
          window: 'current snapshot; historical series not yet available',
        };
      }));
      return res.json(trends);
    }

    const trends = await MarketTrend.find().sort({ category: 1 }).lean();
    res.json(trends.map((trend) => ({
      ...trend,
      source: trend.source || 'curated-reference',
      dataSource: trend.source || 'curated-reference',
      dataAsOf: trend.dataAsOf || trend.updatedAt,
      window: trend.window || 'reference snapshot; historical series not yet available',
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMarketPrices,
  getMarketTrends,
};
