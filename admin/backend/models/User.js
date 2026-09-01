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
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
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
      validator: function(v) {
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
      validator: function(v) {
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
  avatar: {
    type: String,
    default: '',
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
