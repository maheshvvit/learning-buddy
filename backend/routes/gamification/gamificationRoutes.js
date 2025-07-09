const express = require('express');
const router = express.Router();

// Import controllers
const gamificationController = require('../../controllers/gamification/gamificationController');

// Import middleware
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');
const { validateObjectId, validatePagination } = require('../../middleware/validation');

// Public/Optional Auth routes

/**
 * @route   GET /api/gamification/badges
 * @desc    Get all badges
 * @access  Public (with optional auth for user badge status)
 */
router.get('/badges', optionalAuth, validatePagination, gamificationController.getBadges);

/**
 * @route   GET /api/gamification/badges/:badgeId
 * @desc    Get badge by ID
 * @access  Public (with optional auth for user badge status)
 */
router.get('/badges/:badgeId', 
  optionalAuth, 
  validateObjectId('badgeId'), 
  gamificationController.getBadgeById
);

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard
 * @access  Public
 */
router.get('/leaderboard', gamificationController.getLeaderboard);

// Protected routes (authentication required)

/**
 * @route   GET /api/gamification/badges/user/:userId?
 * @desc    Get user's badges (own or specified user)
 * @access  Private
 */
router.get('/badges/user/:userId?',
  authenticateToken,
  gamificationController.getUserBadges
);

/**
 * @route   GET /api/gamification/stats/:userId?
 * @desc    Get user's gamification stats
 * @access  Private
 */
router.get('/stats/:userId?',
  authenticateToken,
  gamificationController.getGamificationStats
);

/**
 * @route   POST /api/gamification/check-badges
 * @desc    Manually check and award eligible badges
 * @access  Private
 */
router.post('/check-badges',
  authenticateToken,
  gamificationController.checkBadges
);

// Admin routes

/**
 * @route   POST /api/gamification/badges
 * @desc    Create new badge
 * @access  Private (admin)
 */
router.post('/badges',
  authenticateToken,
  requireAdmin,
  gamificationController.createBadge
);

/**
 * @route   PUT /api/gamification/badges/:badgeId
 * @desc    Update badge
 * @access  Private (admin)
 */
router.put('/badges/:badgeId',
  authenticateToken,
  requireAdmin,
  validateObjectId('badgeId'),
  gamificationController.updateBadge
);

/**
 * @route   POST /api/gamification/badges/:badgeId/award/:userId
 * @desc    Manually award badge to user
 * @access  Private (admin)
 */
router.post('/badges/:badgeId/award/:userId',
  authenticateToken,
  requireAdmin,
  validateObjectId('badgeId'),
  validateObjectId('userId'),
  gamificationController.awardBadge
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Gamification service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

