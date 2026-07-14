const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markNotificationsAsRead,
  createNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getUserNotifications);
router.put('/read', protect, markNotificationsAsRead);
router.post('/', protect, createNotification);

module.exports = router;
