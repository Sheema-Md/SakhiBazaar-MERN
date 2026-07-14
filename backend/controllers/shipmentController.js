const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
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

// @desc    Get all shipments / orders for tracking based on role
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('customer', 'name email username phone address')
        .populate('products.product');
    } else if (req.user.role === 'seller') {
      const sellerProducts = await Product.find({ seller: req.user._id });
      const productIds = sellerProducts.map(p => p._id.toString());

      const allOrders = await Order.find()
        .populate('customer', 'name email username phone address')
        .populate('products.product');

      orders = allOrders.filter(order =>
        order.products.some(item =>
          item.product && productIds.includes(item.product._id.toString())
        )
      );
    } else {
      // Customer
      orders = await Order.find({ customer: req.user._id })
        .populate('customer', 'name email username phone address')
        .populate('products.product');
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update shipment status and tracking details
// @route   PUT /api/shipments/:id (id is orderId)
// @access  Private (Seller/Admin only)
const updateShipment = async (req, res) => {
  try {
    const { status, trackingNumber, timelineEvent, timelineDescription } = req.body;
    const orderId = req.params.id;

    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update shipments' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'];
      const matchedStatus = validStatuses.find(s => s.toLowerCase() === status.trim().toLowerCase());
      if (matchedStatus) {
        order.shipmentStatus = matchedStatus;
        order.orderStatus = matchedStatus;

        // Push event to timeline automatically on status change
        order.timeline.push({
          status: matchedStatus,
          description: timelineDescription || `Shipment status updated to ${matchedStatus}`,
          timestamp: new Date()
        });

        // Send alert
        await createAndSendNotification(
          order.customer,
          `Your shipment for order #${order._id} is now ${matchedStatus}!`
        );
      }
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    if (timelineEvent) {
      order.timeline.push({
        status: timelineEvent,
        description: timelineDescription || '',
        timestamp: new Date()
      });
    }

    await order.save();
    const updatedOrder = await Order.findById(orderId)
      .populate('customer', 'name email username phone address')
      .populate('products.product');

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getShipments,
  updateShipment,
};
