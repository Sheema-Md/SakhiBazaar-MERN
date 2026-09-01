const express = require('express');
const router = express.Router();
const { handleStripeWebhook } = require('../controllers/webhookController');

// Note: Stripe webhooks require express.raw() body parsing
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
