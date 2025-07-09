const express = require('express');
const router = express.Router();

// Import controllers
const aiController = require('../../controllers/ai/aiController');

// Import middleware
const { authenticateToken } = require('../../middleware/auth');
const { validateObjectId } = require('../../middleware/validation');

// All AI routes require authentication

/**
 * @route   POST /api/ai/chat/start
 * @desc    Start new chat session
 * @access  Private
 */
router.post('/chat/start', authenticateToken, aiController.startChatSession);

/**
 * @route   POST /api/ai/chat/:sessionId/message
 * @desc    Send message to AI
 * @access  Private
 */
router.post('/chat/:sessionId/message',
  authenticateToken,
  aiController.sendMessage
);

/**
 * @route   GET /api/ai/chat/:sessionId
 * @desc    Get chat session
 * @access  Private
 */
router.get('/chat/:sessionId',
  authenticateToken,
  aiController.getChatSession
);

/**
 * @route   GET /api/ai/chat
 * @desc    Get user's chat sessions
 * @access  Private
 */
router.get('/chat', authenticateToken, aiController.getChatSessions);

/**
 * @route   POST /api/ai/chat/:sessionId/messages/:messageId/feedback
 * @desc    Provide feedback on AI message
 * @access  Private
 */
router.post('/chat/:sessionId/messages/:messageId/feedback',
  authenticateToken,
  aiController.provideFeedback
);

/**
 * @route   POST /api/ai/generate-path
 * @desc    Generate personalized learning path
 * @access  Private
 */
router.post('/generate-path', authenticateToken, aiController.generatePersonalizedPath);

/**
 * @route   GET /api/ai/analyze-weaknesses
 * @desc    Analyze user weaknesses and provide recommendations
 * @access  Private
 */
router.get('/analyze-weaknesses', authenticateToken, aiController.analyzeUserWeaknesses);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI service is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

