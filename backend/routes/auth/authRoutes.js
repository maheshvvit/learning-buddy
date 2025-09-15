const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../../controllers/auth/authController');

// Import middleware
const { authenticateToken, updateLastLogin } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateSettingsUpdate
} = require('../../middleware/validation');

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', validatePasswordResetRequest, authController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', validatePasswordReset, authController.resetPassword);

// Protected routes (authentication required)

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, updateLastLogin, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, upload.single('avatar'), validateProfileUpdate, authController.updateProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, validatePasswordChange, authController.changePassword);

/**
 * @route   PUT /api/auth/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put('/settings', authenticateToken, validateSettingsUpdate, authController.updateSettings);

/**
 * @route   GET /api/auth/stats
 * @desc    Get user statistics and analytics
 * @access  Private
 */
router.get('/stats', authenticateToken, authController.getUserStats);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 */
router.delete('/account', authenticateToken, authController.deleteAccount);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

