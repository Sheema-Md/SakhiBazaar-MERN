const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const mongoose = require('mongoose');
const { getIo, getActiveUserSocketId } = require('../config/socket');

// Helper: Verify whether an order exists between two users (one as customer, one as seller)
const hasOrderBetweenUsers = async (user1Id, user2Id) => {
  // Check if user1 is admin or user2 is admin
  const user1 = await User.findById(user1Id);
  const user2 = await User.findById(user2Id);
  if (user1?.role === 'admin' || user2?.role === 'admin') return true;

  // Case A: user1 is customer, user2 is seller
  const user2Products = await Product.find({ seller: user2Id }).distinct('_id');
  if (user2Products.length > 0) {
    const order1 = await Order.findOne({
      customer: user1Id,
      'products.product': { $in: user2Products }
    });
    if (order1) return true;
  }

  // Case B: user2 is customer, user1 is seller
  const user1Products = await Product.find({ seller: user1Id }).distinct('_id');
  if (user1Products.length > 0) {
    const order2 = await Order.findOne({
      customer: user2Id,
      'products.product': { $in: user1Products }
    });
    if (order2) return true;
  }

  return false;
};

// @desc    Get or create a conversation between logged-in user and another participant
// @route   POST /api/chat/conversations
// @access  Private
const getOrCreateConversation = async (req, res) => {
  try {
    const { recipientId, productId } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Please provide a valid recipient ID' });
    }

    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ message: 'You cannot start a conversation with yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // STRICT REQUIREMENT: Chat is allowed ONLY if an order exists between Buyer and Seller
    const canChat = await hasOrderBetweenUsers(senderId, recipientId);
    if (!canChat) {
      return res.status(403).json({
        message: 'Chat is enabled only after placing an order with this seller.'
      });
    }

    // Look for existing conversation between these participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        productId: productId && mongoose.Types.ObjectId.isValid(productId) ? productId : null,
      });
    }

    // Populate user details
    await conversation.populate('participants', 'name email role');
    if (conversation.productId) {
      await conversation.populate('productId', 'title price imageUrl');
    }

    res.json(conversation);
  } catch (error) {
    console.error('getOrCreateConversation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations containing the logged-in user
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'name email role')
      .populate('productId', 'title price imageUrl')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message within a conversation
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, text } = req.body;
    const senderId = req.user._id;

    if (!conversationId || !recipientId || !text) {
      return res.status(400).json({ message: 'Missing conversationId, recipientId, or text' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId) || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ message: 'Invalid conversationId or recipientId format' });
    }

    // Check order restriction
    const canChat = await hasOrderBetweenUsers(senderId, recipientId);
    if (!canChat) {
      return res.status(403).json({ message: 'Chat is enabled only after placing an order with this seller.' });
    }

    // Save message to database
    const message = await Message.create({
      conversationId,
      sender: senderId,
      recipient: recipientId,
      text,
    });

    // Update the last message in the parent conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    // Fetch populated message info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('recipient', 'name email');

    // Socket.io Real-Time Dispatch
    try {
      const io = getIo();
      const recipientSocketId = getActiveUserSocketId(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive_message', populatedMessage);
        console.log(`Dispatched real-time message to active user ${recipientId} via socket ${recipientSocketId}`);
      }
    } catch (socketErr) {
      console.error('Socket notification bypass:', socketErr.message);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID format' });
    }

    // Verify user is a participant of this conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId.toString());
    if (!isParticipant) {
      return res.status(403).json({ message: 'Not authorized to access these chat logs' });
    }

    // Retrieve historical messages
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: 1 });

    // Mark recipient messages as read
    await Message.updateMany(
      { conversationId, recipient: userId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
};
