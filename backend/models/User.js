const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    validate: {
      validator: function (v) {
        // General check for bcrypt hashes (starts with $2 and is 60 chars long)
        if (v.startsWith('$2') && v.length === 60) return true;
        // Strong password regex: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. @$!%*?&#).',
    },
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'suspended'],
    default: 'approved',
  },
  phone: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits',
    },
  },
  aadhaarNumber: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    validate: {
      validator: function (v) {
        if (!v) return true;
        return /^\d{12}$/.test(v);
      },
      message: 'Aadhaar number must be exactly 12 digits',
    },
  },
  address: {
    type: String,
    default: '',
  },
  savedAddresses: {
    type: [{
      label: { type: String, default: 'Home', trim: true },
      name: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      zip: { type: String, required: true, trim: true },
      country: { type: String, default: 'India', trim: true },
      isDefault: { type: Boolean, default: false },
    }],
    default: [],
  },
  avatar: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en',
  },
  themePreference: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
