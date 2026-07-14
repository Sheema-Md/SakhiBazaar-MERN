const mongoose = require('mongoose');
const User = require('../models/User');

const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Seeding default administrator in main backend...');
      await User.create({
        name: 'Sakhi Bazaar Admin',
        username: 'admin',
        email: 'admin@sakhibazaar.com',
        password: 'Admin@Password123',
        phoneNumber: '9999999999',
        aadhaarNumber: '999999999999',
        role: 'admin',
        status: 'approved'
      });
      console.log('✅ Default admin seeded successfully: admin@sakhibazaar.com / Admin@Password123');
    } else {
      console.log(`Admin user already exists in database: Email="${adminExists.email}", Username="${adminExists.username}". Verifying credentials...`);
      
      let needsSave = false;
      if (adminExists.email !== 'admin@sakhibazaar.com') {
        console.log(`Updating admin email from "${adminExists.email}" to "admin@sakhibazaar.com"`);
        adminExists.email = 'admin@sakhibazaar.com';
        needsSave = true;
      }
      if (adminExists.username !== 'admin') {
        console.log(`Updating admin username from "${adminExists.username}" to "admin"`);
        adminExists.username = 'admin';
        needsSave = true;
      }

      const isMatch = await adminExists.matchPassword('Admin@Password123');
      if (!isMatch) {
        console.log('Admin password hash is invalid/corrupted. Resetting to default...');
        adminExists.password = 'Admin@Password123';
        needsSave = true;
      }

      if (needsSave) {
        await adminExists.save();
        console.log('✅ Admin credentials updated and saved successfully.');
      } else {
        console.log('✅ Admin credentials and password are valid.');
      }
    }
  } catch (error) {
    console.error('❌ Error seeding default admin in main backend:', error.message);
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
