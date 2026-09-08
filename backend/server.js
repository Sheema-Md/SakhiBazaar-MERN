const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// Diagnostics
console.log('=== STARTING DIAGNOSTIC ROUTE CHECKS ===');
try {
  const authController = require('./controllers/authController');
  const missing = ['registerUser', 'loginUser', 'getUserProfile', 'updateUserProfile', 'getUserPreferences', 'updateUserPreferences', 'forgotPassword', 'verifyOtp', 'resetPassword', 'googleLogin', 'getAllUsers', 'updateUserByAdmin', 'deleteUser'].filter(f => typeof authController[f] !== 'function');
  if (missing.length) console.log('❌ Missing functions in authController:', missing);
  else console.log('✅ authController exports OK');
} catch (e) { console.error('❌ Error loading authController:', e.stack); }

try {
  const productController = require('./controllers/productController');
  const missing = ['createProduct', 'getProducts', 'getProductById', 'updateProduct', 'deleteProduct', 'getMyProducts'].filter(f => typeof productController[f] !== 'function');
  if (missing.length) console.log('❌ Missing functions in productController:', missing);
  else console.log('✅ productController exports OK');
} catch (e) { console.error('❌ Error loading productController:', e.stack); }

try {
  const orderController = require('./controllers/orderController');
  const missing = ['createOrder', 'getOrderHistory', 'trackOrder', 'updateOrderStatus'].filter(f => typeof orderController[f] !== 'function');
  if (missing.length) console.log('❌ Missing functions in orderController:', missing);
  else console.log('✅ orderController exports OK');
} catch (e) { console.error('❌ Error loading orderController:', e.stack); }

try {
  const authMiddleware = require('./middleware/authMiddleware');
  const missing = ['protect', 'seller', 'admin'].filter(f => typeof authMiddleware[f] !== 'function');
  if (missing.length) console.log('❌ Missing functions in authMiddleware:', missing);
  else console.log('✅ authMiddleware exports OK');
} catch (e) { console.error('❌ Error loading authMiddleware:', e.stack); }
console.log('=== DIAGNOSTIC ROUTE CHECKS COMPLETE ===');


// Connect to Database
connectDB();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cartRoutes = require('./routes/cartRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const marketRoutes = require('./routes/marketRoutes');
const returnRefundRoutes = require('./routes/returnRefundRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Disable x-powered-by header and apply security response headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Configure CORS dynamically to support localhost development origins and enable credentials
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// Routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/return-refund', returnRefundRoutes);
// Duplicate mounting without /api prefix for complete client compatibility
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/ai', aiRoutes);
app.use('/chat', chatRoutes);
app.use('/orders', orderRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/notifications', notificationRoutes);
app.use('/cart', cartRoutes);
app.use('/bookmarks', bookmarkRoutes);
app.use('/shipments', shipmentRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/market', marketRoutes);

app.get('/', (req, res) => {
  res.send('Sakhi Bazaar API is running...');
});

// Production Cloud Deployment Health Monitor Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'healthy' : dbState === 2 ? 'connecting' : 'unhealthy';
  res.json({
    status: 'UP',
    service: 'Sakhi Bazaar Production Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Central Production Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

// Wrap express server in http
const server = http.createServer(app);

// Initialize Socket.io connection instance
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

