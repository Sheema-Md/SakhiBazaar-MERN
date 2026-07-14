const Notification = require('../models/Notification');
const { getIo, getActiveUserSocketId } = require('../config/socket');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, unread: true },
      { $set: { unread: false } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create system notification (for testing)
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { recipient, text } = req.body;
    if (!recipient || !text) {
      return res.status(400).json({ message: 'Recipient and text are required' });
    }

    const notification = await Notification.create({
      recipient,
      text,
    });

    // Push socket update if user is active
    const socketId = getActiveUserSocketId(recipient);
    if (socketId) {
      const io = getIo();
      io.to(socketId).emit('notification', notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationsAsRead,
  createNotification,
};
