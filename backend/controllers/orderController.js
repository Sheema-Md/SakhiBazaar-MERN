const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const Shipment = require('../models/Shipment');
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
    const { products, totalAmount, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }

    // Create the order
    const orderItems = [];
    for (const item of products) {
      const prod = await Product.findById(item.product);
      if (!prod) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      // Deduct inventory
      prod.stockQuantity = Math.max(0, prod.stockQuantity - item.quantity);
      
      // Update stock status based on quantity
      if (prod.stockQuantity === 0) {
        prod.stockStatus = 'Out of Stock';
      } else if (prod.stockQuantity <= 5) {
        prod.stockStatus = 'Low Stock';
      } else {
        prod.stockStatus = 'In Stock';
      }
      
      await prod.save();

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        price: prod.price,
      });

      // Notify seller about new purchase
      await createAndSendNotification(
        prod.seller,
        `New order placed for "${prod.title}"! Quantity: ${item.quantity}.`
      );
    }

    const orderId = `sb_${Math.floor(Math.random() * 1000000000).toString(36).toUpperCase()}`;

    const order = await Order.create({
      customer: req.user._id,
      products: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || 'Address on file',
      paymentStatus: 'pending', // Initial state is pending until paid via Stripe
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
// @access  Private
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

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Role check: Seller or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Not authorized to modify order status' });
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
