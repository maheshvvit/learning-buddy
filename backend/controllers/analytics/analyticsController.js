const { User, UserProgress, UserPathProgress, Challenge, LearningPath, ChatSession } = require('../../models');

// Get user dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const timeframe = parseInt(req.query.timeframe) || 30; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Get user data
    const user = await User.findById(userId);

    // Get challenge analytics
    const challengeAnalytics = await UserProgress.getUserAnalytics(userId, timeframe);

    // Get learning path progress
    const activePaths = await UserPathProgress.getActivePaths(userId);
    const completedPaths = await UserPathProgress.countDocuments({
      userId,
      completed: true
    });

    // Get recent activity
    const recentChallenges = await UserProgress.find({
      userId,
      completedAt: { $gte: startDate }
    })
    .populate('challengeId', 'title category')
    .sort({ completedAt: -1 })
    .limit(5);

    // Calculate streak information
    const streakData = calculateStreakData(user);

    // Get learning goals progress
    const goalsProgress = await calculateGoalsProgress(userId, user.learningPreferences);

    // Performance trends
    const performanceTrends = await calculatePerformanceTrends(userId, timeframe);

    const analytics = {
      overview: {
        level: user.gamification.level,
        xp: user.gamification.xp,
        totalXp: user.gamification.totalXp,
        xpToNextLevel: user.gamification.xpToNextLevel,
        badgeCount: user.gamification.badges.length,
        currentStreak: user.gamification.streak.current,
        longestStreak: user.gamification.streak.longest
      },
      challenges: challengeAnalytics,
      learningPaths: {
        active: activePaths.length,
        completed: completedPaths,
        totalEnrolled: await UserPathProgress.countDocuments({ userId })
      },
      recentActivity: recentChallenges,
      streakData,
      goalsProgress,
      performanceTrends,
      timeframe
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get detailed learning analytics
const getLearningAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const timeframe = parseInt(req.query.timeframe) || 90; // days
    const category = req.query.category;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // Build query
    const query = {
      userId,
      completedAt: { $gte: startDate }
    };

    // Get progress data
    let progress = await UserProgress.find(query)
      .populate('challengeId', 'title category difficulty type scoring')
      .sort({ completedAt: 1 });

    // Filter by category if specified
    if (category) {
      progress = progress.filter(p => p.challengeId?.category === category);
    }

    // Calculate detailed analytics
    const analytics = {
      totalChallenges: progress.length,
      averageScore: progress.length > 0 ? 
        progress.reduce((sum, p) => sum + p.percentage, 0) / progress.length : 0,
      totalTimeSpent: progress.reduce((sum, p) => sum + p.timeSpent, 0),
      totalXpEarned: progress.reduce((sum, p) => sum + p.totalXpEarned, 0),
      
      // Performance by category
      categoryBreakdown: calculateCategoryBreakdown(progress),
      
      // Performance by difficulty
      difficultyBreakdown: calculateDifficultyBreakdown(progress),
      
      // Time-based analytics
      dailyActivity: calculateDailyActivity(progress),
      weeklyProgress: calculateWeeklyProgress(progress),
      
      // Learning patterns
      learningPatterns: analyzeLearningPatterns(progress),
      
      // Improvement areas
      improvementAreas: identifyImprovementAreas(progress),
      
      // Achievements and milestones
      achievements: calculateAchievements(progress)
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get learning analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get progress comparison
const getProgressComparison = async (req, res) => {
  try {
    const userId = req.user._id;
    const compareWith = req.query.compareWith || 'peers'; // 'peers', 'global', 'previous'
    const timeframe = parseInt(req.query.timeframe) || 30;

    const user = await User.findById(userId);
    const userAnalytics = await UserProgress.getUserAnalytics(userId, timeframe);

    let comparisonData = {};

    if (compareWith === 'peers') {
      // Compare with users of similar level
      const levelRange = [user.gamification.level - 2, user.gamification.level + 2];
      comparisonData = await getPeerComparison(userId, levelRange, timeframe);
    } else if (compareWith === 'global') {
      // Compare with all users
      comparisonData = await getGlobalComparison(userId, timeframe);
    } else if (compareWith === 'previous') {
      // Compare with user's previous period
      comparisonData = await getPreviousPeriodComparison(userId, timeframe);
    }

    res.json({
      success: true,
      data: {
        userAnalytics,
        comparisonData,
        compareWith,
        timeframe
      }
    });

  } catch (error) {
    console.error('Get progress comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get system-wide analytics (admin only)
const getSystemAnalytics = async (req, res) => {
  try {
    const timeframe = parseInt(req.query.timeframe) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);

    // User analytics
    const totalUsers = await User.countDocuments({ isActive: true });
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
      isActive: true
    });

    // Challenge analytics
    const totalChallenges = await Challenge.countDocuments({ isActive: true });
    const challengeAttempts = await UserProgress.countDocuments({
      createdAt: { $gte: startDate }
    });
    const challengeCompletions = await UserProgress.countDocuments({
      completedAt: { $gte: startDate },
      completed: true
    });

    // Learning path analytics
    const totalPaths = await LearningPath.countDocuments({ isActive: true });
    const pathEnrollments = await UserPathProgress.countDocuments({
      enrolledAt: { $gte: startDate }
    });

    // Chat analytics
    const chatAnalytics = await ChatSession.getGlobalAnalytics(timeframe);

    // Popular content
    const popularChallenges = await Challenge.find({ isActive: true })
      .sort({ 'statistics.totalAttempts': -1 })
      .limit(10)
      .select('title category statistics');

    const popularPaths = await LearningPath.find({ isActive: true })
      .sort({ 'statistics.enrollments': -1 })
      .limit(10)
      .select('title category statistics');

    // User engagement metrics
    const engagementMetrics = await calculateEngagementMetrics(timeframe);

    const analytics = {
      users: {
        total: totalUsers,
        new: newUsers,
        growth: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0
      },
      challenges: {
        total: totalChallenges,
        attempts: challengeAttempts,
        completions: challengeCompletions,
        completionRate: challengeAttempts > 0 ? (challengeCompletions / challengeAttempts) * 100 : 0
      },
      learningPaths: {
        total: totalPaths,
        enrollments: pathEnrollments
      },
      chat: chatAnalytics[0] || {},
      popularContent: {
        challenges: popularChallenges,
        paths: popularPaths
      },
      engagement: engagementMetrics,
      timeframe
    };

    res.json({
      success: true,
      data: { analytics }
    });

  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user._id;
    const format = req.query.format || 'json'; // 'json', 'csv'

    // Get all user data
    const user = await User.findById(userId).select('-password');
    const challenges = await UserProgress.find({ userId })
      .populate('challengeId', 'title category difficulty');
    const paths = await UserPathProgress.find({ userId })
      .populate('pathId', 'title category');
    const chatSessions = await ChatSession.find({ userId })
      .select('-messages.metadata'); // Exclude sensitive metadata

    const userData = {
      profile: user,
      challengeHistory: challenges,
      learningPaths: paths,
      chatSessions: chatSessions,
      exportedAt: new Date().toISOString()
    };

    if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csv = convertToCSV(userData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=learning-buddy-data.csv');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=learning-buddy-data.json');
      res.json({
        success: true,
        data: userData
      });
    }

  } catch (error) {
    console.error('Export user data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export user data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions

const calculateStreakData = (user) => {
  const today = new Date();
  const lastActivity = user.gamification.streak.lastActivity;
  
  let streakStatus = 'active';
  if (!lastActivity) {
    streakStatus = 'none';
  } else {
    const daysSinceActivity = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity > 1) {
      streakStatus = 'broken';
    } else if (daysSinceActivity === 1) {
      streakStatus = 'at-risk';
    }
  }

  return {
    current: user.gamification.streak.current,
    longest: user.gamification.streak.longest,
    status: streakStatus,
    lastActivity: lastActivity
  };
};

const calculateGoalsProgress = async (userId, preferences) => {
  const dailyGoal = preferences.dailyGoal || 30; // minutes
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayProgress = await UserProgress.find({
    userId,
    completedAt: { $gte: today }
  });

  const todayTimeSpent = todayProgress.reduce((sum, p) => sum + (p.timeSpent / 60), 0); // Convert to minutes

  return {
    dailyGoal,
    todayProgress: Math.min(todayTimeSpent, dailyGoal),
    percentage: Math.min((todayTimeSpent / dailyGoal) * 100, 100),
    achieved: todayTimeSpent >= dailyGoal
  };
};

const calculatePerformanceTrends = async (userId, timeframe) => {
  const progress = await UserProgress.find({
    userId,
    completedAt: { $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) }
  }).sort({ completedAt: 1 });

  if (progress.length < 2) {
    return { trend: 'insufficient-data', change: 0 };
  }

  const firstHalf = progress.slice(0, Math.floor(progress.length / 2));
  const secondHalf = progress.slice(Math.floor(progress.length / 2));

  const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p.percentage, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p.percentage, 0) / secondHalf.length;

  const change = secondHalfAvg - firstHalfAvg;
  let trend = 'stable';
  
  if (change > 5) trend = 'improving';
  else if (change < -5) trend = 'declining';

  return { trend, change: Math.round(change * 100) / 100 };
};

const calculateCategoryBreakdown = (progress) => {
  const breakdown = {};
  
  progress.forEach(p => {
    const category = p.challengeId?.category || 'unknown';
    if (!breakdown[category]) {
      breakdown[category] = {
        count: 0,
        totalScore: 0,
        totalTime: 0
      };
    }
    
    breakdown[category].count++;
    breakdown[category].totalScore += p.percentage;
    breakdown[category].totalTime += p.timeSpent;
  });

  // Calculate averages
  Object.keys(breakdown).forEach(category => {
    const data = breakdown[category];
    data.averageScore = data.totalScore / data.count;
    data.averageTime = data.totalTime / data.count;
  });

  return breakdown;
};

const calculateDifficultyBreakdown = (progress) => {
  const breakdown = {};
  
  progress.forEach(p => {
    const difficulty = p.challengeId?.difficulty || 'unknown';
    if (!breakdown[difficulty]) {
      breakdown[difficulty] = {
        count: 0,
        totalScore: 0,
        averageScore: 0
      };
    }
    
    breakdown[difficulty].count++;
    breakdown[difficulty].totalScore += p.percentage;
  });

  // Calculate averages
  Object.keys(breakdown).forEach(difficulty => {
    const data = breakdown[difficulty];
    data.averageScore = data.totalScore / data.count;
  });

  return breakdown;
};

const calculateDailyActivity = (progress) => {
  const dailyActivity = {};
  
  progress.forEach(p => {
    const date = p.completedAt.toISOString().split('T')[0];
    if (!dailyActivity[date]) {
      dailyActivity[date] = {
        challenges: 0,
        totalTime: 0,
        totalXp: 0
      };
    }
    
    dailyActivity[date].challenges++;
    dailyActivity[date].totalTime += p.timeSpent;
    dailyActivity[date].totalXp += p.totalXpEarned;
  });

  return dailyActivity;
};

const calculateWeeklyProgress = (progress) => {
  const weeklyProgress = {};
  
  progress.forEach(p => {
    const week = getWeekNumber(p.completedAt);
    if (!weeklyProgress[week]) {
      weeklyProgress[week] = {
        challenges: 0,
        averageScore: 0,
        totalScore: 0
      };
    }
    
    weeklyProgress[week].challenges++;
    weeklyProgress[week].totalScore += p.percentage;
  });

  // Calculate averages
  Object.keys(weeklyProgress).forEach(week => {
    const data = weeklyProgress[week];
    data.averageScore = data.totalScore / data.challenges;
  });

  return weeklyProgress;
};

const analyzeLearningPatterns = (progress) => {
  if (progress.length === 0) return {};

  // Analyze time patterns
  const hourCounts = {};
  progress.forEach(p => {
    const hour = p.completedAt.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  const preferredHour = Object.keys(hourCounts).reduce((a, b) => 
    hourCounts[a] > hourCounts[b] ? a : b
  );

  // Analyze session lengths
  const sessionLengths = progress.map(p => p.timeSpent);
  const averageSessionLength = sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length;

  return {
    preferredStudyHour: parseInt(preferredHour),
    averageSessionLength: Math.round(averageSessionLength),
    totalSessions: progress.length
  };
};

const identifyImprovementAreas = (progress) => {
  const categoryPerformance = calculateCategoryBreakdown(progress);
  const improvementAreas = [];

  Object.entries(categoryPerformance).forEach(([category, data]) => {
    if (data.averageScore < 70 && data.count >= 3) {
      improvementAreas.push({
        area: category,
        averageScore: Math.round(data.averageScore),
        challengeCount: data.count,
        priority: data.averageScore < 50 ? 'high' : 'medium'
      });
    }
  });

  return improvementAreas.sort((a, b) => a.averageScore - b.averageScore);
};

const calculateAchievements = (progress) => {
  const achievements = [];

  // Perfect scores
  const perfectScores = progress.filter(p => p.percentage === 100).length;
  if (perfectScores > 0) {
    achievements.push({
      type: 'perfect_scores',
      count: perfectScores,
      description: `Achieved ${perfectScores} perfect score${perfectScores > 1 ? 's' : ''}`
    });
  }

  // Fast completions
  const fastCompletions = progress.filter(p => 
    p.timeSpent < (p.estimatedTime * 60 * 0.8)
  ).length;
  
  if (fastCompletions > 0) {
    achievements.push({
      type: 'fast_completions',
      count: fastCompletions,
      description: `Completed ${fastCompletions} challenge${fastCompletions > 1 ? 's' : ''} faster than expected`
    });
  }

  return achievements;
};

const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

const getPeerComparison = async (userId, levelRange, timeframe) => {
  // Implementation for peer comparison
  return { message: 'Peer comparison data' };
};

const getGlobalComparison = async (userId, timeframe) => {
  // Implementation for global comparison
  return { message: 'Global comparison data' };
};

const getPreviousPeriodComparison = async (userId, timeframe) => {
  // Implementation for previous period comparison
  return { message: 'Previous period comparison data' };
};

const calculateEngagementMetrics = async (timeframe) => {
  // Implementation for engagement metrics
  return { message: 'Engagement metrics data' };
};

const convertToCSV = (userData) => {
  // Simple CSV conversion - in production, use a proper CSV library
  return 'CSV data would be generated here';
};

module.exports = {
  getDashboardAnalytics,
  getLearningAnalytics,
  getProgressComparison,
  getSystemAnalytics,
  exportUserData
};

