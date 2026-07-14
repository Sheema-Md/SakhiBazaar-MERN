const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { getIo, getActiveUserSocketId } = require('../config/socket');

// Helper to push notification to a user
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
  } catch (err) {
    console.error('Error sending notification:', err.message);
  }
};

// @desc    Add a product review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || rating === undefined) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify user is a verified buyer (has a Delivered order containing the product)
    const verifiedOrder = await Order.findOne({
      customer: req.user._id,
      orderStatus: 'Delivered',
      'products.product': productId
    });

    if (!verifiedOrder) {
      return res.status(403).json({ message: 'Only verified buyers who have received this product can write a review.' });
    }

    // Check if review already exists
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed by you' });
    }

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
    };

    product.reviews.push(review);
    
    // Recalculate average rating
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    // Trigger Notification for the seller
    await createAndSendNotification(
      product.seller,
      `A new review was added to your product "${product.title}" with a rating of ${rating} stars!`
    );

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const reviewId = req.params.id;

    // Find product containing the review
    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      return res.status(404).json({ message: 'Review or product not found' });
    }

    // Find specific review
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    // Recalculate average rating
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Find product containing the review
    const product = await Product.findOne({ 'reviews._id': reviewId });
    if (!product) {
      return res.status(404).json({ message: 'Review or product not found' });
    }

    // Find specific review
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify ownership or Admin role
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Remove review using Mongoose subdocument pull or remove method
    review.deleteOne();

    // Recalculate average rating
    if (product.reviews.length > 0) {
      product.ratings =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;
    } else {
      product.ratings = 0;
    }

    await product.save();
    res.json({ message: 'Review removed successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('reviews.userId', 'name avatar');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product.reviews || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
};
