const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  // Session Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    maxlength: [200, 'Session title cannot exceed 200 characters']
  },
  
  // Session Context
  context: {
    type: {
      type: String,
      enum: ['general', 'challenge-help', 'learning-path', 'study-planning', 'career-advice'],
      default: 'general'
    },
    relatedChallengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    relatedPathId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningPath'
    },
    subject: String,
    difficulty: String
  },
  
  // Messages
  messages: [{
    messageId: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Message content cannot exceed 10000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    
    // Message Metadata
    metadata: {
      tokens: Number,
      model: String,
      temperature: Number,
      responseTime: Number, // in milliseconds
      confidence: Number, // 0-1 scale
      intent: String,
      entities: [String]
    },
    
    // User Feedback
    feedback: {
      helpful: Boolean,
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      reportIssue: {
        hasIssue: {
          type: Boolean,
          default: false
        },
        issueType: {
          type: String,
          enum: ['inappropriate', 'incorrect', 'unhelpful', 'technical', 'other']
        },
        description: String
      }
    },
    
    // Rich Content
    attachments: [{
      type: {
        type: String,
        enum: ['image', 'file', 'link', 'code', 'quiz']
      },
      url: String,
      filename: String,
      size: Number,
      mimeType: String,
      description: String
    }],
    
    // Code and Examples
    codeBlocks: [{
      language: String,
      code: String,
      explanation: String,
      isRunnable: {
        type: Boolean,
        default: false
      }
    }],
    
    // Suggested Actions
    suggestedActions: [{
      type: {
        type: String,
        enum: ['challenge', 'learning-path', 'resource', 'practice', 'review']
      },
      title: String,
      description: String,
      actionData: mongoose.Schema.Types.Mixed
    }]
  }],
  
  // Session State
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Session Analytics
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    assistantMessages: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    totalTokensUsed: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number,
      default: 0 // in seconds
    },
    topicsDiscussed: [String],
    helpfulnessRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  
  // Learning Insights
  insights: {
    learningGoals: [String],
    identifiedWeaknesses: [String],
    recommendedTopics: [String],
    studyPlan: {
      shortTerm: [String], // Next 1-2 weeks
      mediumTerm: [String], // Next 1-2 months
      longTerm: [String] // Next 3-6 months
    },
    skillAssessment: [{
      skill: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced']
      },
      confidence: Number // 0-1 scale
    }]
  },
  
  // Personalization Data
  personalization: {
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'encouraging', 'direct'],
      default: 'encouraging'
    },
    explanationLevel: {
      type: String,
      enum: ['basic', 'detailed', 'expert'],
      default: 'detailed'
    },
    preferredLanguage: {
      type: String,
      default: 'en'
    },
    learningStyle: String,
    interests: [String]
  },
  
  // Session Settings
  settings: {
    autoSave: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    shareWithInstructors: {
      type: Boolean,
      default: false
    },
    includeInAnalytics: {
      type: Boolean,
      default: true
    }
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
chatSessionSchema.index({ userId: 1, startedAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ userId: 1, status: 1 });
chatSessionSchema.index({ 'context.type': 1 });
chatSessionSchema.index({ lastMessageAt: -1 });

// Virtual for session duration in human readable format
chatSessionSchema.virtual('analytics.sessionDurationFormatted').get(function() {
  const duration = this.analytics.sessionDuration;
  if (!duration) return '0 seconds';
  
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for message count by role
chatSessionSchema.virtual('messageStats').get(function() {
  const stats = {
    user: 0,
    assistant: 0,
    system: 0,
    total: this.messages.length
  };
  
  this.messages.forEach(message => {
    stats[message.role] = (stats[message.role] || 0) + 1;
  });
  
  return stats;
});

// Pre-save middleware to update analytics
chatSessionSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    // Update message counts
    this.analytics.totalMessages = this.messages.length;
    this.analytics.userMessages = this.messages.filter(m => m.role === 'user').length;
    this.analytics.assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
    
    // Update last message time
    if (this.messages.length > 0) {
      const lastMessage = this.messages[this.messages.length - 1];
      this.lastMessageAt = lastMessage.timestamp;
    }
    
    // Calculate session duration
    if (this.startedAt && this.lastMessageAt) {
      this.analytics.sessionDuration = Math.floor((this.lastMessageAt - this.startedAt) / 1000);
    }
    
    // Calculate average response time
    const assistantMessages = this.messages.filter(m => m.role === 'assistant' && m.metadata?.responseTime);
    if (assistantMessages.length > 0) {
      const totalResponseTime = assistantMessages.reduce((sum, m) => sum + m.metadata.responseTime, 0);
      this.analytics.averageResponseTime = totalResponseTime / assistantMessages.length;
    }
    
    // Calculate total tokens used
    const messagesWithTokens = this.messages.filter(m => m.metadata?.tokens);
    if (messagesWithTokens.length > 0) {
      this.analytics.totalTokensUsed = messagesWithTokens.reduce((sum, m) => sum + m.metadata.tokens, 0);
    }
    
    // Extract topics discussed
    const topics = new Set();
    this.messages.forEach(message => {
      if (message.metadata?.entities) {
        message.metadata.entities.forEach(entity => topics.add(entity));
      }
    });
    this.analytics.topicsDiscussed = Array.from(topics);
  }
  
  next();
});

