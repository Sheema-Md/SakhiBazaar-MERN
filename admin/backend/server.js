const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGO_URI and JWT_SECRET must be configured before starting the admin backend');
}

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Mount routers
app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Sakhi Bazaar Standalone Admin API is running...');
});

const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const { INITIAL_ADMIN_EMAIL: email, INITIAL_ADMIN_PASSWORD: password, INITIAL_ADMIN_NAME: name,
        INITIAL_ADMIN_USERNAME: username, INITIAL_ADMIN_PHONE: phoneNumber,
        INITIAL_ADMIN_AADHAAR: aadhaarNumber } = process.env;
      if (!email || !password || !name || !username || !phoneNumber || !aadhaarNumber) {
        throw new Error('All INITIAL_ADMIN_* variables are required when seeding the first admin');
      }

      console.log(`No administrator found. Seeding initial administrator (${email})...`);
      await User.create({
        name,
        username,
        email,
        password,
        phoneNumber,
        aadhaarNumber,
        role: 'admin',
        status: 'approved'
      });
      console.log('✅ Initial administrator seeded successfully.');
    } else {
      console.log('✅ Administrator account found in database. Preserving existing credentials.');
    }
  } catch (error) {
    console.error('❌ Error in administrator seeding check:', error.message);
  }
};

// Database connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Admin backend connected to MongoDB database successfully.');
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Admin Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Admin MongoDB connection error:', err.message);
    process.exit(1);
  });
