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
  shippingAddress: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  shipmentStatus: {
    type: String,
    default: 'Pending',
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  timeline: [
    {
      status: { type: String, default: '' },
      description: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  returnRequests: [{
    requestNumber: { type: Number, default: 1 },
    status: { type: String, default: 'Requested' },
    reason: { type: String, default: '' },
    defectImages: { type: [String], default: [] },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, default: '' },
  }],
  refundRequests: [{
    requestNumber: { type: Number, default: 1 },
    status: { type: String, default: 'Requested' },
    amount: { type: Number, default: 0 },
    method: { type: String, default: '' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    failureReason: { type: String, default: '' },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
