const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const MarketPrice = require('./models/MarketPrice');
const Order = require('./models/Order');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

async function seedAllDatabaseData() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhibazaar';
    console.log(`Connecting to MongoDB Atlas at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}...`);
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully!\n');

    // ----------------------------------------------------
    // 1. SEED CATEGORIES
    // ----------------------------------------------------
    console.log('📁 1. Seeding Product Categories...');
    await Category.deleteMany({});
    const categoriesData = [
      { name: 'Clothing', subcategories: ['Sarees', 'Kurtis', 'Shawls', 'Kids Wear'] },
      { name: 'Handmade Crafts', subcategories: ['Wooden Toys', 'Pottery', 'Embroidered Bags', 'Paintings'] },
      { name: 'Food', subcategories: ['Spices', 'Pickles', 'Organic Honey', 'Sweets'] },
      { name: 'Jewelry', subcategories: ['Terracotta Jewelry', 'Silver Filigree', 'Beaded Necklaces', 'Earrings'] },
      { name: 'Home Decor', subcategories: ['Wall Hangings', 'Cushion Covers', 'Candles', 'Table Runners'] }
    ];
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`   ✅ Seeded ${insertedCategories.length} Categories.`);

    // ----------------------------------------------------
    // 2. SEED USERS (Sellers, Customers, Admin) - Preserves Existing Accounts
    // ----------------------------------------------------
    console.log('\n👤 2. Seeding Users (Preserving Existing Accounts)...');

    // Ensure Admin
    let admin = await User.findOne({ email: 'admin@sakhibazaar.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: 'admin@sakhibazaar.com',
        password: 'password123',
        role: 'admin',
        isVerified: true
      });
      console.log('   ✅ Admin user created (admin@sakhibazaar.com / password123)');
    } else {
      console.log('   ✅ Existing Admin verified (admin@sakhibazaar.com)');
    }

    // Helper to find or create user without wiping existing accounts
    const ensureUser = async (userData) => {
      let existing = await User.findOne({ email: userData.email });
      if (!existing) {
        existing = await User.create(userData);
        console.log(`   ✅ Created account: ${userData.email}`);
      } else {
        console.log(`   ℹ️ Preserved existing account: ${userData.email}`);
      }
      return existing;
    };

    // Sellers
    const seller1 = await ensureUser({
      name: 'Meera Handicrafts',
      email: 'meera.seller@sakhibazaar.org',
      password: 'Password123!',
      role: 'seller',
      storeName: 'Meera Artisan Studio',
      isVerified: true
    });

    const seller2 = await ensureUser({
      name: 'Kavitha Weaves',
      email: 'kavitha.seller@sakhibazaar.org',
      password: 'Password123!',
      role: 'seller',
      storeName: 'Kavitha Traditional Handlooms',
      isVerified: true
    });

    // Customers / Buyers
    const buyer1 = await ensureUser({
      name: 'Priya Sharma',
      email: 'priya.cust@example.com',
      password: 'Password123!',
      role: 'customer'
    });

    const buyer2 = await ensureUser({
      name: 'Ananya Reddy',
      email: 'ananya.cust@example.com',
      password: 'Password123!',
      role: 'customer'
    });
    console.log('   ✅ Seeded 2 Sellers & 2 Customers.');

    // ----------------------------------------------------
    // 3. SEED PRODUCTS
    // ----------------------------------------------------
    console.log('\n📦 3. Seeding Product Catalog...');
    await Product.deleteMany({});

    const productsData = [
      {
        title: 'Handcrafted Kalamkari Cotton Saree',
        category: 'Clothing',
        subcategory: 'Sarees',
        price: 2499,
        offerPercentage: 10,
        stockStatus: 'In Stock',
        stockQuantity: 15,
        sku: 'SAKHI-CLO-001',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'],
        description: 'Immerse yourself in Andhra artistry with our handcrafted Kalamkari Cotton Saree. Lovingly hand-block printed using 100% organic vegetable dyes.',
        marketingCaption: '✨ Grace meets tradition! Elevate your festive wardrobe with our handcrafted Kalamkari Saree. #SakhiBazaar #Kalamkari #Handmade',
        tags: ['Kalamkari', 'Cotton Saree', 'Handmade', 'Organic Dyes'],
        seller: seller1._id
      },
      {
        title: 'Traditional Chikankari Cotton Kurti',
        category: 'Clothing',
        subcategory: 'Kurtis',
        price: 1299,
        offerPercentage: 15,
        stockStatus: 'In Stock',
        stockQuantity: 25,
        sku: 'SAKHI-CLO-002',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'],
        description: 'Hand-embroidered Lucknowi Chikankari Kurti on breathable pure cotton fabric.',
        marketingCaption: '🌸 Soft, elegant, and timeless. Add handcrafted Chikankari to your wardrobe! #Chikankari #SummerFashion',
        tags: ['Chikankari', 'Cotton Kurti', 'Hand Embroidered'],
        seller: seller2._id
      },
      {
        title: 'Kondapalli Wooden Dancing Doll (Aata Bomma)',
        category: 'Handmade Crafts',
        subcategory: 'Wooden Toys',
        price: 950,
        offerPercentage: 0,
        stockStatus: 'In Stock',
        stockQuantity: 30,
        sku: 'SAKHI-CFT-001',
        imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80'],
        description: 'GI-tagged Kondapalli dancing doll handcrafted from lightweight softwood and painted with natural oil colors.',
        marketingCaption: '🪆 Bring home authentic Indian folk art with our Kondapalli Dancing Doll! #Kondapalli #FolkArt',
        tags: ['Kondapalli', 'Wooden Toy', 'GI Tagged'],
        seller: seller1._id
      },
      {
        title: 'Authentic Andhra Avakaya Mango Pickle (500g)',
        category: 'Food',
        subcategory: 'Pickles',
        price: 350,
        offerPercentage: 5,
        stockStatus: 'In Stock',
        stockQuantity: 50,
        sku: 'SAKHI-FOD-001',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80'],
        description: 'Spicy home-recipe mango pickle made with raw Guntur red chilies and sesame oil. No artificial preservatives.',
        marketingCaption: '🌶️ Taste the spicy warmth of home! Homemade Avakaya pickle prepared using grandmother’s recipe. #Avakaya #Homemade',
        tags: ['Pickle', 'Avakaya', 'Spicy'],
        seller: seller2._id
      },
      {
        title: 'Handcrafted Terracotta Temple Jewelry Set',
        category: 'Jewelry',
        subcategory: 'Terracotta Jewelry',
        price: 1150,
        offerPercentage: 15,
        stockStatus: 'In Stock',
        stockQuantity: 20,
        sku: 'SAKHI-JWL-001',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'],
        description: 'Exquisite hand-molded terracotta necklace with matching jhumka earrings.',
        marketingCaption: '👑 Make a unique style statement with handcrafted terracotta temple jewelry! #TerracottaJewelry #Ethnic',
        tags: ['Terracotta Jewelry', 'Temple Jewelry', 'Jhumkas'],
        seller: seller1._id
      }
    ];

    const insertedProducts = await Product.insertMany(productsData);
    console.log(`   ✅ Seeded ${insertedProducts.length} Products.`);

    // ----------------------------------------------------
    // 4. SEED MARKET PRICE BENCHMARKS
    // ----------------------------------------------------
    console.log('\n📊 4. Seeding Market Price Benchmarks...');
    await MarketPrice.deleteMany({});
    const marketPricesData = [
      {
        productName: 'Kalamkari Saree Benchmark',
        category: 'Clothing',
        currentPrice: 2499,
        yesterdayPrice: 2450,
        weeklyChange: 2.0,
        monthlyChange: 4.5,
        priceTrend: [2300, 2350, 2400, 2450, 2499],
        seasonalPricing: [
          { season: 'Festive Season', multiplier: 1.2, avgPrice: 2800 },
          { season: 'Regular Season', multiplier: 1.0, avgPrice: 2300 }
        ]
      },
      {
        productName: 'Kondapalli Toys Benchmark',
        category: 'Handmade Crafts',
        currentPrice: 950,
        yesterdayPrice: 950,
        weeklyChange: 0.0,
        monthlyChange: 3.1,
        priceTrend: [900, 920, 930, 950, 950],
        seasonalPricing: [
          { season: 'Festive Season', multiplier: 1.15, avgPrice: 1100 }
        ]
      },
      {
        productName: 'Pickles & Spices Benchmark',
        category: 'Food',
        currentPrice: 350,
        yesterdayPrice: 340,
        weeklyChange: 2.9,
        monthlyChange: 5.0,
        priceTrend: [320, 330, 340, 345, 350],
        seasonalPricing: [
          { season: 'Summer Harvest', multiplier: 1.0, avgPrice: 320 }
        ]
      }
    ];
    await MarketPrice.insertMany(marketPricesData);
    console.log('   ✅ Seeded Market Price Intelligence Benchmarks.');

    // ----------------------------------------------------
    // 5. SEED ORDERS & PAYMENTS
    // ----------------------------------------------------
    console.log('\n🛒 5. Seeding Orders...');
    await Order.deleteMany({});

    const sampleOrder = await Order.create({
      customer: buyer1._id,
      products: [
        { product: insertedProducts[0]._id, quantity: 1, price: 2499 }
      ],
      totalAmount: 2499,
      paymentStatus: 'completed',
      orderStatus: 'Shipped',
      shipmentStatus: 'Shipped',
      trackingNumber: 'SAKHI-TRK-889021',
      shippingAddress: 'Lal Bazar, Downtown Srinagar, J&K - 190011',
      timeline: [
        { status: 'Confirmed', description: 'Order confirmed by Meera Handicrafts', timestamp: new Date(Date.now() - 86400000) },
        { status: 'Shipped', description: 'Handed over to Express Courier', timestamp: new Date() }
      ]
    });
    console.log(`   ✅ Seeded Order (ID: ${sampleOrder._id}).`);

    // ----------------------------------------------------
    // 6. SEED CONVERSATION & CHAT MESSAGES
    // ----------------------------------------------------
    console.log('\n💬 6. Seeding Real-Time Chat Conversation...');
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    const convo = await Conversation.create({
      participants: [buyer1._id, seller1._id],
      productId: insertedProducts[0]._id
    });

    const msg1 = await Message.create({
      conversationId: convo._id,
      sender: buyer1._id,
      recipient: seller1._id,
      text: 'Namaste! Is custom color border embroidery available for the Kalamkari Saree?',
      isRead: true
    });

    const msg2 = await Message.create({
      conversationId: convo._id,
      sender: seller1._id,
      recipient: buyer1._id,
      text: 'Namaste Priya ji! Yes, our female artisans can customize the border motifs and color shades according to your festive choice.',
      isRead: false
    });

    convo.lastMessage = msg2._id;
    await convo.save();

    console.log('   ✅ Seeded Chat Conversation & Messages.');

    console.log('\n=================================================');
    console.log('🎉 ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=================================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR seeding database:', error.message);
    process.exit(1);
  }
}

seedAllDatabaseData();
