const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../../controllers/auth/userController');

// Import middleware
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../../middleware/auth');
const { validateObjectId, validatePagination, validateSearch } = require('../../middleware/validation');

// Public routes

/**
 * @route   GET /api/users/leaderboard
 * @desc    Get user leaderboard
 * @access  Public
 */
router.get('/leaderboard', validatePagination, userController.getLeaderboard);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Public
 */
router.get('/search', validateSearch, userController.searchUsers);

// Protected routes

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (own profile or admin)
 */
router.get('/:userId', 
  authenticateToken, 
  validateObjectId('userId'),
  requireOwnershipOrAdmin('userId'),
  userController.getUserById
);

/**
 * @route   GET /api/users/:userId/activity
 * @desc    Get user activity feed
 * @access  Private (own profile or admin)
 */
router.get('/:userId/activity',
  authenticateToken,
  validateObjectId('userId'),
  requireOwnershipOrAdmin('userId'),
  userController.getUserActivity
);

// Admin only routes

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (admin)
 */
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  validatePagination,
  userController.getAllUsers
);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user (admin only)
 * @access  Private (admin)
 */
router.put('/:userId',
  authenticateToken,
  requireAdmin,
  validateObjectId('userId'),
  userController.updateUser
);

/**
 * @route   POST /api/users/:userId/deactivate
 * @desc    Deactivate user (admin only)
 * @access  Private (admin)
 */
router.post('/:userId/deactivate',
  authenticateToken,
  requireAdmin,
  validateObjectId('userId'),
  userController.deactivateUser
);

/**
 * @route   POST /api/users/:userId/activate
 * @desc    Activate user (admin only)
 * @access  Private (admin)
 */
router.post('/:userId/activate',
  authenticateToken,
  requireAdmin,
  validateObjectId('userId'),
  userController.activateUser
);

module.exports = router;

