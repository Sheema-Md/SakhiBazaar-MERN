const MarketPrice = require('../models/MarketPrice');
const MarketTrend = require('../models/MarketTrend');

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
    await seedMarketPrices();
    const prices = await MarketPrice.find().sort({ productName: 1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get marketplace trends
// @route   GET /api/market-trends
// @access  Public
const getMarketTrends = async (req, res) => {
  try {
    await seedMarketTrends();
    const trends = await MarketTrend.find().sort({ category: 1 });
    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMarketPrices,
  getMarketTrends,
};
