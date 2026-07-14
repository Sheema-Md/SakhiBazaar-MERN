const Bookmark = require('../models/Bookmark');
const Product = require('../models/Product');

// @desc    Get logged in user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).populate('product');
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to bookmarks
// @route   POST /api/bookmarks
// @access  Private
const addBookmark = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already bookmarked
    const exists = await Bookmark.findOne({ user: req.user._id, product: productId });
    if (exists) {
      return res.status(400).json({ message: 'Product is already bookmarked' });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      product: productId
    });

    const populated = await Bookmark.findById(bookmark._id).populate('product');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from bookmarks
// @route   DELETE /api/bookmarks/:id (id can be product id or bookmark id)
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if matching by bookmark id or product id
    let bookmark = await Bookmark.findById(id);
    if (!bookmark) {
      bookmark = await Bookmark.findOne({ user: req.user._id, product: id });
    }

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove this bookmark' });
    }

    await bookmark.deleteOne();
    res.json({ message: 'Bookmark removed successfully', productId: bookmark.product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBookmarks,
  addBookmark,
  removeBookmark,
};
