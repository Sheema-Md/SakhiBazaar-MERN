const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');

// All chat routes are private and require user authentication
router.use(protect);

router.route('/conversations')
  .post(getOrCreateConversation)
  .get(getConversations);

router.route('/messages')
  .post(sendMessage);

router.route('/messages/:conversationId')
  .get(getMessages);

module.exports = router;
