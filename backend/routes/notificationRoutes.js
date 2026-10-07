const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllReadNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification endpoints are protected
router.use(protect);

// Specific routes must appear BEFORE /:id
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.delete('/read', deleteAllReadNotifications);

// General collection route
router.get('/', getNotifications);

// Parameterized item routes
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
