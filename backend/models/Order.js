const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  shipmentStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  timeline: [
    {
      status: { type: String, required: true },
      description: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  shippingAddress: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define indexes for customer dashboard and seller fulfillment queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
