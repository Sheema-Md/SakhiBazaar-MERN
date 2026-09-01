const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const User = require('./models/User');

const sampleProducts = [
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
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80'
    ],
    description: 'Immerse yourself in the timeless heritage of Andhra artistry with our handcrafted Kalamkari Cotton Saree. Lovingly hand-block printed by female artisans using 100% organic vegetable dyes, each motif weaves a story of cultural elegance and sustainable fashion.',
    marketingCaption: '✨ Grace meets tradition! Elevate your festive wardrobe with our handcrafted Kalamkari Cotton Saree, created with love by artisan sisters. #SakhiBazaar #Kalamkari #Handmade #WomenEntrepreneurs',
    tags: ['Kalamkari', 'Cotton Saree', 'Handmade', 'Organic Dyes', 'Traditional Wear'],
    deliveryLocations: [
      { state: 'Delhi', district: 'New Delhi', city: 'Connaught Place' },
      { state: 'Jammu & Kashmir', district: 'Srinagar', city: 'Lal Bazar' }
    ]
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
    description: 'Hand-embroidered Lucknowi Chikankari Kurti on breathable pure cotton fabric. Perfect for casual summer outings or formal office wear.',
    marketingCaption: '🌸 Soft, elegant, and timeless. Add handcrafted Chikankari embroidery to your daily wardrobe! #Chikankari #SummerFashion #SakhiBazaar',
    tags: ['Chikankari', 'Cotton Kurti', 'Hand Embroidered', 'Summer Collection']
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
    description: 'GI-tagged Kondapalli dancing doll handcrafted from lightweight softwood and painted with non-toxic natural oil colors by rural women artisans.',
    marketingCaption: '🪆 Bring home authentic Indian folk art with our Kondapalli Dancing Doll! Hand-carved with love. #Kondapalli #GIHeritage #FolkArt',
    tags: ['Kondapalli', 'Wooden Toy', 'GI Tagged', 'Folk Art', 'Handmade']
  },
  {
    title: 'Hand-Painted Terracotta Flower Vase',
    category: 'Handmade Crafts',
    subcategory: 'Pottery',
    price: 850,
    offerPercentage: 10,
    stockStatus: 'In Stock',
    stockQuantity: 20,
    sku: 'SAKHI-CFT-002',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80'],
    description: 'Eco-friendly natural clay terracotta vase featuring hand-painted Warli folk art patterns. Ideal for living room centerpieces.',
    marketingCaption: '🏺 Earthy charm for your home! Hand-turned clay vase with traditional Warli art motifs. #Terracotta #Pottery #EcoHome',
    tags: ['Terracotta', 'Pottery', 'Warli Art', 'Eco Friendly', 'Home Decor']
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
    description: 'Traditional home-recipe spicy mango pickle made with raw Guntur red chilies, cold-pressed sesame oil, and freshly ground spices. No artificial preservatives.',
    marketingCaption: '🌶️ Taste the spicy warmth of home! Homemade Avakaya pickle prepared using grandmother’s recipe. #OrganicPickle #Avakaya #HomemadeLove',
    tags: ['Pickle', 'Avakaya', 'Spicy', 'Homemade', 'Organic']
  },
  {
    title: 'Pure Wild Forest Organic Honey (500ml)',
    category: 'Food',
    subcategory: 'Organic Honey',
    price: 550,
    offerPercentage: 0,
    stockStatus: 'In Stock',
    stockQuantity: 35,
    sku: 'SAKHI-FOD-002',
    imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=800&q=80'],
    description: '100% raw, unheated, unfiltered organic wild forest honey harvested by tribal women collectives. Rich in antioxidants and natural enzymes.',
    marketingCaption: '🍯 Pure sweetness straight from wild forest blooms. Raw, unfiltered, and rich in natural nutrients! #OrganicHoney #RawHoney #HealthFirst',
    tags: ['Organic Honey', 'Raw Honey', 'Wild Forest', 'Healthy']
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
    description: 'Exquisite hand-molded terracotta necklace with matching jhumka earrings. Painted with gold and maroon acrylic colors for festive occasions.',
    marketingCaption: '👑 Make a unique style statement with handcrafted terracotta temple jewelry! Lightweight and eco-chic. #TerracottaJewelry #EthnicGlam #SakhiBazaar',
    tags: ['Terracotta Jewelry', 'Temple Jewelry', 'Jhumkas', 'Handmade Necklace']
  },
  {
    title: 'Hand-Embroidered Mirror Work Wall Hanging',
    category: 'Home Decor',
    subcategory: 'Wall Hangings',
    price: 1250,
    offerPercentage: 10,
    stockStatus: 'In Stock',
    stockQuantity: 15,
    sku: 'SAKHI-DEC-001',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80'],
    description: 'Vibrant Kutchi mirror work tapestry handcrafted on thick cotton duck fabric with tassel borders. Adds colorful bohemian warmth to any interior wall.',
    marketingCaption: '✨ Brighten your living room with authentic Kutchi mirror work tapestries! Hand-stitched with vibrant threads. #BohoDecor #WallHanging #MirrorWork',
    tags: ['Wall Hanging', 'Mirror Work', 'Kutchi Craft', 'Home Decor', 'Boho']
  }
];

async function seedProducts() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/sakhibazaar';
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully!');

    // Find or create a seller user
    let seller = await User.findOne({ role: 'seller' });
    if (!seller) {
      console.log('No seller found. Creating a default seller account...');
      seller = await User.create({
        name: 'Meera Handicrafts',
        email: 'meera.seller@sakhibazaar.org',
        password: 'password123',
        role: 'seller',
        storeName: 'Meera Artisan Studio',
        isVerified: true
      });
      console.log(`Default seller created: ${seller._id}`);
    }

    console.log('Clearing existing sample products...');
    await Product.deleteMany({ seller: seller._id });

    const productsToInsert = sampleProducts.map(p => ({
      ...p,
      seller: seller._id
    }));

    const inserted = await Product.insertMany(productsToInsert);
    console.log(`\n🎉 SUCCESS: Successfully seeded ${inserted.length} sample products for Sakhi Bazaar!`);
    
    console.log('\n--- Seeded Products Summary ---');
    inserted.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.category}] ${p.title} - ₹${p.price}`);
    });

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR seeding products:', error.message);
    process.exit(1);
  }
}

seedProducts();
