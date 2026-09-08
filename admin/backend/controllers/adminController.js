const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../../../backend/models/Category');
const MarketPrice = require('../../../backend/models/MarketPrice');
const MarketTrend = require('../../../backend/models/MarketTrend');
const Notification = require('../../../backend/models/Notification');

const pageQuery = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const textFilter = (q, fields) => q ? { $or: fields.map((field) => ({ [field]: { $regex: q, $options: 'i' } })) } : {};

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
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
    const { page, limit, skip } = pageQuery(req.query);
    const filter = { role: { $ne: 'admin' }, ...textFilter(req.query.q, ['name', 'email', 'username']), ...(req.query.role ? { role: req.query.role } : {}), ...(req.query.status ? { status: req.query.status } : {}) };
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items: users, page, limit, total, pages: Math.ceil(total / limit) });
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
    const { page, limit, skip } = pageQuery(req.query);
    const filter = { ...textFilter(req.query.q, ['title', 'category', 'sku']), ...(req.query.status ? { status: req.query.status } : {}), ...(req.query.category ? { category: req.query.category } : {}) };
    const [products, total] = await Promise.all([
      Product.find(filter).populate('seller', 'name email username').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ items: products, page, limit, total, pages: Math.ceil(total / limit) });
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
    const { page, limit, skip } = pageQuery(req.query);
    const filter = req.query.status ? { orderStatus: req.query.status } : {};
    const [orders, total] = await Promise.all([Order.find(filter)
      .populate('customer', 'name email')
      .populate('products.product').sort({ createdAt: -1 }).skip(skip).limit(limit), Order.countDocuments(filter)]);
    res.json({ items: orders, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  const allowed = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
  if (!allowed.includes(req.body.orderStatus)) return res.status(400).json({ message: 'Invalid order status' });
  const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.orderStatus, shipmentStatus: req.body.orderStatus }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
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
    const returnsCount = await Order.countDocuments({ 'returnRequests.0': { $exists: true } });
    const refundsCount = await Order.countDocuments({ 'refundRequests.0': { $exists: true } });

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
        returnsCount,
        refundsCount,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => res.json(await Category.find().sort({ name: 1 }).lean());
const createCategory = async (req, res) => {
  const category = await Category.create({ name: String(req.body.name || '').trim(), subcategories: req.body.subcategories || [] });
  res.status(201).json(category);
};
const updateCategory = async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, { name: req.body.name, subcategories: req.body.subcategories || [] }, { new: true, runValidators: true }));
const deleteCategory = async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ message: 'Category deleted' }); };

const getReturns = async (req, res) => {
  const orders = await Order.find({ 'returnRequests.0': { $exists: true } }).populate('customer', 'name email').lean();
  const items = orders.flatMap((order) => (order.returnRequests || []).map((request, index) => ({ ...request, orderId: order._id, requestIndex: index, customer: order.customer, totalAmount: order.totalAmount })));
  res.json(items.filter((item) => !req.query.status || item.status === req.query.status));
};
const updateReturn = async (req, res) => {
  const index = Number(req.params.requestIndex);
  const status = req.body.status;
  if (!['Approved', 'Rejected', 'Completed'].includes(status) || !Number.isInteger(index)) return res.status(400).json({ message: 'Invalid return update' });
  const update = { [`returnRequests.${index}.status`]: status, [`returnRequests.${index}.processedAt`]: new Date(), [`returnRequests.${index}.processedBy`]: req.user._id, ...(req.body.rejectionReason ? { [`returnRequests.${index}.rejectionReason`]: req.body.rejectionReason } : {}) };
  const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: update }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

const getRefunds = async (req, res) => {
  const orders = await Order.find({ 'refundRequests.0': { $exists: true } }).populate('customer', 'name email').lean();
  const items = orders.flatMap((order) => (order.refundRequests || []).map((request, index) => ({ ...request, orderId: order._id, requestIndex: index, customer: order.customer })));
  res.json(items.filter((item) => !req.query.status || item.status === req.query.status));
};
const updateRefund = async (req, res) => {
  const index = Number(req.params.requestIndex);
  const status = req.body.status;
  if (!['Processing', 'Refunded', 'Failed'].includes(status) || !Number.isInteger(index)) return res.status(400).json({ message: 'Invalid refund update' });
  const update = { [`refundRequests.${index}.status`]: status, [`refundRequests.${index}.processedAt`]: new Date(), [`refundRequests.${index}.processedBy`]: req.user._id, ...(req.body.failureReason ? { [`refundRequests.${index}.failureReason`]: req.body.failureReason } : {}) };
  const order = await Order.findByIdAndUpdate(req.params.orderId, { $set: update }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

const getNotifications = async (req, res) => res.json(await Notification.find().populate('recipient', 'name email').sort({ createdAt: -1 }).limit(100).lean());
const getMarketData = async (req, res) => res.json({ prices: await MarketPrice.find().sort({ category: 1 }).lean(), trends: await MarketTrend.find().sort({ category: 1 }).lean() });
const updateMarketPrice = async (req, res) => {
  const allowed = ['source', 'context', 'region', 'unit'];
  const update = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, String(req.body[key]).trim()]));
  const price = await MarketPrice.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!price) return res.status(404).json({ message: 'Market price record not found' });
  res.json(price);
};
const getReport = async (req, res) => {
  const filter = {};
  if (req.query.from || req.query.to) filter.createdAt = { ...(req.query.from ? { $gte: new Date(req.query.from) } : {}), ...(req.query.to ? { $lte: new Date(`${req.query.to}T23:59:59.999Z`) } : {}) };
  const orders = await Order.find(filter).lean();
  res.json({ from: req.query.from || null, to: req.query.to || null, orders: orders.length, revenue: orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), daily: orders.reduce((result, order) => { const day = new Date(order.createdAt).toISOString().slice(0, 10); result[day] = (result[day] || 0) + Number(order.totalAmount || 0); return result; }, {}) });
};

module.exports = {
  loginAdmin,
  getUsers,
  updateUserStatus,
  deleteUser,
  getProducts,
  updateProductStatus,
  deleteProduct,
  getOrders,
  getAnalytics,
  updateOrderStatus,
  getCategories, createCategory, updateCategory, deleteCategory,
  getReturns, updateReturn, getRefunds, updateRefund,
  getNotifications, getMarketData, updateMarketPrice, getReport,
};
