const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  refundPayment,
  createPaymentIntent,
  confirmStripePayment,
  getStripeConfig,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createPayment);
router.get('/', getPayments);
router.post('/refund', refundPayment);
router.post('/create-intent', createPaymentIntent);
router.post('/confirm', confirmStripePayment);
router.get('/config', getStripeConfig);

module.exports = router;

