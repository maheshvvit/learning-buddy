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

// Send message to AI with streaming via SSE
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

    await chatSession.save();

    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    // Flush headers
    res.flushHeaders();

    // Get user's recent progress and context
    const recentProgress = await UserProgress.find({ userId })
      .sort({ completedAt: -1 })
      .limit(5);

    // Enhanced conversation context
    const conversationContext = [
      {
        role: 'system',
        content: `You are a personalized learning assistant. The user's name is ${chatSession.userId.name}, 
                 they are at level ${chatSession.userId.gamification.level}. 
                 Their learning preferences: ${JSON.stringify(chatSession.userId.learningPreferences)}.
                 Recent progress: ${JSON.stringify(recentProgress.map(p => p.category))}.
                 Please provide engaging, personalized responses.`
      },
      ...chatSession.messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user', content: message }
    ];

    // OpenAI streaming call
    const openai = require('openai');
    const OpenAI = openai.OpenAI;
    const openaiClient = new OpenAI();

    const completion = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: conversationContext,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true
    });

    let assistantMessageContent = '';
    completion.on('data', async (data) => {
      const chunk = data.choices[0].delta?.content || '';
      assistantMessageContent += chunk;

      // Send chunk to client
      res.write(`data: ${chunk}\n\n`);
    });

    completion.on('end', async () => {
      // Add AI response to chat session
      const assistantMessage = chatSession.addMessage('assistant', assistantMessageContent, {
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

      // Send event to indicate end of stream
      res.write('event: end\n');
      res.write('data: [DONE]\n\n');
      res.end();
    });

    completion.on('error', async (error) => {
      console.error('OpenAI streaming error:', error);

      // Send error event
      res.write('event: error\n');
      res.write(`data: ${error.message}\n\n`);
      res.end();
    });

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

// Helper function for dynamic response generation
const generateDynamicResponse = (type, context = {}, userProfile = {}) => {
  const responses = {
    welcome: [
      "Hello {name}! 👋 I'm Learning Buddy, ready to help you learn and grow. What's on your mind today?",
      "Hi {name}! 🌟 I'm excited to assist you on your learning journey. What would you like to explore?",
      "Welcome back {name}! 📚 Ready to continue your learning adventure?",
      "Greetings {name}! 🎯 I'm here to help you achieve your learning goals. What shall we focus on today?"
    ],
    challenge: [
      "Great work on tackling this challenge! 💪 Need any specific hints or explanations?",
      "I see you're working on {challengeType}. How can I help you master this concept?",
      "You're making progress! 🚀 Let me know if you need help breaking this down into smaller steps.",
      "This is an interesting challenge! Would you like me to explain the core concepts first?"
    ],
    learning_path: [
      "Based on your progress in {topic}, here's a personalized next step for you.",
      "I notice you excel at {strength}. Let's build on that with some advanced concepts!",
      "Given your learning style and goals, I recommend focusing on {recommendation}.",
      "Your recent achievements suggest you're ready for {nextLevel} content!"
    ]
  };

  // Select response template based on type
  const templates = responses[type] || responses.welcome;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Replace placeholders with context values
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] || userProfile[key] || match;
  });
};

const generateWelcomeMessage = async (contextType, userId) => {
  try {
    // Get user data for personalization
    const user = await User.findById(userId);
    const timeOfDay = new Date().getHours() < 12 ? 'morning' : (new Date().getHours() < 17 ? 'afternoon' : 'evening');
    
    const context = {
      name: user?.name || 'there',
      timeOfDay,
      lastTopic: user?.learningPreferences?.preferredTopics?.[0],
      level: user?.gamification?.level
    };

    const welcomeContexts = {
      general: generateDynamicResponse('welcome', context),
      'challenge-help': generateDynamicResponse('challenge', {
        ...context,
        challengeType: user?.currentChallenge?.type || 'this challenge'
      }),
      'learning-path': generateDynamicResponse('learning_path', {
        ...context,
        topic: user?.learningPreferences?.currentFocus || 'your chosen topics'
      })
    };

    return welcomeContexts[contextType] || welcomeContexts.general;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return generateDynamicResponse('welcome', { name: 'there' });
  }
};

const generateSuggestedActions = async (userMessage, context, userId) => {
  const actions = [];
  const user = await User.findById(userId).select('gamification.level learningPreferences');
  const userLevel = user?.gamification?.level || 1;

  // Analyze message intent and context
  const messageIntent = userMessage.toLowerCase();
  const userContext = {
    level: userLevel,
    preferences: user?.learningPreferences || {},
    timeOfDay: new Date().getHours()
  };

  // Dynamic challenge suggestions based on user context
  if (messageIntent.includes('practice') || messageIntent.includes('exercise') || messageIntent.includes('challenge')) {
    const challenges = await Challenge.aggregate([
      { $match: { difficulty: { $gte: userLevel - 1, $lte: userLevel + 1 } } },
      { $sample: { size: 3 } }
    ]);
    
    if (challenges.length > 0) {
      actions.push({
        type: 'challenge',
        title: generateDynamicResponse('challenge', userContext),
        description: 'Here are some challenges matched to your current level',
        actionData: { challenges }
      });
    }
  }

  // More personalized learning path suggestions
  if (messageIntent.includes('learn') || messageIntent.includes('course') || messageIntent.includes('path')) {
    const paths = await LearningPath.aggregate([
      { $match: { 
        difficulty: { $gte: userLevel - 1, $lte: userLevel + 1 },
        topics: { $in: user?.learningPreferences?.preferredTopics || [] }
      }},
      { $sample: { size: 2 } }
    ]);

    if (paths.length > 0) {
      actions.push({
        type: 'learning-path',
        title: generateDynamicResponse('learning_path', userContext),
        description: 'Personalized learning paths based on your interests',
        actionData: { paths }
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

