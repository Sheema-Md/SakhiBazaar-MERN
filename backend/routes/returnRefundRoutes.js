const express = require('express');

const router = express.Router();

const {
    getReturnRefundStatus,
    requestReturn,
    approveReturn,
    rejectReturn,
    requestRefund,
    processRefund,
    completeRefund,
    failRefund,
} = require('../controllers/returnRefundController');

const {
    protect,
} = require('../middleware/authMiddleware');

router.use(protect);
const upload = require('../middleware/uploadMiddleware');
// Customer
router.get('/:id', getReturnRefundStatus);

router.post('/:id/refund', requestRefund);
router.post(
    '/:id/return',
    upload.array('defectImages', 5),
    requestReturn
);

// Seller/Admin
router.put(
    '/:id/return/:requestNumber/approve',
    approveReturn
);

router.put(
    '/:id/return/:requestNumber/reject',
    rejectReturn
);

router.put(
    '/:id/refund/:requestNumber/process',
    processRefund
);

router.put(
    '/:id/refund/:requestNumber/complete',
    completeRefund
);

router.put(
    '/:id/refund/:requestNumber/fail',
    failRefund
);

module.exports = router;