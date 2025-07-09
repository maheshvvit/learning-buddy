const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    dateOfBirth: Date,
    location: String,
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  // Learning Preferences
  learningPreferences: {
    subjects: [{
      type: String,
      enum: ['programming', 'mathematics', 'science', 'languages', 'arts', 'business', 'other']
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    },
    dailyGoal: {
      type: Number,
      default: 30, // minutes
      min: [5, 'Daily goal must be at least 5 minutes'],
      max: [480, 'Daily goal cannot exceed 8 hours']
    },
    preferredTimes: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }]
  },

  // Gamification Data
  gamification: {
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0,
        min: 0
      },
      longest: {
        type: Number,
        default: 0,
        min: 0
      },
      lastActivity: Date
    },
    badges: [{
      badgeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
      },
      earnedAt: {
        type: Date,
        default: Date.now
      }
    }],
    achievements: [{
      name: String,
      description: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      xpReward: Number
    }]
  },

  // Learning Statistics
  statistics: {
    totalTimeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    challengesCompleted: {
      type: Number,
      default: 0
    },
    challengesAttempted: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    subjectProgress: [{
      subject: String,
      level: {
        type: Number,
        default: 1
      },
      xp: {
        type: Number,
        default: 0
      },
      timeSpent: {
        type: Number,
        default: 0
      }
    }]
  },

  // Account Settings
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      dailyReminder: {
        type: Boolean,
        default: true
      },
      achievementAlerts: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showInLeaderboard: {
        type: Boolean,
        default: true
      }
    },
    accessibility: {
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      screenReader: {
        type: Boolean,
        default: false
      }
    }
  },

  // Account Status
  role: {
    type: String,
    enum: ['learner', 'admin'],
    default: 'learner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  
  // Verification and Reset Tokens
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'gamification.xp': -1 });
userSchema.index({ 'gamification.level': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.firstName || this.profile.lastName || this.username;
});

// Virtual for XP needed for next level
userSchema.virtual('gamification.xpToNextLevel').get(function() {
  const currentLevel = this.gamification.level;
  const xpForNextLevel = currentLevel * 1000; // 1000 XP per level
  return xpForNextLevel - this.gamification.xp;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update XP and level
userSchema.methods.addXP = function(xpAmount) {
  this.gamification.xp += xpAmount;
  this.gamification.totalXp += xpAmount;
  
  // Level up logic
  const newLevel = Math.floor(this.gamification.totalXp / 1000) + 1;
  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
    return { leveledUp: true, newLevel };
  }
  
  return { leveledUp: false, newLevel: this.gamification.level };
};

// Method to update streak
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = this.gamification.streak.lastActivity;
  
  if (!lastActivity) {
    this.gamification.streak.current = 1;
    this.gamification.streak.lastActivity = today;
    return;
  }
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.gamification.streak.current += 1;
    if (this.gamification.streak.current > this.gamification.streak.longest) {
      this.gamification.streak.longest = this.gamification.streak.current;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.gamification.streak.current = 1;
  }
  // If daysDiff === 0, same day, no change needed
  
  this.gamification.streak.lastActivity = today;
};

module.exports = mongoose.model('User', userSchema);

