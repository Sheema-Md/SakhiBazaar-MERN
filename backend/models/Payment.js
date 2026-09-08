const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add a payment amount'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please add a payment method'],
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Stripe Payment', 'Cash on Delivery'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    default: '',
  },
  refundReason: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
