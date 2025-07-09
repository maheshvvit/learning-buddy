const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Badge name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Badge name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Badge description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [150, 'Short description cannot exceed 150 characters']
  },

  // Visual Design
  icon: {
    type: String,
    required: [true, 'Badge icon is required']
  },
  color: {
    primary: {
      type: String,
      default: '#FFD700' // Gold
    },
    secondary: {
      type: String,
      default: '#FFA500' // Orange
    },
    background: {
      type: String,
      default: '#FFFFFF' // White
    }
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },

  // Badge Category and Type
  category: {
    type: String,
    required: true,
    enum: [
      'achievement', 'milestone', 'skill', 'streak', 'social', 
      'special', 'seasonal', 'challenge', 'learning', 'participation'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: [
      'progress', 'performance', 'consistency', 'exploration', 
      'mastery', 'community', 'time-based', 'event'
    ]
  },

  // Earning Criteria
  criteria: {
    // XP-based criteria
    xpThreshold: Number,
    totalXpRequired: Number,
    
    // Challenge-based criteria
    challengesCompleted: Number,
    challengeCategory: String,
    challengeDifficulty: String,
    perfectScores: Number,
    
    // Streak-based criteria
    streakDays: Number,
    consecutiveLogins: Number,
    
    // Time-based criteria
    totalTimeSpent: Number, // in minutes
    dailyTimeGoal: Number,
    
    // Performance-based criteria
    averageScore: Number,
    minimumScore: Number,
    
    // Social criteria
    helpOthers: Number,
    receiveLikes: Number,
    
    // Special criteria
    specialConditions: [{
      type: String,
      value: mongoose.Schema.Types.Mixed,
      description: String
    }]
  },

  // Rewards
  rewards: {
    xpBonus: {
      type: Number,
      default: 0
    },
    unlockFeatures: [String],
    customization: {
      profileBorder: String,
      profileBadge: String,
      specialTitle: String
    }
  },

  // Availability and Timing
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: Date,
    endDate: Date,
    isLimited: {
      type: Boolean,
      default: false
    },
    maxRecipients: Number,
    currentRecipients: {
      type: Number,
      default: 0
    }
  },

  // Badge Progression (for tiered badges)
  progression: {
    isProgressive: {
      type: Boolean,
      default: false
    },
    tier: {
      type: Number,
      default: 1,
      min: 1
    },
    nextTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    previousTier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    }
  },

  // Statistics
  statistics: {
    totalEarned: {
      type: Number,
      default: 0
    },
    uniqueEarners: {
      type: Number,
      default: 0
    },
    averageTimeToEarn: {
      type: Number,
      default: 0 // in days
    },
    firstEarnedAt: Date,
    lastEarnedAt: Date
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isSystemBadge: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
badgeSchema.index({ category: 1, type: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ 'availability.isActive': 1 });
badgeSchema.index({ 'statistics.totalEarned': -1 });
badgeSchema.index({ createdAt: -1 });

// Virtual for rarity score (for sorting)
badgeSchema.virtual('rarityScore').get(function() {
  const scores = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
  return scores[this.rarity] || 1;
});

// Virtual for earning rate
badgeSchema.virtual('statistics.earningRate').get(function() {
  if (!this.createdAt || this.statistics.totalEarned === 0) return 0;
  
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return this.statistics.totalEarned / daysSinceCreation;
});

// Method to check if user meets badge criteria
badgeSchema.methods.checkCriteria = async function(userId) {
  const User = mongoose.model('User');
  const UserProgress = mongoose.model('UserProgress');
  
  const user = await User.findById(userId);
  if (!user) return false;

  const criteria = this.criteria;
  
  // XP-based checks
  if (criteria.xpThreshold && user.gamification.xp < criteria.xpThreshold) {
    return false;
  }
  
  if (criteria.totalXpRequired && user.gamification.totalXp < criteria.totalXpRequired) {
    return false;
  }
  
  // Challenge-based checks
  if (criteria.challengesCompleted) {
    const query = { userId: userId, completed: true };
    
    if (criteria.challengeCategory) {
      // Need to populate challenge to check category
      const completedChallenges = await UserProgress.find(query)
        .populate('challengeId', 'category difficulty');
      
      const categoryCount = completedChallenges.filter(
        p => p.challengeId && p.challengeId.category === criteria.challengeCategory
      ).length;
      
      if (categoryCount < criteria.challengesCompleted) {
        return false;
      }
    } else {
      const totalCompleted = await UserProgress.countDocuments(query);
      if (totalCompleted < criteria.challengesCompleted) {
        return false;
      }
    }
  }
  
  // Perfect scores check
  if (criteria.perfectScores) {
    const perfectScoreCount = await UserProgress.countDocuments({
      userId: userId,
      completed: true,
      percentage: 100
    });
    
    if (perfectScoreCount < criteria.perfectScores) {
      return false;
    }
  }
  
  // Streak-based checks
  if (criteria.streakDays && user.gamification.streak.current < criteria.streakDays) {
    return false;
  }
  
  // Performance-based checks
  if (criteria.averageScore) {
    const userProgress = await UserProgress.find({ userId: userId, completed: true });
    if (userProgress.length === 0) return false;
    
    const avgScore = userProgress.reduce((sum, p) => sum + p.percentage, 0) / userProgress.length;
    if (avgScore < criteria.averageScore) {
      return false;
    }
  }
  
  // Time-based checks
  if (criteria.totalTimeSpent && user.statistics.totalTimeSpent < criteria.totalTimeSpent) {
    return false;
  }
  
  return true;
};

// Method to award badge to user
badgeSchema.methods.awardToUser = async function(userId) {
  const User = mongoose.model('User');
  
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Check if user already has this badge
    const alreadyHas = user.gamification.badges.some(
      badge => badge.badgeId.toString() === this._id.toString()
    );
    
    if (alreadyHas) {
      return { success: false, message: 'User already has this badge' };
    }
    
    // Add badge to user
    user.gamification.badges.push({
      badgeId: this._id,
      earnedAt: new Date()
    });
    
    // Add XP bonus if applicable
    if (this.rewards.xpBonus > 0) {
      user.addXP(this.rewards.xpBonus);
    }
    
    await user.save();
    
    // Update badge statistics
    this.statistics.totalEarned += 1;
    this.statistics.lastEarnedAt = new Date();
    
    if (!this.statistics.firstEarnedAt) {
      this.statistics.firstEarnedAt = new Date();
    }
    
    // Update unique earners count
    const uniqueEarners = await User.countDocuments({
      'gamification.badges.badgeId': this._id
    });
    this.statistics.uniqueEarners = uniqueEarners;
    
    await this.save();
    
    return { 
      success: true, 
      message: 'Badge awarded successfully',
      xpBonus: this.rewards.xpBonus
    };
    
  } catch (error) {
    console.error('Error awarding badge:', error);
    return { success: false, message: error.message };
  }
};

// Static method to check and award eligible badges to user
badgeSchema.statics.checkAndAwardBadges = async function(userId) {
  const activeBadges = await this.find({ 'availability.isActive': true });
  const awardedBadges = [];
  
  for (const badge of activeBadges) {
    const meetsRequirements = await badge.checkCriteria(userId);
    
    if (meetsRequirements) {
      const result = await badge.awardToUser(userId);
      if (result.success) {
        awardedBadges.push({
          badge: badge,
          xpBonus: result.xpBonus
        });
      }
    }
  }
  
  return awardedBadges;
};

// Static method to get badge leaderboard
badgeSchema.statics.getLeaderboard = async function(limit = 10) {
  const User = mongoose.model('User');
  
  const pipeline = [
    { $unwind: '$gamification.badges' },
    {
      $group: {
        _id: '$_id',
        username: { $first: '$username' },
        profile: { $first: '$profile' },
        badgeCount: { $sum: 1 },
        badges: { $push: '$gamification.badges' }
      }
    },
    { $sort: { badgeCount: -1 } },
    { $limit: limit }
  ];
  
  return await User.aggregate(pipeline);
};

module.exports = mongoose.model('Badge', badgeSchema);

