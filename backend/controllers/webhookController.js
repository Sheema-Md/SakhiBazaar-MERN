const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { getIo, getActiveUserSocketId } = require('../config/socket');

// @desc    Real-time Stripe webhook listener
// @route   POST /api/webhooks/stripe
// @access  Public (Signature Verified)
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Parse raw body in dev mode
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Process event type
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      console.log(`✅ Real-time Stripe Webhook: PaymentIntent Succeeded (${paymentIntent.id})`);
      
      const orderId = paymentIntent.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'completed') {
          order.paymentStatus = 'completed';
          order.orderStatus = 'Confirmed';
          order.timeline.push({
            status: 'Confirmed',
            description: 'Webhook confirmed payment via Stripe.',
            timestamp: new Date()
          });
          await order.save();
        }
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.log(`❌ Real-time Stripe Webhook: PaymentIntent Failed (${paymentIntent.id})`);
      break;
    }
    default:
      console.log(`ℹ️ Stripe Webhook: Received event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };
