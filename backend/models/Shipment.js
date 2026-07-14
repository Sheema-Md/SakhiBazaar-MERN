const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  trackingNumber: {
    type: String,
    default: '',
  },
  carrier: {
    type: String,
    default: 'Sakhi Courier',
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  timeline: [
    {
      status: { type: String, required: true },
      description: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

shipmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
