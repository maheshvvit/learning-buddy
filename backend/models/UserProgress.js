const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge',
    required: true
  },

  // Attempt Information
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'failed'],
    default: 'in-progress'
  },
  completed: {
    type: Boolean,
    default: false
  },

  // Timing Data
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  estimatedTime: Number, // Challenge's estimated time for comparison

  // Scoring and Performance
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  maxPossibleScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    default: false
  },

  // Detailed Responses
  responses: [{
    questionId: String,
    questionType: String,
    userAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    pointsEarned: Number,
    timeSpent: Number, // seconds spent on this question
    hintsUsed: [String],
    attempts: Number // for questions that allow multiple attempts
  }],

  // Code Submission (for coding challenges)
  codeSubmission: {
    language: String,
    code: String,
    testResults: [{
      testCaseId: String,
      input: String,
      expectedOutput: String,
      actualOutput: String,
      passed: Boolean,
      executionTime: Number,
      memoryUsed: Number,
      error: String
    }],
    compilationError: String,
    totalTestsPassed: Number,
    totalTests: Number
  },

  // Essay/Project Submission
  essaySubmission: {
    content: String,
    wordCount: Number,
    submittedAt: Date,
    feedback: String,
    rubricScores: [{
      criteria: String,
      score: Number,
      maxScore: Number,
      feedback: String
    }],
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },

  // Rewards and XP
  xpEarned: {
    type: Number,
    default: 0
  },
  bonusXp: {
    perfectScore: {
      type: Number,
      default: 0
    },
    fastCompletion: {
      type: Number,
      default: 0
    },
    firstAttempt: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    }
  },
  badgesEarned: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Learning Analytics
  analytics: {
    struggledQuestions: [String], // Question IDs where user struggled
    quickQuestions: [String], // Question IDs answered quickly
    hintsUsedCount: {
      type: Number,
      default: 0
    },
    pauseCount: {
      type: Number,
      default: 0
    },
    pauseDuration: {
      type: Number,
      default: 0 // total seconds paused
    },
    deviceType: String, // 'desktop', 'mobile', 'tablet'
    browserInfo: String
  },

  // Feedback and Rating
  userFeedback: {
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    enjoyment: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    wouldRecommend: Boolean,
    reportIssue: {
      hasIssue: {
        type: Boolean,
        default: false
      },
      issueType: String,
      description: String
    }
  },

  // Adaptive Learning Data
  adaptiveData: {
    difficultyAdjustment: Number, // -1 to 1, negative means too hard
    recommendedNextChallenges: [{
      challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
      },
      confidence: Number, // 0 to 1
      reason: String
    }],
    weaknessesIdentified: [String],
    strengthsIdentified: [String]
  },

  // Metadata
  version: {
    type: Number,
    default: 1
  },
  notes: String // For admin or instructor notes

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
userProgressSchema.index({ userId: 1, challengeId: 1 });
userProgressSchema.index({ userId: 1, completed: 1 });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ challengeId: 1, completed: 1 });
userProgressSchema.index({ userId: 1, completedAt: -1 });
userProgressSchema.index({ userId: 1, score: -1 });

// Virtual for total XP earned (including bonuses)
userProgressSchema.virtual('totalXpEarned').get(function() {
  const bonusTotal = Object.values(this.bonusXp).reduce((sum, bonus) => sum + bonus, 0);
  return this.xpEarned + bonusTotal;
});

