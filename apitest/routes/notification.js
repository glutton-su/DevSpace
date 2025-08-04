const express = require("express");
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark all notifications as read
router.put("/mark-all-read", markAllNotificationsAsRead);

// Mark specific notification as read
router.put("/:id/read", markNotificationAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;