// Method to add a message to the session
chatSessionSchema.methods.addMessage = function(role, content, metadata = {}) {
  const messageId = new mongoose.Types.ObjectId().toString();
  
  const message = {
    messageId: messageId,
    role: role,
    content: content,
    timestamp: new Date(),
    metadata: metadata
  };
  
  this.messages.push(message);
  return message;
};

// Method to get conversation context for AI
chatSessionSchema.methods.getConversationContext = function(maxMessages = 10) {
  // Get recent messages for context
  const recentMessages = this.messages
    .slice(-maxMessages)
    .map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  
  // Add system context based on session type
  const systemContext = this.generateSystemContext();
  
  return [systemContext, ...recentMessages];
};

// Method to generate system context based on session type and user data
chatSessionSchema.methods.generateSystemContext = function() {
  let systemPrompt = "You are Learning Buddy, an AI-powered learning assistant. ";
  
  switch (this.context.type) {
    case 'challenge-help':
      systemPrompt += "You are helping the user with a specific learning challenge. Provide hints and guidance without giving away the complete answer.";
      break;
    case 'learning-path':
      systemPrompt += "You are helping the user navigate their learning path. Provide encouragement and suggest next steps.";
      break;
    case 'study-planning':
      systemPrompt += "You are helping the user create and optimize their study plan. Focus on time management and learning strategies.";
      break;
    case 'career-advice':
      systemPrompt += "You are providing career guidance related to the user's learning goals. Be supportive and practical.";
      break;
    default:
      systemPrompt += "You are a general learning assistant. Help the user with their questions and provide educational guidance.";
  }
  
  // Add personalization context
  if (this.personalization.communicationStyle) {
    systemPrompt += ` Use a ${this.personalization.communicationStyle} communication style.`;
  }
  
  if (this.personalization.explanationLevel) {
    systemPrompt += ` Provide ${this.personalization.explanationLevel} explanations.`;
  }
  
  return {
    role: 'system',
    content: systemPrompt
  };
};

// Method to analyze session for insights
chatSessionSchema.methods.analyzeSession = function() {
  const analysis = {
    mainTopics: this.analytics.topicsDiscussed,
    userEngagement: this.analytics.userMessages / this.analytics.totalMessages,
    averageMessageLength: 0,
    sentimentTrend: 'neutral',
    learningProgress: 'unknown'
  };
  
  // Calculate average message length
  if (this.messages.length > 0) {
    const totalLength = this.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    analysis.averageMessageLength = totalLength / this.messages.length;
  }
  
  // Analyze user questions for learning gaps
  const userQuestions = this.messages
    .filter(msg => msg.role === 'user' && msg.content.includes('?'))
    .map(msg => msg.content);
  
  analysis.questionsAsked = userQuestions.length;
  analysis.questionTypes = this.categorizeQuestions(userQuestions);
  
  return analysis;
};

// Helper method to categorize questions
chatSessionSchema.methods.categorizeQuestions = function(questions) {
  const categories = {
    conceptual: 0,
    procedural: 0,
    application: 0,
    clarification: 0
  };
  
  questions.forEach(question => {
    const lowerQ = question.toLowerCase();
    
    if (lowerQ.includes('what is') || lowerQ.includes('define') || lowerQ.includes('explain')) {
      categories.conceptual++;
    } else if (lowerQ.includes('how to') || lowerQ.includes('steps') || lowerQ.includes('process')) {
      categories.procedural++;
    } else if (lowerQ.includes('example') || lowerQ.includes('use case') || lowerQ.includes('apply')) {
      categories.application++;
    } else {
      categories.clarification++;
    }
  });
  
  return categories;
};

// Static method to get user's recent sessions
chatSessionSchema.statics.getRecentSessions = async function(userId, limit = 10) {
  return await this.find({
    userId: userId,
    status: { $ne: 'archived' }
  })
  .sort({ lastMessageAt: -1 })
  .limit(limit)
  .select('sessionId title context.type analytics.totalMessages lastMessageAt status');
};

// Static method to get session analytics for admin
chatSessionSchema.statics.getGlobalAnalytics = async function(timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  const pipeline = [
    {
      $match: {
        startedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalMessages: { $sum: '$analytics.totalMessages' },
        averageSessionDuration: { $avg: '$analytics.sessionDuration' },
        averageMessagesPerSession: { $avg: '$analytics.totalMessages' },
        topContextTypes: { $push: '$context.type' }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

module.exports = mongoose.model('ChatSession', chatSessionSchema);

