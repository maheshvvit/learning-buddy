const express = require('express');
const router = express.Router();

// Import controllers
const analyticsController = require('../../controllers/analytics/analyticsController');

// Import middleware
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Protected routes (authentication required)

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get user dashboard analytics
 * @access  Private
 */
router.get('/dashboard', authenticateToken, analyticsController.getDashboardAnalytics);

/**
 * @route   GET /api/analytics/learning
 * @desc    Get detailed learning analytics
 * @access  Private
 */
router.get('/learning', authenticateToken, analyticsController.getLearningAnalytics);

/**
 * @route   GET /api/analytics/comparison
 * @desc    Get progress comparison with peers/global/previous
 * @access  Private
 */
router.get('/comparison', authenticateToken, analyticsController.getProgressComparison);

/**
 * @route   GET /api/analytics/export
 * @desc    Export user data
 * @access  Private
 */
router.get('/export', authenticateToken, analyticsController.exportUserData);

// Admin routes

/**
 * @route   GET /api/analytics/system
 * @desc    Get system-wide analytics
 * @access  Private (admin)
 */
router.get('/system', authenticateToken, requireAdmin, analyticsController.getSystemAnalytics);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Analytics service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

