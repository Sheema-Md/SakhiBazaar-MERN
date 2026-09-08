const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { getIo, getActiveUserSocketId } = require('../config/socket');

const MAX_REQUESTS = 2;

// ---------------------------------------------------------
// Notification helper
// ---------------------------------------------------------

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
    } catch (error) {
        console.error('Notification error:', error.message);
    }
};

// ---------------------------------------------------------
// Authorization helper
// ---------------------------------------------------------

const sellerOwnsOrderProduct = (order, sellerId) => {
    return order.products.some(
        item =>
            item.product &&
            item.product.seller &&
            item.product.seller.toString() === sellerId.toString()
    );
};

const canManageOrder = async (req, order) => {
    if (req.user.role === 'admin') {
        return true;
    }

    if (req.user.role !== 'seller') {
        return false;
    }

    if (req.user.status !== 'approved') {
        return false;
    }

    return sellerOwnsOrderProduct(order, req.user._id);
};

// ---------------------------------------------------------
// GET return/refund information
// ---------------------------------------------------------
// GET /api/return-refund/:id
// ---------------------------------------------------------

const getReturnRefundStatus = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id,
        }).populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        res.json({
            orderId: order._id,
            orderStatus: order.orderStatus,

            returnEligible: order.orderStatus === 'Delivered',

            returnRequests: order.returnRequests || [],
            refundRequests: order.refundRequests || [],

            returnRequestCount: (order.returnRequests || []).length,
            refundRequestCount: (order.refundRequests || []).length,

            remainingReturnRequests:
                MAX_REQUESTS - (order.returnRequests || []).length,

            remainingRefundRequests:
                MAX_REQUESTS - (order.refundRequests || []).length,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// CUSTOMER: REQUEST RETURN
// ---------------------------------------------------------
// POST /api/return-refund/:id/return
// ---------------------------------------------------------

const requestReturn = async (req, res) => {
    try {
        const {
            reason,
            images = [],
        } = req.body;

        if (!reason || !String(reason).trim()) {
            return res.status(400).json({
                message: 'Return reason is required',
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id,
        }).populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        // -----------------------------------------------------
        // Eligibility
        // -----------------------------------------------------

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({
                message: 'This order is not eligible for return',
            });
        }

        // -----------------------------------------------------
        // Maximum 2 return requests
        // -----------------------------------------------------

        if ((order.returnRequests || []).length >= MAX_REQUESTS) {
            return res.status(400).json({
                message: 'Maximum of 2 return requests allowed for this order',
            });
        }

        // -----------------------------------------------------
        // Do not allow another active request
        // -----------------------------------------------------

        const activeRequest = (order.returnRequests || []).find(
            request =>
                ['Requested', 'Approved'].includes(request.status)
        );

        if (activeRequest) {
            return res.status(400).json({
                message: 'An active return request already exists for this order',
            });
        }

        // -----------------------------------------------------
        // Normalize images
        // -----------------------------------------------------

        const uploadedImages = (req.files || []).map((file) => file.path);
        const submittedImages = Array.isArray(images) ? images : [images];
        const normalizedImages = [...submittedImages, ...uploadedImages]
            .filter(image => typeof image === 'string')
            .map(image => image.trim())
            .filter(Boolean)

        // -----------------------------------------------------
        // Defective/damaged reason requires images
        // -----------------------------------------------------

        const normalizedReason = String(reason).trim().toLowerCase();

        const defectReason =
            normalizedReason.includes('defect') ||
            normalizedReason.includes('damaged') ||
            normalizedReason.includes('broken') ||
            normalizedReason.includes('wrong item');

        if (defectReason && normalizedImages.length === 0) {
            return res.status(400).json({
                message: 'Images are required for defective, damaged, broken, or wrong-item returns',
            });
        }

        const requestNumber =
            (order.returnRequests || []).length + 1;

        order.returnRequests.push({
            requestNumber,
            status: 'Requested',
            reason: String(reason).trim(),
            defectImages: normalizedImages,
            requestedAt: new Date(),
        });

        // IMPORTANT:
        // Do NOT change orderStatus to Refund Processing.
        // Return and refund are separate workflows.

        order.timeline.push({
            status: 'Return Requested',
            description: `Return request #${requestNumber} submitted: ${String(reason).trim()}`,
            timestamp: new Date(),
        });

        await order.save();

        // Customer notification
        await createAndSendNotification(
            order.customer._id || order.customer,
            `Your return request #${requestNumber} for order #${order._id} has been submitted.`
        );

        // Notify sellers involved in the order
        const sellerIds = new Set();

        for (const item of order.products) {
            if (item.product && item.product.seller) {
                sellerIds.add(item.product.seller.toString());
            }
        }

        for (const sellerId of sellerIds) {
            await createAndSendNotification(
                sellerId,
                `Return request #${requestNumber} received for order #${order._id}.`
            );
        }

        res.status(201).json({
            message: 'Return request submitted successfully',
            request: order.returnRequests[order.returnRequests.length - 1],
            returnRequests: order.returnRequests,
            refundRequests: order.refundRequests || [],
        });
    } catch (error) {
        console.error('requestReturn:', error);

        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// SELLER / ADMIN: APPROVE RETURN
// ---------------------------------------------------------
// PUT /api/return-refund/:id/return/:requestNumber/approve
// ---------------------------------------------------------

const approveReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        const authorized = await canManageOrder(req, order);

        if (!authorized) {
            return res.status(403).json({
                message: 'Not authorized to manage this return',
            });
        }

        const requestNumber = Number(req.params.requestNumber);

        const request = (order.returnRequests || []).find(
            item => item.requestNumber === requestNumber
        );

        if (!request) {
            return res.status(404).json({
                message: 'Return request not found',
            });
        }

        if (request.status !== 'Requested') {
            return res.status(400).json({
                message: `Return request cannot be approved from ${request.status} status`,
            });
        }

        request.status = 'Approved';
        request.processedAt = new Date();

        order.timeline.push({
            status: 'Return Approved',
            description: `Return request #${requestNumber} approved`,
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Your return request #${requestNumber} for order #${order._id} has been approved.`
        );

        res.json({
            message: 'Return request approved',
            request,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// SELLER / ADMIN: REJECT RETURN
// ---------------------------------------------------------
// PUT /api/return-refund/:id/return/:requestNumber/reject
// ---------------------------------------------------------

const rejectReturn = async (req, res) => {
    try {
        const {
            rejectionReason = '',
        } = req.body;

        const order = await Order.findById(req.params.id)
            .populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        const authorized = await canManageOrder(req, order);

        if (!authorized) {
            return res.status(403).json({
                message: 'Not authorized to manage this return',
            });
        }

        const requestNumber = Number(req.params.requestNumber);

        const request = (order.returnRequests || []).find(
            item => item.requestNumber === requestNumber
        );

        if (!request) {
            return res.status(404).json({
                message: 'Return request not found',
            });
        }

        if (request.status !== 'Requested') {
            return res.status(400).json({
                message: `Return request cannot be rejected from ${request.status} status`,
            });
        }

        request.status = 'Rejected';
        request.rejectionReason = String(rejectionReason).trim();
        request.processedAt = new Date();

        order.timeline.push({
            status: 'Return Rejected',
            description:
                `Return request #${requestNumber} rejected` +
                (rejectionReason
                    ? `: ${String(rejectionReason).trim()}`
                    : ''),
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Your return request #${requestNumber} for order #${order._id} was rejected.` +
            (rejectionReason
                ? ` Reason: ${String(rejectionReason).trim()}`
                : '')
        );

        res.json({
            message: 'Return request rejected',
            request,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// CUSTOMER: REQUEST REFUND
// ---------------------------------------------------------
// POST /api/return-refund/:id/refund
// ---------------------------------------------------------

const requestRefund = async (req, res) => {
    try {
        const {
            amount,
            method,
        } = req.body;

        const order = await Order.findOne({
            _id: req.params.id,
            customer: req.user._id,
        });

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        // -----------------------------------------------------
        // Refund is intentionally independent of return
        // -----------------------------------------------------

        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({
                message: 'This order is not eligible for a refund request',
            });
        }

        if ((order.refundRequests || []).length >= MAX_REQUESTS) {
            return res.status(400).json({
                message: 'Maximum of 2 refund requests allowed for this order',
            });
        }

        const activeRefund = (order.refundRequests || []).find(
            refund =>
                ['Requested', 'Processing'].includes(refund.status)
        );

        if (activeRefund) {
            return res.status(400).json({
                message: 'An active refund request already exists for this order',
            });
        }

        const refundAmount = Number(amount);

        if (
            !Number.isFinite(refundAmount) ||
            refundAmount <= 0 ||
            refundAmount > order.totalAmount
        ) {
            return res.status(400).json({
                message: `Refund amount must be between 0 and ${order.totalAmount}`,
            });
        }

        if (!method || !String(method).trim()) {
            return res.status(400).json({
                message: 'Refund method is required',
            });
        }

        const requestNumber =
            (order.refundRequests || []).length + 1;

        order.refundRequests.push({
            requestNumber,
            status: 'Requested',
            amount: refundAmount,
            method: String(method).trim(),
            requestedAt: new Date(),
        });

        // VERY IMPORTANT:
        // Do not set orderStatus to Refund Processing here.

        order.timeline.push({
            status: 'Refund Requested',
            description:
                `Refund request #${requestNumber} submitted for ₹${refundAmount}`,
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Your refund request #${requestNumber} for order #${order._id} has been submitted.`
        );

        res.status(201).json({
            message: 'Refund request submitted successfully',
            request:
                order.refundRequests[order.refundRequests.length - 1],
            refundRequests: order.refundRequests,
            returnRequests: order.returnRequests || [],
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// SELLER / ADMIN: START REFUND PROCESSING
// ---------------------------------------------------------
// PUT /api/return-refund/:id/refund/:requestNumber/process
// ---------------------------------------------------------

const processRefund = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        const authorized = await canManageOrder(req, order);

        if (!authorized) {
            return res.status(403).json({
                message: 'Not authorized to process this refund',
            });
        }

        const requestNumber = Number(req.params.requestNumber);

        const refund = (order.refundRequests || []).find(
            item => item.requestNumber === requestNumber
        );

        if (!refund) {
            return res.status(404).json({
                message: 'Refund request not found',
            });
        }

        if (refund.status !== 'Requested') {
            return res.status(400).json({
                message: `Refund cannot be processed from ${refund.status} status`,
            });
        }

        refund.status = 'Processing';

        refund.processedAt = new Date();

        order.timeline.push({
            status: 'Refund Processing',
            description:
                `Refund request #${requestNumber} is being processed`,
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Your refund request #${requestNumber} for order #${order._id} is now being processed.`
        );

        res.json({
            message: 'Refund processing started',
            request: refund,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// SELLER / ADMIN: COMPLETE REFUND
// ---------------------------------------------------------
// PUT /api/return-refund/:id/refund/:requestNumber/complete
// ---------------------------------------------------------

const completeRefund = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        const authorized = await canManageOrder(req, order);

        if (!authorized) {
            return res.status(403).json({
                message: 'Not authorized to complete this refund',
            });
        }

        const requestNumber = Number(req.params.requestNumber);

        const refund = (order.refundRequests || []).find(
            item => item.requestNumber === requestNumber
        );

        if (!refund) {
            return res.status(404).json({
                message: 'Refund request not found',
            });
        }

        if (refund.status !== 'Processing') {
            return res.status(400).json({
                message:
                    `Refund cannot be completed from ${refund.status} status`,
            });
        }

        refund.status = 'Refunded';
        refund.processedAt = new Date();

        order.timeline.push({
            status: 'Refunded',
            description:
                `Refund #${requestNumber} completed for ₹${refund.amount}`,
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Refund #${requestNumber} for order #${order._id} has been completed. ₹${refund.amount} will be returned via ${refund.method}.`
        );

        res.json({
            message: 'Refund completed successfully',
            request: refund,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ---------------------------------------------------------
// SELLER / ADMIN: FAIL REFUND
// ---------------------------------------------------------
// PUT /api/return-refund/:id/refund/:requestNumber/fail
// ---------------------------------------------------------

const failRefund = async (req, res) => {
    try {
        const {
            failureReason = '',
        } = req.body;

        const order = await Order.findById(req.params.id)
            .populate('products.product');

        if (!order) {
            return res.status(404).json({
                message: 'Order not found',
            });
        }

        const authorized = await canManageOrder(req, order);

        if (!authorized) {
            return res.status(403).json({
                message: 'Not authorized to manage this refund',
            });
        }

        const requestNumber = Number(req.params.requestNumber);

        const refund = (order.refundRequests || []).find(
            item => item.requestNumber === requestNumber
        );

        if (!refund) {
            return res.status(404).json({
                message: 'Refund request not found',
            });
        }

        if (!['Requested', 'Processing'].includes(refund.status)) {
            return res.status(400).json({
                message:
                    `Refund cannot be failed from ${refund.status} status`,
            });
        }

        refund.status = 'Failed';
        refund.failureReason = String(failureReason).trim();
        refund.processedAt = new Date();

        order.timeline.push({
            status: 'Refund Failed',
            description:
                `Refund #${requestNumber} failed` +
                (failureReason
                    ? `: ${String(failureReason).trim()}`
                    : ''),
            timestamp: new Date(),
        });

        await order.save();

        await createAndSendNotification(
            order.customer,
            `Refund #${requestNumber} for order #${order._id} failed.` +
            (failureReason
                ? ` Reason: ${String(failureReason).trim()}`
                : '')
        );

        res.json({
            message: 'Refund marked as failed',
            request: refund,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    getReturnRefundStatus,
    requestReturn,
    approveReturn,
    rejectReturn,
    requestRefund,
    processRefund,
    completeRefund,
    failRefund,
};