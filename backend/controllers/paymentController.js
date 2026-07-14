const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { getIo, getActiveUserSocketId } = require('../config/socket');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

// @desc    Process a mock checkout payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId || !amount || !paymentMethod) {
      return res.status(400).json({ message: 'Order ID, amount, and payment method are required' });
    }

    const validMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isCod = paymentMethod === 'Cash on Delivery';
    const status = isCod ? 'pending' : 'completed';
    const finalOrderStatus = isCod ? 'Processing' : 'Confirmed';

    // Generate custom transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      order: orderId,
      amount: Number(amount),
      paymentMethod,
      paymentStatus: status,
      transactionId,
    });

    // Update order status
    order.paymentStatus = status;
    order.orderStatus = finalOrderStatus;
    if (!order.trackingNumber) {
      order.trackingNumber = `TRK_${Date.now()}`;
    }

    // Add timeline checkpoint
    order.timeline.push({
      status: finalOrderStatus,
      description: isCod 
        ? 'Order placed successfully via Cash on Delivery. Seller is packing items.' 
        : 'Payment received successfully. Order confirmed.',
      timestamp: new Date()
    });

    await order.save();

    // Trigger Notification for customer
    const customerMsg = isCod 
      ? `Your order #${order._id} has been placed successfully via Cash on Delivery!`
      : `Payment of ₹${amount} successful! Your order #${order._id} has been confirmed.`;
    await createAndSendNotification(req.user._id, customerMsg);

    // Trigger Notification for each product's seller
    for (const item of order.products) {
      if (item.product && item.product.seller) {
        await createAndSendNotification(
          item.product.seller,
          `Sale Confirmed! Your product "${item.product.title}" has been ordered in order #${order._id}.`
        );
      }
    }

    res.status(201).json({ payment, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payments (Transaction history)
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    let payments;

    if (req.user.role === 'admin') {
      payments = await Payment.find()
        .populate('user', 'name email username')
        .populate({
          path: 'order',
          populate: { path: 'products.product' }
        })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'seller') {
      // Find payments for orders containing this seller's products
      const sellerProducts = await Product.find({ seller: req.user._id });
      const productIds = sellerProducts.map(p => p._id.toString());

      // Fetch all payments and populate orders
      const allPayments = await Payment.find()
        .populate('user', 'name email username')
        .populate({
          path: 'order',
          populate: { path: 'products.product' }
        })
        .sort({ createdAt: -1 });

      // Filter payments where the order contains at least one of the seller's products
      payments = allPayments.filter(pay => 
        pay.order && pay.order.products.some(item => 
          item.product && productIds.includes(item.product._id.toString())
        )
      );
    } else {
      // Customer
      payments = await Payment.find({ user: req.user._id })
        .populate({
          path: 'order',
          populate: { path: 'products.product' }
        })
        .sort({ createdAt: -1 });
    }

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process a mock payment refund
// @route   POST /api/payments/refund
// @access  Private (Admin/Seller only)
const refundPayment = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: 'Payment ID is required' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return res.status(404).json({ message: 'Associated order not found' });
    }

    // Role check: Seller of the order products or Admin
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Not authorized to issue refunds' });
    }

    payment.paymentStatus = 'refunded';
    payment.refundReason = reason || 'Customer request / Refund initiated';
    await payment.save();

    // Cancel order
    order.paymentStatus = 'failed';
    order.orderStatus = 'Cancelled';
    order.timeline.push({
      status: 'Cancelled',
      description: `Payment refunded: ${payment.refundReason}`,
      timestamp: new Date()
    });
    await order.save();

    // Notify customer
    await createAndSendNotification(
      order.customer,
      `Your payment of ₹${payment.amount} for order #${order._id} has been refunded. Reason: ${payment.refundReason}`
    );

    res.json({ success: true, payment, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a Stripe PaymentIntent for an order
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Stripe expects amount in cents/paise (integer)
    const amountInSubunits = Math.round(order.totalAmount * 100);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSubunits,
      currency: 'inr', // default to INR for Sakhi Bazaar
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm and finalize a Stripe payment in the DB
// @route   POST /api/payments/confirm
// @access  Private
const confirmStripePayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    if (!orderId || !paymentIntentId) {
      return res.status(400).json({ message: 'Order ID and PaymentIntent ID are required' });
    }

    // Retrieve the PaymentIntent details from Stripe to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: `Payment failed or incomplete. Status: ${paymentIntent.status}` 
      });
    }

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if payment was already recorded
    const existingPayment = await Payment.findOne({ transactionId: paymentIntentId });
    if (existingPayment) {
      return res.json({ payment: existingPayment, order });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      order: orderId,
      amount: order.totalAmount,
      paymentMethod: 'Credit Card (Stripe)',
      paymentStatus: 'completed',
      transactionId: paymentIntentId,
    });

    // Update order status
    order.paymentStatus = 'completed';
    order.orderStatus = 'Confirmed';
    order.timeline.push({
      status: 'Confirmed',
      description: 'Stripe card payment successful. Order confirmed.',
      timestamp: new Date()
    });

    await order.save();

    // Trigger Notification for customer
    await createAndSendNotification(
      req.user._id,
      `Payment of ₹${order.totalAmount} successful! Your order #${order._id} has been confirmed.`
    );

    // Trigger Notification for each product's seller
    for (const item of order.products) {
      if (item.product && item.product.seller) {
        await createAndSendNotification(
          item.product.seller,
          `Sale Confirmed! Your product "${item.product.title}" has been ordered in order #${order._id}.`
        );
      }
    }

    res.status(201).json({ payment, order });
  } catch (error) {
    console.error('Stripe Confirmation Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  refundPayment,
  createPaymentIntent,
  confirmStripePayment,
};

