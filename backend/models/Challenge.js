const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Challenge title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Challenge description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Challenge Classification
  type: {
    type: String,
    required: true,
    enum: ['quiz', 'coding', 'essay', 'project', 'interactive', 'video-quiz']
  },
  category: {
    type: String,
    required: true,
    enum: ['programming', 'mathematics', 'science', 'languages', 'arts', 'business', 'other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Difficulty and Prerequisites
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  estimatedTime: {
    type: Number, // in minutes
    required: true,
    min: [1, 'Estimated time must be at least 1 minute']
  },
  prerequisites: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    required: {
      type: Boolean,
      default: true
    }
  }],

  // Content Structure
  content: {
    // For quiz challenges
    questions: [{
      id: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'fill-blank', 'short-answer', 'code']
      },
      question: String,
      options: [String], // For multiple choice
      correctAnswer: mongoose.Schema.Types.Mixed, // Can be string, number, or array
      explanation: String,
      points: {
        type: Number,
        default: 1
      },
      hints: [String],
      codeTemplate: String, // For coding questions
      testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: {
          type: Boolean,
          default: false
        }
      }]
    }],

    // For coding challenges
    codingChallenge: {
      problemStatement: String,
      inputFormat: String,
      outputFormat: String,
      constraints: String,
      examples: [{
        input: String,
        output: String,
        explanation: String
      }],
      starterCode: {
        javascript: String,
        python: String,
        java: String,
        cpp: String
      },
      testCases: [{
        input: String,
        expectedOutput: String,
        isHidden: {
          type: Boolean,
          default: false
        },
        points: {
          type: Number,
          default: 1
        }
      }],
      timeLimit: {
        type: Number,
        default: 5000 // milliseconds
      },
      memoryLimit: {
        type: Number,
        default: 128 // MB
      }
    },

    // For essay/project challenges
    essayPrompt: {
      prompt: String,
      minWords: Number,
      maxWords: Number,
      rubric: [{
        criteria: String,
        description: String,
        maxPoints: Number
      }]
    },

    // For interactive challenges
    interactiveContent: {
      htmlContent: String,
      cssStyles: String,
      jsCode: String,
      resources: [{
        type: String, // 'image', 'video', 'audio', 'document'
        url: String,
        description: String
      }]
    }
  },

  // Scoring and Rewards
  scoring: {
    maxPoints: {
      type: Number,
      required: true,
      min: [1, 'Max points must be at least 1']
    },
    passingScore: {
      type: Number,
      required: true,
      min: [0, 'Passing score cannot be negative']
    },
    xpReward: {
      type: Number,
      required: true,
      min: [1, 'XP reward must be at least 1']
    },
    bonusXp: {
      perfectScore: Number,
      fastCompletion: Number, // XP for completing under estimated time
      firstAttempt: Number
    }
  },

  // Adaptive Learning
  adaptiveSettings: {
    adjustDifficulty: {
      type: Boolean,
      default: false
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    averageAttempts: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    }
  },

  // Metadata
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },

  // Statistics
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    difficultyRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    qualityRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },

  // Scheduling and Availability
  availability: {
    startDate: Date,
    endDate: Date,
    isTimeLimited: {
      type: Boolean,
      default: false
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ type: 1 });
challengeSchema.index({ tags: 1 });
challengeSchema.index({ isPublished: 1, isActive: 1 });
challengeSchema.index({ 'statistics.averageScore': -1 });
challengeSchema.index({ 'statistics.qualityRating': -1 });
challengeSchema.index({ createdAt: -1 });

// Virtual for completion rate
challengeSchema.virtual('statistics.completionRate').get(function() {
  if (this.statistics.totalAttempts === 0) return 0;
  return (this.statistics.totalCompletions / this.statistics.totalAttempts) * 100;
});

// Virtual for difficulty level numeric value
challengeSchema.virtual('difficultyLevel').get(function() {
  const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  return levels[this.difficulty] || 1;
});

// Method to update statistics
challengeSchema.methods.updateStatistics = function(attemptData) {
  this.statistics.totalAttempts += 1;
  
  if (attemptData.completed) {
    this.statistics.totalCompletions += 1;
  }
  
  // Update average score
  const totalScore = this.statistics.averageScore * (this.statistics.totalAttempts - 1) + attemptData.score;
  this.statistics.averageScore = totalScore / this.statistics.totalAttempts;
  
  // Update average time
  if (attemptData.timeSpent) {
    const totalTime = this.statistics.averageTime * (this.statistics.totalAttempts - 1) + attemptData.timeSpent;
    this.statistics.averageTime = totalTime / this.statistics.totalAttempts;
  }
};

// Method to check if user meets prerequisites
challengeSchema.methods.checkPrerequisites = async function(userId) {
  if (!this.prerequisites || this.prerequisites.length === 0) {
    return { met: true, missing: [] };
  }

  const UserProgress = mongoose.model('UserProgress');
  const missing = [];

  for (const prereq of this.prerequisites) {
    if (prereq.required) {
      const progress = await UserProgress.findOne({
        userId: userId,
        challengeId: prereq.challengeId,
        completed: true
      });

      if (!progress) {
        missing.push(prereq.challengeId);
      }
    }
  }

  return {
    met: missing.length === 0,
    missing: missing
  };
};

// Static method to get recommended challenges
challengeSchema.statics.getRecommendedChallenges = async function(userId, limit = 10) {
  const User = mongoose.model('User');
  const UserProgress = mongoose.model('UserProgress');
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get completed challenges
  const completedChallenges = await UserProgress.find({
    userId: userId,
    completed: true
  }).distinct('challengeId');

  // Build recommendation query
  const query = {
    _id: { $nin: completedChallenges },
    isPublished: true,
    isActive: true,
    category: { $in: user.learningPreferences.subjects }
  };

  // Adjust difficulty based on user level
  const userLevel = user.gamification.level;
  if (userLevel <= 5) {
    query.difficulty = { $in: ['beginner', 'intermediate'] };
  } else if (userLevel <= 15) {
    query.difficulty = { $in: ['intermediate', 'advanced'] };
  } else {
    query.difficulty = { $in: ['advanced', 'expert'] };
  }

  return await this.find(query)
    .sort({ 'statistics.qualityRating': -1, 'statistics.completionRate': -1 })
    .limit(limit)
    .populate('author', 'username profile.firstName profile.lastName');
};

module.exports = mongoose.model('Challenge', challengeSchema);

