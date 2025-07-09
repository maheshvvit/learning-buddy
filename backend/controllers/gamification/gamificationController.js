const { Badge, User, UserProgress } = require('../../models');

// Get all badges
const getBadges = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 'availability.isActive': true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.rarity) {
      query.rarity = req.query.rarity;
    }
    
    if (req.query.type) {
      query.type = req.query.type;
    }

    const badges = await Badge.find(query)
      .sort({ rarity: -1, 'statistics.totalEarned': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Badge.countDocuments(query);

    // If user is authenticated, check which badges they have
    let userBadges = [];
    if (req.user) {
      userBadges = req.user.gamification.badges.map(b => b.badgeId.toString());
    }

    res.json({
      success: true,
      data: {
        badges: badges.map(badge => ({
          ...badge.toObject(),
          earned: userBadges.includes(badge._id.toString())
        })),
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get badge by ID
const getBadgeById = async (req, res) => {
  try {
    const { badgeId } = req.params;

    const badge = await Badge.findById(badgeId);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    // Check if user has this badge
    let earned = false;
    let earnedAt = null;
    
    if (req.user) {
      const userBadge = req.user.gamification.badges.find(
        b => b.badgeId.toString() === badgeId
      );
      
      if (userBadge) {
        earned = true;
        earnedAt = userBadge.earnedAt;
      }
    }

    res.json({
      success: true,
      data: {
        badge,
        earned,
        earnedAt
      }
    });

  } catch (error) {
    console.error('Get badge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's badges
const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await User.findById(userId)
      .populate('gamification.badges.badgeId', 'name description icon rarity category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort badges by rarity and earned date
    const badges = user.gamification.badges
      .sort((a, b) => {
        const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        const rarityA = rarityOrder[a.badgeId.rarity] || 0;
        const rarityB = rarityOrder[b.badgeId.rarity] || 0;
        
        if (rarityA !== rarityB) {
          return rarityB - rarityA; // Higher rarity first
        }
        
        return new Date(b.earnedAt) - new Date(a.earnedAt); // More recent first
      });

    res.json({
      success: true,
      data: {
        badges,
        totalBadges: badges.length,
        badgesByRarity: {
          legendary: badges.filter(b => b.badgeId.rarity === 'legendary').length,
          epic: badges.filter(b => b.badgeId.rarity === 'epic').length,
          rare: badges.filter(b => b.badgeId.rarity === 'rare').length,
          uncommon: badges.filter(b => b.badgeId.rarity === 'uncommon').length,
          common: badges.filter(b => b.badgeId.rarity === 'common').length
        }
      }
    });

  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user badges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const type = req.query.type || 'xp'; // 'xp', 'level', 'badges', 'challenges'
    const limit = parseInt(req.query.limit) || 50;
    const timeframe = req.query.timeframe || 'all'; // 'all', 'week', 'month'

    let matchStage = {
      isActive: true,
      'settings.privacy.showInLeaderboard': { $ne: false }
    };

    // Add timeframe filter if needed
    if (timeframe !== 'all') {
      const startDate = new Date();
      if (timeframe === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      // For timeframe-based leaderboards, we need to aggregate recent activity
      // This is a simplified version - in production, you'd want to track daily/weekly stats
    }

    let sortStage;
    let groupStage = null;

    switch (type) {
      case 'level':
        sortStage = { 'gamification.level': -1, 'gamification.xp': -1 };
        break;
      case 'badges':
        // Use aggregation to count badges
        groupStage = [
          { $match: matchStage },
          { $unwind: '$gamification.badges' },
          {
            $group: {
              _id: '$_id',
              username: { $first: '$username' },
              profile: { $first: '$profile' },
              gamification: { $first: '$gamification' },
              badgeCount: { $sum: 1 }
            }
          },
          { $sort: { badgeCount: -1, 'gamification.totalXp': -1 } },
          { $limit: limit }
        ];
        break;
      case 'challenges':
        sortStage = { 'statistics.challengesCompleted': -1, 'gamification.totalXp': -1 };
        break;
      default: // xp
        sortStage = { 'gamification.totalXp': -1, 'gamification.level': -1 };
    }

    let leaderboard;

    if (groupStage) {
      leaderboard = await User.aggregate(groupStage);
    } else {
      leaderboard = await User.find(matchStage)
        .select('username profile.firstName profile.lastName profile.avatar gamification statistics')
        .sort(sortStage)
        .limit(limit);
    }

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      user: user
    }));

    // Find current user's rank if authenticated
    let currentUserRank = null;
    if (req.user) {
      const userIndex = rankedLeaderboard.findIndex(
        entry => entry.user._id.toString() === req.user._id.toString()
      );
      
      if (userIndex !== -1) {
        currentUserRank = userIndex + 1;
      } else {
        // User not in top results, find their actual rank
        let userRankQuery;
        if (type === 'level') {
          userRankQuery = {
            $or: [
              { 'gamification.level': { $gt: req.user.gamification.level } },
              {
                'gamification.level': req.user.gamification.level,
                'gamification.xp': { $gt: req.user.gamification.xp }
              }
            ]
          };
        } else if (type === 'challenges') {
          userRankQuery = {
            $or: [
              { 'statistics.challengesCompleted': { $gt: req.user.statistics.challengesCompleted } },
              {
                'statistics.challengesCompleted': req.user.statistics.challengesCompleted,
                'gamification.totalXp': { $gt: req.user.gamification.totalXp }
              }
            ]
          };
        } else { // xp
          userRankQuery = {
            $or: [
              { 'gamification.totalXp': { $gt: req.user.gamification.totalXp } },
              {
                'gamification.totalXp': req.user.gamification.totalXp,
                'gamification.level': { $gt: req.user.gamification.level }
              }
            ]
          };
        }

        const usersAhead = await User.countDocuments({
          ...matchStage,
          ...userRankQuery
        });
        
        currentUserRank = usersAhead + 1;
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        type,
        timeframe,
        currentUserRank
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's gamification stats
const getGamificationStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await User.findById(userId)
      .populate('gamification.badges.badgeId', 'name icon rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate additional stats
    const stats = {
      level: user.gamification.level,
      xp: user.gamification.xp,
      totalXp: user.gamification.totalXp,
      xpToNextLevel: user.gamification.xpToNextLevel,
      currentStreak: user.gamification.streak.current,
      longestStreak: user.gamification.streak.longest,
      badges: {
        total: user.gamification.badges.length,
        byRarity: {
          legendary: user.gamification.badges.filter(b => b.badgeId.rarity === 'legendary').length,
          epic: user.gamification.badges.filter(b => b.badgeId.rarity === 'epic').length,
          rare: user.gamification.badges.filter(b => b.badgeId.rarity === 'rare').length,
          uncommon: user.gamification.badges.filter(b => b.badgeId.rarity === 'uncommon').length,
          common: user.gamification.badges.filter(b => b.badgeId.rarity === 'common').length
        }
      },
      achievements: user.gamification.achievements.length,
      challengesCompleted: user.statistics.challengesCompleted,
      averageScore: user.statistics.averageScore,
      totalTimeSpent: user.statistics.totalTimeSpent
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get gamification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gamification stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check for new badges (manual trigger)
const checkBadges = async (req, res) => {
  try {
    const userId = req.user._id;

    const newBadges = await Badge.checkAndAwardBadges(userId);

    res.json({
      success: true,
      message: `Checked badges, awarded ${newBadges.length} new badges`,
      data: {
        newBadges: newBadges.map(b => b.badge),
        totalXpBonus: newBadges.reduce((sum, b) => sum + (b.xpBonus || 0), 0)
      }
    });

  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check badges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create badge (admin only)
const createBadge = async (req, res) => {
  try {
    const badgeData = req.body;
    badgeData.createdBy = req.user._id;

    const badge = new Badge(badgeData);
    await badge.save();

    res.status(201).json({
      success: true,
      message: 'Badge created successfully',
      data: { badge }
    });

  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update badge (admin only)
const updateBadge = async (req, res) => {
  try {
    const { badgeId } = req.params;
    const updates = req.body;

    const badge = await Badge.findByIdAndUpdate(
      badgeId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    res.json({
      success: true,
      message: 'Badge updated successfully',
      data: { badge }
    });

  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Award badge manually (admin only)
const awardBadge = async (req, res) => {
  try {
    const { badgeId, userId } = req.params;

    const badge = await Badge.findById(badgeId);
    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found'
      });
    }

    const result = await badge.awardToUser(userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Badge awarded successfully',
        data: {
          badge,
          xpBonus: result.xpBonus
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    console.error('Award badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award badge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getBadges,
  getBadgeById,
  getUserBadges,
  getLeaderboard,
  getGamificationStats,
  checkBadges,
  createBadge,
  updateBadge,
  awardBadge
};

