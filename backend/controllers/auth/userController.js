const { User, UserProgress, UserPathProgress } = require('../../models');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const search = req.query.search;
    const role = req.query.role;
    const isActive = req.query.isActive;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('gamification.badges.badgeId', 'name icon rarity');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('gamification.badges.badgeId', 'name description icon rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's learning analytics
    const challengeAnalytics = await UserProgress.getUserAnalytics(userId);
    const activePaths = await UserPathProgress.getActivePaths(userId);

    res.json({
      success: true,
      data: {
        user,
        analytics: {
          challenges: challengeAnalytics,
          activePaths: activePaths.length
        }
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields unless admin
    if (req.user.role !== 'admin') {
      delete updates.role;
      delete updates.isActive;
      delete updates.isVerified;
      delete updates.gamification;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Deactivate user (admin only)
const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Activate user (admin only)
const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || 'xp'; // 'xp', 'level', 'badges', 'challenges'

    let sortField;
    switch (type) {
      case 'level':
        sortField = { 'gamification.level': -1, 'gamification.xp': -1 };
        break;
      case 'badges':
        sortField = { 'gamification.badges': -1, 'gamification.xp': -1 };
        break;
      case 'challenges':
        sortField = { 'statistics.challengesCompleted': -1, 'gamification.xp': -1 };
        break;
      default:
        sortField = { 'gamification.totalXp': -1, 'gamification.level': -1 };
    }

    const users = await User.find({
      isActive: true,
      'settings.privacy.showInLeaderboard': { $ne: false }
    })
    .select('username profile.firstName profile.lastName profile.avatar gamification statistics')
    .sort(sortField)
    .limit(limit);

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user: user
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        type
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

// Get user activity feed
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get recent challenge completions
    const recentChallenges = await UserProgress.find({
      userId,
      completed: true,
      completedAt: { $gte: startDate }
    })
    .populate('challengeId', 'title category difficulty')
    .sort({ completedAt: -1 })
    .limit(limit);

    // Get recent path progress
    const recentPaths = await UserPathProgress.find({
      userId,
      lastActivity: { $gte: startDate }
    })
    .populate('pathId', 'title category')
    .sort({ lastActivity: -1 })
    .limit(limit);

    // Combine and sort activities
    const activities = [
      ...recentChallenges.map(challenge => ({
        type: 'challenge_completed',
        timestamp: challenge.completedAt,
        data: {
          challengeTitle: challenge.challengeId?.title,
          category: challenge.challengeId?.category,
          score: challenge.percentage,
          xpEarned: challenge.totalXpEarned
        }
      })),
      ...recentPaths.map(path => ({
        type: 'path_progress',
        timestamp: path.lastActivity,
        data: {
          pathTitle: path.pathId?.title,
          category: path.pathId?.category,
          progress: path.progressPercentage
        }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, limit);

    res.json({
      success: true,
      data: { activities }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      $and: [
        { isActive: true },
        { 'settings.privacy.profileVisibility': { $ne: 'private' } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { 'profile.firstName': { $regex: q, $options: 'i' } },
            { 'profile.lastName': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username profile.firstName profile.lastName profile.avatar gamification.level')
    .limit(limit);

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  getLeaderboard,
  getUserActivity,
  searchUsers
};

