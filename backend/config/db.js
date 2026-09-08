const mongoose = require('mongoose');
const User = require('../models/User');

const requiredEnv = (name) => {
  const value = process.env[name];
  if (!value || value.includes('your_')) {
    throw new Error(`${name} must be configured before starting the backend`);
  }
  return value;
};

const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const email = requiredEnv('INITIAL_ADMIN_EMAIL');
      const password = requiredEnv('INITIAL_ADMIN_PASSWORD');
      const name = requiredEnv('INITIAL_ADMIN_NAME');
      const username = requiredEnv('INITIAL_ADMIN_USERNAME');
      const phoneNumber = requiredEnv('INITIAL_ADMIN_PHONE');
      const aadhaarNumber = requiredEnv('INITIAL_ADMIN_AADHAAR');

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
    const conn = await mongoose.connect(requiredEnv('MONGO_URI'));
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedDefaultAdmin();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
