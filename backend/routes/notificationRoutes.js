const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');

// Protect all notification routes with auth middleware
router.use(authenticateToken);

// GET /notifications - get all notifications for user
router.get('/', notificationController.getNotifications);

// PATCH /notifications/:id/read - mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
