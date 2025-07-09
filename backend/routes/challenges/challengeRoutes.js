const express = require('express');
const router = express.Router();

// Import controllers
const challengeController = require('../../controllers/challenges/challengeController');

// Import middleware
const { authenticateToken, requireAdmin, optionalAuth } = require('../../middleware/auth');
const { validateObjectId, validatePagination, validateSearch } = require('../../middleware/validation');

// Public/Optional Auth routes

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges with filtering and pagination
 * @access  Public (with optional auth for user progress)
 */
router.get('/', optionalAuth, validatePagination, validateSearch, challengeController.getChallenges);

/**
 * @route   GET /api/challenges/:challengeId
 * @desc    Get challenge by ID
 * @access  Public (with optional auth for user progress)
 */
router.get('/:challengeId', 
  optionalAuth, 
  validateObjectId('challengeId'), 
  challengeController.getChallengeById
);

// Protected routes (authentication required)

/**
 * @route   POST /api/challenges/:challengeId/start
 * @desc    Start a challenge attempt
 * @access  Private
 */
router.post('/:challengeId/start',
  authenticateToken,
  validateObjectId('challengeId'),
  challengeController.startChallenge
);

/**
 * @route   POST /api/challenges/:challengeId/submit
 * @desc    Submit challenge attempt
 * @access  Private
 */
router.post('/:challengeId/submit',
  authenticateToken,
  validateObjectId('challengeId'),
  challengeController.submitChallenge
);

/**
 * @route   GET /api/challenges/user/history
 * @desc    Get user's challenge history
 * @access  Private
 */
router.get('/user/history',
  authenticateToken,
  validatePagination,
  challengeController.getChallengeHistory
);

/**
 * @route   GET /api/challenges/user/recommended
 * @desc    Get recommended challenges for user
 * @access  Private
 */
router.get('/user/recommended',
  authenticateToken,
  challengeController.getRecommendedChallenges
);

// Admin routes

/**
 * @route   POST /api/challenges
 * @desc    Create new challenge
 * @access  Private (admin)
 */
router.post('/',
  authenticateToken,
  requireAdmin,
  challengeController.createChallenge
);

/**
 * @route   PUT /api/challenges/:challengeId
 * @desc    Update challenge
 * @access  Private (admin)
 */
router.put('/:challengeId',
  authenticateToken,
  requireAdmin,
  validateObjectId('challengeId'),
  challengeController.updateChallenge
);

/**
 * @route   DELETE /api/challenges/:challengeId
 * @desc    Delete challenge (soft delete)
 * @access  Private (admin)
 */
router.delete('/:challengeId',
  authenticateToken,
  requireAdmin,
  validateObjectId('challengeId'),
  challengeController.deleteChallenge
);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Challenge service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

