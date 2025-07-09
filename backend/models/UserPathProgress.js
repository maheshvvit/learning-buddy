const mongoose = require('mongoose');

const userPathProgressSchema = new mongoose.Schema({
  // References
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true
  },

  // Enrollment Information
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  startedAt: Date,
  completedAt: Date,
  
  // Progress Status
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'paused', 'dropped'],
    default: 'enrolled'
  },
  completed: {
    type: Boolean,
    default: false
  },

  // Step Progress
  currentStep: {
    type: Number,
    default: 1
  },
  completedSteps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number,
    timeSpent: Number, // in seconds
    attempts: {
      type: Number,
      default: 1
    },
    xpEarned: {
      type: Number,
      default: 0
    }
  }],
  
  // Overall Progress Metrics
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  totalXpEarned: {
    type: Number,
    default: 0
  },
  
  // Performance Analytics
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  averageStepTime: {
    type: Number,
    default: 0 // in seconds
  },
  
  // Learning Patterns
  studyPattern: {
    preferredTimeOfDay: String, // 'morning', 'afternoon', 'evening', 'night'
    averageSessionLength: Number, // in minutes
    studyFrequency: Number, // sessions per week
    lastStudySession: Date
  },
  
  // Personalization Data
  adaptiveData: {
    difficultyAdjustments: [{
      stepNumber: Number,
      originalDifficulty: String,
      adjustedDifficulty: String,
      reason: String,
      adjustedAt: Date
    }],
    recommendedPace: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal'
    },
    strugglingAreas: [String],
    strongAreas: [String],
    learningStyle: String
  },
  
  // Milestones and Achievements
  milestones: [{
    type: {
      type: String,
      enum: ['quarter', 'half', 'three-quarter', 'completion', 'streak', 'performance']
    },
    achievedAt: Date,
    description: String,
    xpBonus: Number
  }],
  
  // User Feedback and Rating
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
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
    wouldRecommend: Boolean,
    improvementSuggestions: String,
    submittedAt: Date
  },
  
  // Scheduling and Reminders
  schedule: {
    targetCompletionDate: Date,
    dailyGoal: {
      type: Number,
      default: 30 // minutes per day
    },
    weeklyGoal: {
      type: Number,
      default: 210 // minutes per week
    },
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'custom'],
        default: 'daily'
      },
      preferredTime: String // HH:MM format
    }
  },
  
  // Social Features
  social: {
    isPublic: {
      type: Boolean,
      default: true
    },
    shareProgress: {
      type: Boolean,
      default: false
    },
    studyBuddies: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      connectedAt: Date
    }]
  },
  
  // Notes and Bookmarks
  notes: [{
    stepNumber: Number,
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  
  bookmarks: [{
    stepNumber: Number,
    title: String,
    url: String,
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  version: {
    type: Number,
    default: 1
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
userPathProgressSchema.index({ userId: 1, pathId: 1 }, { unique: true });
userPathProgressSchema.index({ userId: 1, status: 1 });
userPathProgressSchema.index({ userId: 1, completed: 1 });
userPathProgressSchema.index({ pathId: 1, completed: 1 });
userPathProgressSchema.index({ userId: 1, lastActivity: -1 });

// Virtual for estimated completion date
userPathProgressSchema.virtual('estimatedCompletionDate').get(function() {
  if (this.completed || !this.schedule.dailyGoal) return null;
  
  const remainingSteps = this.pathId ? 
    this.pathId.totalSteps - this.completedSteps.length : 0;
  
  if (remainingSteps <= 0) return null;
  
  const avgStepTime = this.averageStepTime || 1800; // 30 minutes default
  const remainingTime = remainingSteps * avgStepTime; // in seconds
  const dailyGoalSeconds = this.schedule.dailyGoal * 60;
  const daysNeeded = Math.ceil(remainingTime / dailyGoalSeconds);
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + daysNeeded);
  
  return estimatedDate;
});

// Virtual for current streak
userPathProgressSchema.virtual('currentStreak').get(function() {
  if (!this.completedSteps || this.completedSteps.length === 0) return 0;
  
  const sortedSteps = this.completedSteps.sort((a, b) => 
    new Date(b.completedAt) - new Date(a.completedAt)
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const step of sortedSteps) {
    const stepDate = new Date(step.completedAt);
    stepDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - stepDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= streak + 1) {
      streak++;
      currentDate = stepDate;
    } else {
      break;
    }
  }
  
  return streak;
});

// Pre-save middleware to update progress percentage
userPathProgressSchema.pre('save', async function(next) {
  if (this.isModified('completedSteps') && this.pathId) {
    // Populate path if not already populated
    if (!this.pathId.totalSteps) {
      await this.populate('pathId', 'totalSteps');
    }
    
    if (this.pathId.totalSteps) {
      this.progressPercentage = Math.round(
        (this.completedSteps.length / this.pathId.totalSteps) * 100
      );
      
      // Check if path is completed
      if (this.progressPercentage >= 100 && !this.completed) {
        this.completed = true;
        this.completedAt = new Date();
        this.status = 'completed';
      }
    }
  }
  
  // Update average score
  if (this.isModified('completedSteps') && this.completedSteps.length > 0) {
    const stepsWithScores = this.completedSteps.filter(step => step.score !== undefined);
    if (stepsWithScores.length > 0) {
      const totalScore = stepsWithScores.reduce((sum, step) => sum + step.score, 0);
      this.averageScore = totalScore / stepsWithScores.length;
    }
  }
  
  // Update total XP earned
  if (this.isModified('completedSteps')) {
    this.totalXpEarned = this.completedSteps.reduce((sum, step) => sum + (step.xpEarned || 0), 0);
  }
  
  // Update last activity
  this.lastActivity = new Date();
  
  next();
});

// Method to complete a step
userPathProgressSchema.methods.completeStep = function(stepNumber, stepData = {}) {
  // Check if step is already completed
  const existingStep = this.completedSteps.find(step => step.stepNumber === stepNumber);
  
  if (existingStep) {
    // Update existing step data
    Object.assign(existingStep, stepData);
  } else {
    // Add new completed step
    this.completedSteps.push({
      stepNumber: stepNumber,
      ...stepData
    });
  }
  
  // Update current step to next step
  this.currentStep = Math.max(this.currentStep, stepNumber + 1);
  
  // Update status if this is the first step
  if (this.status === 'enrolled') {
    this.status = 'in-progress';
    this.startedAt = new Date();
  }
};

// Method to add milestone
userPathProgressSchema.methods.addMilestone = function(type, description, xpBonus = 0) {
  this.milestones.push({
    type: type,
    description: description,
    xpBonus: xpBonus,
    achievedAt: new Date()
  });
  
  if (xpBonus > 0) {
    this.totalXpEarned += xpBonus;
  }
};

// Method to get learning analytics
userPathProgressSchema.methods.getAnalytics = function() {
  const analytics = {
    progressPercentage: this.progressPercentage,
    timeSpent: this.totalTimeSpent,
    averageScore: this.averageScore,
    currentStreak: this.currentStreak,
    completedSteps: this.completedSteps.length,
    milestones: this.milestones.length,
    studyPattern: this.studyPattern
  };
  
  // Calculate study consistency
  if (this.completedSteps.length > 1) {
    const dates = this.completedSteps.map(step => 
      new Date(step.completedAt).toDateString()
    );
    const uniqueDates = [...new Set(dates)];
    analytics.studyDays = uniqueDates.length;
    analytics.consistency = uniqueDates.length / this.completedSteps.length;
  }
  
  // Performance trend
  if (this.completedSteps.length >= 3) {
    const recentSteps = this.completedSteps
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
      .slice(-3);
    
    const recentAvg = recentSteps.reduce((sum, step) => sum + (step.score || 0), 0) / recentSteps.length;
    const overallAvg = this.averageScore;
    
    analytics.performanceTrend = recentAvg > overallAvg ? 'improving' : 
                                recentAvg < overallAvg ? 'declining' : 'stable';
  }
  
  return analytics;
};

// Static method to get user's active paths
userPathProgressSchema.statics.getActivePaths = async function(userId) {
  return await this.find({
    userId: userId,
    status: { $in: ['enrolled', 'in-progress'] }
  })
  .populate('pathId', 'title description category difficulty estimatedDuration')
  .sort({ lastActivity: -1 });
};

// Static method to get leaderboard for a specific path
userPathProgressSchema.statics.getPathLeaderboard = async function(pathId, limit = 10) {
  return await this.find({
    pathId: pathId,
    completed: true
  })
  .populate('userId', 'username profile.firstName profile.lastName profile.avatar')
  .sort({ 
    completedAt: 1, // Earlier completion is better
    totalTimeSpent: 1, // Less time is better
    averageScore: -1 // Higher score is better
  })
  .limit(limit);
};

module.exports = mongoose.model('UserPathProgress', userPathProgressSchema);

