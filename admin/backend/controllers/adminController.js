const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sakhibazaar_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin
// @route   POST /api/admin/auth/register
// @access  Public
const registerAdmin = async (req, res) => {
  try {
    const { name, username, email, password, phoneNumber, aadhaarNumber } = req.body;

    if (!name || !username || !email || !password || !phoneNumber || !aadhaarNumber) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const emailExists = await User.findOne({ email });
    const usernameExists = await User.findOne({ username });
    if (emailExists || usernameExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const admin = await User.create({
      name,
      username,
      email,
      password,
      phoneNumber,
      aadhaarNumber,
      role: 'admin',
      status: 'approved'
    });

    res.status(201).json({
      _id: admin._id,
      name: admin.name,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const trimmedIdentifier = emailOrUsername.trim();
    console.log('Admin login attempt identifier:', trimmedIdentifier);

    // Support email or username login
    const admin = await User.findOne({
      $or: [
        { email: trimmedIdentifier.toLowerCase() },
        { username: trimmedIdentifier.toLowerCase() }
      ]
    });

    if (!admin) {
      console.log(`Admin login failed: User not found for identifier "${trimmedIdentifier}"`);
    } else {
      const match = await admin.matchPassword(password);
      console.log(`Admin login user found: "${admin.email}" (Role: ${admin.role}). Password match:`, match);
    }

    if (admin && admin.role === 'admin' && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (customers and sellers)
// @route   GET /api/admin/users
// @access  Private (Admin Only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status (Approve/Suspend)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin Only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    await user.save();
    res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User account removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products
// @route   GET /api/admin/products
// @access  Private (Admin Only)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email username');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product status (Active/Flagged)
// @route   PUT /api/admin/products/:id/status
// @access  Private (Admin Only)
const updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = status;
    await product.save();
    res.json({ message: `Product status updated to ${status}`, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private (Admin Only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin Only)
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('products.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard metrics & financials
// @route   GET /api/admin/analytics
// @access  Private (Admin Only)
const getAnalytics = async (req, res) => {
  try {
    const usersCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const sellersCount = await User.countDocuments({ role: 'seller' });
    const customersCount = await User.countDocuments({ role: 'customer' });
    
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();

    const orders = await Order.find();
    const grossSalesVolume = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const platformCommission = grossSalesVolume * 0.1; // 10% Platform fees

    res.json({
      metrics: {
        usersCount,
        sellersCount,
        customersCount,
        productsCount,
        ordersCount,
        grossSalesVolume,
        platformCommission,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getUsers,
  updateUserStatus,
  deleteUser,
  getProducts,
  updateProductStatus,
  deleteProduct,
  getOrders,
  getAnalytics,
};
