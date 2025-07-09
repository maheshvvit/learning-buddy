const { ChatSession, User, Challenge, LearningPath, UserProgress } = require('../../models');
const { generateChatResponse, generateLearningPath, analyzeWeaknesses } = require('../../config/openai');
const { v4: uuidv4 } = require('uuid');

// Start new chat session
const startChatSession = async (req, res) => {
  try {
    const { context } = req.body;
    const userId = req.user._id;

    // Generate unique session ID
    const sessionId = uuidv4();

    // Create new chat session
    const chatSession = new ChatSession({
      userId,
      sessionId,
      context: context || { type: 'general' },
      title: context?.title || 'New Chat Session'
    });

    // Add welcome message
    const welcomeMessage = generateWelcomeMessage(context?.type || 'general');
    chatSession.addMessage('assistant', welcomeMessage, {
      intent: 'welcome',
      confidence: 1.0
    });

    await chatSession.save();

    res.status(201).json({
      success: true,
      message: 'Chat session started',
      data: { chatSession }
    });

  } catch (error) {
    console.error('Start chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Send message to AI
const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, attachments } = req.body;
    const userId = req.user._id;

    // Find chat session
    const chatSession = await ChatSession.findOne({
      sessionId,
      userId
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add user message
    const userMessage = chatSession.addMessage('user', message, {
      timestamp: new Date()
    });

    if (attachments && attachments.length > 0) {
      userMessage.attachments = attachments;
    }

    // Get conversation context
    const conversationContext = chatSession.getConversationContext();

    // Generate AI response
    const startTime = Date.now();
    
    try {
      const aiResponse = await generateChatResponse(conversationContext, {
        maxTokens: 1000,
        temperature: 0.7
      });

      const responseTime = Date.now() - startTime;

      // Add AI response
      const assistantMessage = chatSession.addMessage('assistant', aiResponse, {
        responseTime,
        model: process.env.OPENAI_MODEL || 'gpt-4',
        temperature: 0.7,
        confidence: 0.9
      });

      // Analyze message for suggested actions
      const suggestedActions = await generateSuggestedActions(message, chatSession.context, userId);
      if (suggestedActions.length > 0) {
        assistantMessage.suggestedActions = suggestedActions;
      }

      await chatSession.save();

      res.json({
        success: true,
        data: {
          userMessage,
          assistantMessage,
          sessionId: chatSession.sessionId
        }
      });

    } catch (aiError) {
      console.error('AI response error:', aiError);
      
      // Add fallback message
      const fallbackMessage = "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
      const assistantMessage = chatSession.addMessage('assistant', fallbackMessage, {
        responseTime: Date.now() - startTime,
        error: 'ai_service_error'
      });

      await chatSession.save();

      res.json({
        success: true,
        data: {
          userMessage,
          assistantMessage,
          sessionId: chatSession.sessionId
        }
      });
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get chat session
const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user._id;

    const chatSession = await ChatSession.findOne({
      sessionId,
      userId
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: { chatSession }
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's chat sessions
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    const sessions = await ChatSession.getRecentSessions(userId, limit);

    res.json({
      success: true,
      data: { sessions }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Generate personalized learning path
const generatePersonalizedPath = async (req, res) => {
  try {
    const { preferences, goals, currentLevel } = req.body;
    const userId = req.user._id;

    // Get user data for context
    const user = await User.findById(userId);
    const userProgress = await UserProgress.getUserAnalytics(userId);

    const userProfile = {
      level: user.gamification.level,
      preferences: user.learningPreferences,
      statistics: user.statistics,
      recentProgress: userProgress
    };

    // Generate learning path using AI
    const learningPath = await generateLearningPath(userProfile, {
      preferences,
      goals,
      currentLevel
    });

    res.json({
      success: true,
      message: 'Personalized learning path generated',
      data: { learningPath }
    });

  } catch (error) {
    console.error('Generate learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate learning path',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Analyze user weaknesses
const analyzeUserWeaknesses = async (req, res) => {
  try {
    const userId = req.user._id;
    const timeframe = parseInt(req.query.timeframe) || 30; // days

    // Get user's recent performance data
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    const recentProgress = await UserProgress.find({
      userId,
      completedAt: { $gte: startDate }
    }).populate('challengeId', 'category difficulty type');

    if (recentProgress.length === 0) {
      return res.json({
        success: true,
        message: 'Not enough data for analysis',
        data: {
          analysis: {
            weaknesses: [],
            recommendations: ['Complete more challenges to get personalized analysis']
          }
        }
      });
    }

    // Prepare performance data for AI analysis
    const performanceData = recentProgress.map(progress => ({
      category: progress.challengeId?.category,
      difficulty: progress.challengeId?.difficulty,
      type: progress.challengeId?.type,
      score: progress.percentage,
      timeSpent: progress.timeSpent,
      attempts: progress.attemptNumber,
      struggledQuestions: progress.analytics?.struggledQuestions || []
    }));

    // Analyze weaknesses using AI
    const analysis = await analyzeWeaknesses(performanceData);

    res.json({
      success: true,
      data: { analysis }
    });

  } catch (error) {
    console.error('Analyze weaknesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze weaknesses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Provide message feedback
const provideFeedback = async (req, res) => {
  try {
    const { sessionId, messageId } = req.params;
    const { helpful, rating, reportIssue } = req.body;
    const userId = req.user._id;

    const chatSession = await ChatSession.findOne({
      sessionId,
      userId
    });

    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Find the message
    const message = chatSession.messages.find(m => m.messageId === messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Update feedback
    message.feedback = {
      helpful,
      rating,
      reportIssue
    };

    await chatSession.save();

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    console.error('Provide feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions

const generateWelcomeMessage = (contextType) => {
  const welcomeMessages = {
    general: "Hello! I'm Learning Buddy, your AI-powered learning assistant. I'm here to help you with your learning journey. What would you like to learn about today?",
    'challenge-help': "Hi! I'm here to help you with this challenge. I can provide hints, explain concepts, and guide you through the solution. What specific part would you like help with?",
    'learning-path': "Welcome to your learning path! I'm here to guide you through each step and help you achieve your learning goals. How can I assist you today?",
    'study-planning': "Hello! I'm here to help you create an effective study plan. Let's work together to organize your learning schedule and set achievable goals. What are you looking to study?",
    'career-advice': "Hi there! I'm here to provide career guidance related to your learning goals. Whether you're looking to switch careers or advance in your current field, I can help you plan your learning journey. What are your career aspirations?"
  };

  return welcomeMessages[contextType] || welcomeMessages.general;
};

const generateSuggestedActions = async (userMessage, context, userId) => {
  const actions = [];

  // Analyze message content for action suggestions
  const lowerMessage = userMessage.toLowerCase();

  // Suggest challenges based on topics mentioned
  if (lowerMessage.includes('practice') || lowerMessage.includes('exercise') || lowerMessage.includes('challenge')) {
    const challenges = await Challenge.getRecommendedChallenges(userId, 3);
    if (challenges.length > 0) {
      actions.push({
        type: 'challenge',
        title: 'Try a Practice Challenge',
        description: 'Based on our conversation, here are some challenges you might find helpful',
        actionData: { challenges: challenges.slice(0, 2) }
      });
    }
  }

  // Suggest learning paths for structured learning
  if (lowerMessage.includes('learn') || lowerMessage.includes('course') || lowerMessage.includes('path')) {
    const paths = await LearningPath.getRecommendedPaths(userId, 2);
    if (paths.length > 0) {
      actions.push({
        type: 'learning-path',
        title: 'Explore Learning Paths',
        description: 'Check out these structured learning paths',
        actionData: { paths: paths.slice(0, 1) }
      });
    }
  }

  return actions;
};

module.exports = {
  startChatSession,
  sendMessage,
  getChatSession,
  getChatSessions,
  generatePersonalizedPath,
  analyzeUserWeaknesses,
  provideFeedback
};