// Virtual for completion time in human readable format
userProgressSchema.virtual('completionTimeFormatted').get(function() {
  if (!this.timeSpent) return '0 seconds';
  
  const hours = Math.floor(this.timeSpent / 3600);
  const minutes = Math.floor((this.timeSpent % 3600) / 60);
  const seconds = this.timeSpent % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for performance level
userProgressSchema.virtual('performanceLevel').get(function() {
  if (this.percentage >= 90) return 'excellent';
  if (this.percentage >= 80) return 'good';
  if (this.percentage >= 70) return 'satisfactory';
  if (this.percentage >= 60) return 'needs-improvement';
  return 'poor';
});

// Pre-save middleware to calculate percentage and determine pass/fail
userProgressSchema.pre('save', function(next) {
  if (this.isModified('score') || this.isModified('maxPossibleScore')) {
    this.percentage = this.maxPossibleScore > 0 ? 
      Math.round((this.score / this.maxPossibleScore) * 100) : 0;
  }
  
  if (this.isModified('completedAt') && this.completedAt && this.startedAt) {
    this.timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  
  next();
});

// Method to calculate XP based on performance
userProgressSchema.methods.calculateXP = function(challenge) {
  let baseXP = challenge.scoring.xpReward;
  let bonusXP = 0;
  
  // Perfect score bonus
  if (this.percentage === 100 && challenge.scoring.bonusXp.perfectScore) {
    bonusXP += challenge.scoring.bonusXp.perfectScore;
    this.bonusXp.perfectScore = challenge.scoring.bonusXp.perfectScore;
  }
  
  // Fast completion bonus
  if (this.timeSpent < challenge.estimatedTime * 60 * 0.8 && challenge.scoring.bonusXp.fastCompletion) {
    bonusXP += challenge.scoring.bonusXp.fastCompletion;
    this.bonusXp.fastCompletion = challenge.scoring.bonusXp.fastCompletion;
  }
  
  // First attempt bonus
  if (this.attemptNumber === 1 && this.passed && challenge.scoring.bonusXp.firstAttempt) {
    bonusXP += challenge.scoring.bonusXp.firstAttempt;
    this.bonusXp.firstAttempt = challenge.scoring.bonusXp.firstAttempt;
  }
  
  this.xpEarned = baseXP;
  return baseXP + bonusXP;
};

// Method to analyze performance and identify patterns
userProgressSchema.methods.analyzePerformance = function() {
  const analysis = {
    strengths: [],
    weaknesses: [],
    recommendations: []
  };
  
  // Analyze response patterns
  if (this.responses && this.responses.length > 0) {
    const correctResponses = this.responses.filter(r => r.isCorrect);
    const incorrectResponses = this.responses.filter(r => !r.isCorrect);
    
    // Identify question types where user excels
    const correctTypes = correctResponses.map(r => r.questionType);
    const incorrectTypes = incorrectResponses.map(r => r.questionType);
    
    // Find patterns
    const typePerformance = {};
    [...correctTypes, ...incorrectTypes].forEach(type => {
      if (!typePerformance[type]) {
        typePerformance[type] = { correct: 0, total: 0 };
      }
      typePerformance[type].total++;
      if (correctTypes.includes(type)) {
        typePerformance[type].correct++;
      }
    });
    
    Object.entries(typePerformance).forEach(([type, perf]) => {
      const accuracy = perf.correct / perf.total;
      if (accuracy >= 0.8) {
        analysis.strengths.push(`Strong in ${type} questions`);
      } else if (accuracy < 0.5) {
        analysis.weaknesses.push(`Needs improvement in ${type} questions`);
      }
    });
  }
  
  // Time-based analysis
  if (this.timeSpent && this.estimatedTime) {
    const timeRatio = this.timeSpent / (this.estimatedTime * 60);
    if (timeRatio < 0.7) {
      analysis.strengths.push('Quick problem solver');
    } else if (timeRatio > 1.5) {
      analysis.recommendations.push('Consider reviewing fundamentals to improve speed');
    }
  }
  
  // Hints usage analysis
  if (this.analytics.hintsUsedCount > this.responses.length * 0.5) {
    analysis.recommendations.push('Try to solve problems independently before using hints');
  }
  
  return analysis;
};

// Static method to get user's learning analytics
userProgressSchema.statics.getUserAnalytics = async function(userId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  const progress = await this.find({
    userId: userId,
    createdAt: { $gte: startDate }
  }).populate('challengeId', 'category difficulty type');
  
  const analytics = {
    totalChallenges: progress.length,
    completedChallenges: progress.filter(p => p.completed).length,
    totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
    averageScore: progress.length > 0 ? 
      progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length : 0,
    totalXpEarned: progress.reduce((sum, p) => sum + p.totalXpEarned, 0),
    categoryBreakdown: {},
    difficultyBreakdown: {},
    dailyActivity: {}
  };
  
  // Category and difficulty breakdown
  progress.forEach(p => {
    if (p.challengeId) {
      const category = p.challengeId.category;
      const difficulty = p.challengeId.difficulty;
      
      analytics.categoryBreakdown[category] = 
        (analytics.categoryBreakdown[category] || 0) + 1;
      analytics.difficultyBreakdown[difficulty] = 
        (analytics.difficultyBreakdown[difficulty] || 0) + 1;
    }
    
    // Daily activity
    const date = p.createdAt.toISOString().split('T')[0];
    analytics.dailyActivity[date] = (analytics.dailyActivity[date] || 0) + 1;
  });
  
  return analytics;
};

module.exports = mongoose.model('UserProgress', userProgressSchema);

