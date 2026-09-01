const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

async function restoreAccount() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    const email = 'khushi@example.com';
    let user = await User.findOne({ email });

    if (user) {
      user.role = 'seller';
      user.status = 'approved';
      user.password = 'Password123!';
      await user.save();
      console.log(`✅ Existing user "${email}" updated to Seller (Approved) with password: Password123!`);
    } else {
      user = await User.create({
        name: 'Khushi',
        email,
        password: 'Password123!',
        role: 'seller',
        status: 'approved',
        storeName: 'Khushi Creations',
        isVerified: true
      });
      console.log(`✅ User account "${email}" successfully created as Seller (Approved) with password: Password123!`);
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error restoring account:', err.message);
    process.exit(1);
  }
}

restoreAccount();
