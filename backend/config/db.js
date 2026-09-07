const mongoose = require('mongoose');
const User = require('../models/User');

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

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
