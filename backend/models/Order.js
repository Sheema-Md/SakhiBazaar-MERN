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
  subtotal: {
    type: Number,
  },
  gst: {
    type: Number,
  },
  shippingFee: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    default: '',
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Return Approved', 'Return Rejected', 'Refund Processing', 'Refunded'],
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
  stripePaymentIntentId: {
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
  returnRequests: [
    {
      status: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected', 'Completed'],
        default: 'Requested',
      },
      reason: {
        type: String,
        required: true,
      },
      defectImages: [
        {
          type: String,
        },
      ],
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      processedAt: {
        type: Date,
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      rejectionReason: {
        type: String,
        default: '',
      },
    },
  ],

  refundRequests: [
    {
      status: {
        type: String,
        enum: ['Requested', 'Processing', 'Refunded', 'Failed', 'Rejected'],
        default: 'Requested',
      },
      amount: {
        type: Number,
        default: 0,
      },
      method: {
        type: String,
        default: '',
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      processedAt: {
        type: Date,
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      failureReason: {
        type: String,
        default: '',
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define indexes for customer dashboard and seller fulfillment queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
