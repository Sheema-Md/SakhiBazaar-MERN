const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const adminRoutes = require('./routes/adminRoutes');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
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
      const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@sakhibazaar.com';
      const password = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Password123';
      const name = process.env.INITIAL_ADMIN_NAME || 'Sakhi Bazaar Admin';
      const username = process.env.INITIAL_ADMIN_USERNAME || 'admin';
      const phoneNumber = process.env.INITIAL_ADMIN_PHONE || '9999999999';
      const aadhaarNumber = process.env.INITIAL_ADMIN_AADHAAR || '999999999999';

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
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/sakhibazaar';
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
  });
