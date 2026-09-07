const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Shipment = require('../models/Shipment');
const { calculateOrderPricing } = require('../utils/pricing');
const { getIo, getActiveUserSocketId } = require('../config/socket');

// Helper to push notification to a user
const createAndSendNotification = async (recipientId, text) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      text,
    });

    const socketId = getActiveUserSocketId(recipientId);
    if (socketId) {
      const io = getIo();
      io.to(socketId).emit('notification', notification);
    }
  } catch (err) {
    console.error('Error sending notification:', err.message);
  }
};

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    // 1. Normalize input array (accept either 'items' or 'products')
    const rawItems = req.body.items || req.body.products;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one product' });
    }

    // 2. Validate items and consolidate duplicate product IDs
    // Map productId string -> consolidated integer quantity
    const consolidatedMap = new Map();

    for (const raw of rawItems) {
      if (!raw || typeof raw !== 'object') {
        return res.status(400).json({ message: 'Invalid product item in order' });
      }

      // Extract ONLY product ID (client cannot control price, subtotal, total)
      let productId = raw.product || raw.productId;
      if (productId && typeof productId === 'object' && productId._id) {
        productId = productId._id;
      }

      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required for each item' });
      }

      const prodIdStr = productId.toString().trim();
      if (!mongoose.Types.ObjectId.isValid(prodIdStr)) {
        return res.status(400).json({ message: `Invalid product ID format: ${prodIdStr}` });
      }

      // Validate quantity: must be positive whole integer
      const qty = raw.quantity;
      if (
        qty === null ||
        qty === undefined ||
        typeof qty !== 'number' ||
        !Number.isFinite(qty) ||
        !Number.isInteger(qty) ||
        qty < 1
      ) {
        return res.status(400).json({ message: `Quantity must be a positive whole integer (>= 1), received: ${qty}` });
      }

      const currentQty = consolidatedMap.get(prodIdStr) || 0;
      consolidatedMap.set(prodIdStr, currentQty + qty);
    }

    if (consolidatedMap.size === 0) {
      return res.status(400).json({ message: 'Order must contain at least one valid product' });
    }

    // 3. Fetch authoritative Product records from DB and validate existence, status, and stock
    const validatedItems = [];

    for (const [prodIdStr, quantity] of consolidatedMap.entries()) {
      const prod = await Product.findById(prodIdStr);
      if (!prod) {
        return res.status(404).json({ message: `Product ${prodIdStr} not found` });
      }

      if (prod.status && prod.status !== 'active') {
        return res.status(400).json({ message: `Product "${prod.title}" is currently unavailable` });
      }

      if (prod.stockQuantity < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${prod.title}". Requested: ${quantity}, Available: ${prod.stockQuantity}`
        });
      }

      validatedItems.push({
        productDoc: prod,
        quantity,
      });
    }

    // 4. Authoritative Pricing Calculation via centralized helper
    const pricingResult = calculateOrderPricing(validatedItems);
    const { orderItems, subtotal, gst, shippingFee, totalAmount } = pricingResult;

    // 5. Deduct inventory (preserving existing non-atomic logic per phase scope)
    for (const item of validatedItems) {
      const prod = item.productDoc;
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);

      if (prod.stockQuantity === 0) {
        prod.stockStatus = 'Out of Stock';
      } else if (prod.stockQuantity <= 5) {
        prod.stockStatus = 'Low Stock';
      } else {
        prod.stockStatus = 'In Stock';
      }

      await prod.save();

      // Notify seller about new purchase
      await createAndSendNotification(
        prod.seller,
        `New order placed for "${prod.title}"! Quantity: ${item.quantity}.`
      );
    }

    // 6. Create Order with authoritative server-computed amounts (ignoring any client-provided financial fields)
    const { shippingAddress } = req.body;
    const order = await Order.create({
      customer: req.user._id,
      products: orderItems,
      subtotal,
      gst,
      shippingFee,
      totalAmount,
      shippingAddress: typeof shippingAddress === 'string' && shippingAddress.trim() ? shippingAddress.trim() : 'Address on file',
      paymentStatus: 'pending',
      orderStatus: 'Pending',
      trackingNumber: `TRK_${Date.now()}`
    });

    // Create corresponding Shipment
    await Shipment.create({
      order: order._id,
      trackingNumber: order.trackingNumber,
      status: 'Pending',
      timeline: [
        {
          status: 'Pending',
          description: 'Order placed successfully. Awaiting processing.',
          timestamp: new Date()
        }
      ]
    });

    // Notify customer of order placement
    await createAndSendNotification(
      req.user._id,
      `Your order #${order._id} has been placed successfully!`
    );

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order history based on user role
// @route   GET /api/orders/history
// @access  Private
const getOrderHistory = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('customer', 'name email')
        .populate('products.product');
    } else if (req.user.role === 'seller') {
      // Find products listed by this seller
      const sellerProducts = await Product.find({ seller: req.user._id });
      const productIds = sellerProducts.map(p => p._id.toString());

      // Fetch all orders
      const allOrders = await Order.find()
        .populate('customer', 'name email')
        .populate('products.product');

      // Filter orders that contain at least one product of this seller
      orders = allOrders.filter(order =>
        order.products.some(item =>
          item.product && productIds.includes(item.product._id.toString())
        )
      );
    } else {
      // Customer
      orders = await Order.find({ customer: req.user._id })
        .populate('customer', 'name email')
        .populate('products.product');
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order details / track shipment
// @route   GET /api/orders/track/:id
// @access  Private
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('products.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role verification: check if customer, seller of product, or admin
    const isAdmin = req.user.role === 'admin';
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    
    let isSeller = false;
    if (req.user.role === 'seller') {
      isSeller = order.products.some(item => 
        item.product && item.product.seller.toString() === req.user._id.toString()
      );
    }

    if (!isAdmin && !isCustomer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/status/:id
// @access  Private (Approved Seller with product in order, or Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const matchedStatus = validStatuses.find(s => s.toLowerCase() === status.trim().toLowerCase());
    if (!matchedStatus) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Role check: Seller or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Not authorized to modify order status' });
    }

    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // RESOURCE OWNERSHIP: seller must have at least one product in this order
    if (req.user.role === 'seller') {
      if (req.user.status !== 'approved') {
        return res.status(403).json({ message: 'Access denied. Seller account vetting is pending or suspended.' });
      }
      const sellerId = req.user._id.toString();
      const sellerOwnsItem = order.products.some(
        item => item.product && item.product.seller && item.product.seller.toString() === sellerId
      );
      if (!sellerOwnsItem) {
        return res.status(403).json({ message: 'Not authorized to modify this order status — no products from your store in this order' });
      }
    }

    order.orderStatus = matchedStatus;
    order.shipmentStatus = matchedStatus;
    
    const eventDescription = description || `Order status updated to ${matchedStatus}`;
    
    // Add timeline checkpoint
    order.timeline.push({
      status: matchedStatus,
      description: eventDescription,
      timestamp: new Date()
    });
    
    await order.save();

    // Update Shipment document
    let shipment = await Shipment.findOne({ order: order._id });
    if (!shipment) {
      shipment = new Shipment({
        order: order._id,
        trackingNumber: order.trackingNumber || `TRK_${Date.now()}`,
        status: matchedStatus,
        timeline: []
      });
    }
    shipment.status = matchedStatus;
    shipment.timeline.push({
      status: matchedStatus,
      description: eventDescription,
      timestamp: new Date()
    });
    await shipment.save();

    // Notify customer about the order status change
    await createAndSendNotification(
      order.customer,
      `Your order #${order._id} status has been updated to "${matchedStatus}".`
    );

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  trackOrder,
  updateOrderStatus,
};
