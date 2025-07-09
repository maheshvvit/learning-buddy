const express = require('express');
const router = express.Router();

// Import controllers
const learningPathController = require('../../controllers/challenges/learningPathController');

// Import middleware
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');
const { validateObjectId, validatePagination, validateSearch } = require('../../middleware/validation');

// Public/Optional Auth routes

/**
 * @route   GET /api/learning-paths
 * @desc    Get all learning paths with filtering and pagination
 * @access  Public (with optional auth for user progress)
 */
router.get('/', optionalAuth, validatePagination, validateSearch, learningPathController.getLearningPaths);

/**
 * @route   GET /api/learning-paths/trending
 * @desc    Get trending learning paths
 * @access  Public
 */
router.get('/trending', learningPathController.getTrendingPaths);

/**
 * @route   GET /api/learning-paths/:pathId
 * @desc    Get learning path by ID
 * @access  Public (with optional auth for user progress)
 */
router.get('/:pathId', 
  optionalAuth, 
  validateObjectId('pathId'), 
  learningPathController.getLearningPathById
);

// Protected routes (authentication required)

/**
 * @route   POST /api/learning-paths/:pathId/enroll
 * @desc    Enroll in learning path
 * @access  Private
 */
router.post('/:pathId/enroll',
  authenticateToken,
  validateObjectId('pathId'),
  learningPathController.enrollInPath
);

/**
 * @route   POST /api/learning-paths/:pathId/steps/:stepNumber/complete
 * @desc    Complete a step in learning path
 * @access  Private
 */
router.post('/:pathId/steps/:stepNumber/complete',
  authenticateToken,
  validateObjectId('pathId'),
  learningPathController.completeStep
);

/**
 * @route   PUT /api/learning-paths/:pathId/settings
 * @desc    Update learning path progress settings
 * @access  Private
 */
router.put('/:pathId/settings',
  authenticateToken,
  validateObjectId('pathId'),
  learningPathController.updatePathSettings
);

/**
 * @route   GET /api/learning-paths/user/enrolled
 * @desc    Get user's enrolled learning paths
 * @access  Private
 */
router.get('/user/enrolled',
  authenticateToken,
  learningPathController.getUserPaths
);

/**
 * @route   GET /api/learning-paths/user/recommended
 * @desc    Get recommended learning paths for user
 * @access  Private
 */
router.get('/user/recommended',
  authenticateToken,
  learningPathController.getRecommendedPaths
);

// Admin routes

/**
 * @route   POST /api/learning-paths
 * @desc    Create new learning path
 * @access  Private (admin)
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  learningPathController.createLearningPath
);

/**
 * @route   PUT /api/learning-paths/:pathId
 * @desc    Update learning path
 * @access  Private (admin)
 */
router.put('/:pathId',
  authenticateToken,
  requireAdmin,
  validateObjectId('pathId'),
  learningPathController.updateLearningPath
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Learning path service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

