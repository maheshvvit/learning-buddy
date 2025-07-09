const { LearningPath, UserPathProgress, Challenge } = require('../../models');

// Get all learning paths
const getLearningPaths = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isPublished: true, isActive: true };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort options
    let sort = { isFeatured: -1, createdAt: -1 };
    if (req.query.sort === 'popular') {
      sort = { 'statistics.enrollments': -1 };
    } else if (req.query.sort === 'rating') {
      sort = { 'statistics.averageRating': -1 };
    } else if (req.query.sort === 'completion') {
      sort = { 'statistics.completionRate': -1 };
    }

    const paths = await LearningPath.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await LearningPath.countDocuments(query);

    // If user is authenticated, get their progress on these paths
    let userProgress = {};
    if (req.user) {
      const pathIds = paths.map(p => p._id);
      const progress = await UserPathProgress.find({
        userId: req.user._id,
        pathId: { $in: pathIds }
      });
      
      userProgress = progress.reduce((acc, p) => {
        acc[p.pathId.toString()] = {
          enrolled: true,
          progress: p.progressPercentage,
          status: p.status,
          currentStep: p.currentStep
        };
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        paths: paths.map(path => ({
          ...path.toObject(),
          userProgress: userProgress[path._id.toString()] || null
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
    console.error('Get learning paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning paths',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get learning path by ID
const getLearningPathById = async (req, res) => {
  try {
    const { pathId } = req.params;

    const path = await LearningPath.findById(pathId)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .populate('steps.challengeId', 'title difficulty estimatedTime');

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    if (!path.isPublished || !path.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Learning path is not available'
      });
    }

    // Check prerequisites if user is authenticated
    let prerequisitesMet = true;
    let missingPrerequisites = [];
    
    if (req.user) {
      const prereqCheck = await path.checkPrerequisites(req.user._id);
      prerequisitesMet = prereqCheck.met;
      missingPrerequisites = prereqCheck.reasons;
    }

    // Get user's progress on this path
    let userProgress = null;
    let nextStep = null;
    
    if (req.user) {
      userProgress = await UserPathProgress.findOne({
        userId: req.user._id,
        pathId: pathId
      });
      
      if (userProgress) {
        nextStep = await path.getNextStep(req.user._id);
      }
    }

    res.json({
      success: true,
      data: {
        path,
        userProgress,
        nextStep,
        prerequisitesMet,
        missingPrerequisites
      }
    });

  } catch (error) {
    console.error('Get learning path by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch learning path',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Enroll in learning path
const enrollInPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const userId = req.user._id;

    const path = await LearningPath.findById(pathId);

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    if (!path.isPublished || !path.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Learning path is not available'
      });
    }

    // Check prerequisites
    const prereqCheck = await path.checkPrerequisites(userId);
    if (!prereqCheck.met) {
      return res.status(403).json({
        success: false,
        message: 'Prerequisites not met',
        missingPrerequisites: prereqCheck.reasons
      });
    }

    // Check if already enrolled
    const existingProgress = await UserPathProgress.findOne({
      userId,
      pathId
    });

    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this learning path'
      });
    }

    // Create enrollment
    const enrollment = new UserPathProgress({
      userId,
      pathId,
      status: 'enrolled'
    });

    await enrollment.save();

    // Update path statistics
    await LearningPath.findByIdAndUpdate(pathId, {
      $inc: { 'statistics.enrollments': 1 }
    });

    res.json({
      success: true,
      message: 'Successfully enrolled in learning path',
      data: { enrollment }
    });

  } catch (error) {
    console.error('Enroll in path error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in learning path',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Complete a step in learning path
const completeStep = async (req, res) => {
  try {
    const { pathId, stepNumber } = req.params;
    const { score, timeSpent, xpEarned } = req.body;
    const userId = req.user._id;

    const userProgress = await UserPathProgress.findOne({
      userId,
      pathId
    });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this learning path'
      });
    }

    const path = await LearningPath.findById(pathId);
    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    const step = path.steps.find(s => s.stepNumber === parseInt(stepNumber));
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      });
    }

    // Complete the step
    userProgress.completeStep(parseInt(stepNumber), {
      score: score || 0,
      timeSpent: timeSpent || 0,
      xpEarned: xpEarned || step.xpReward
    });

    // Check for milestones
    const progressPercentage = userProgress.progressPercentage;
    
    if (progressPercentage === 25 && !userProgress.milestones.some(m => m.type === 'quarter')) {
      userProgress.addMilestone('quarter', '25% of learning path completed', 50);
    } else if (progressPercentage === 50 && !userProgress.milestones.some(m => m.type === 'half')) {
      userProgress.addMilestone('half', '50% of learning path completed', 100);
    } else if (progressPercentage === 75 && !userProgress.milestones.some(m => m.type === 'three-quarter')) {
      userProgress.addMilestone('three-quarter', '75% of learning path completed', 150);
    } else if (progressPercentage === 100 && !userProgress.milestones.some(m => m.type === 'completion')) {
      userProgress.addMilestone('completion', 'Learning path completed!', 500);
      
      // Update path completion statistics
      await LearningPath.findByIdAndUpdate(pathId, {
        $inc: { 'statistics.completions': 1 }
      });
    }

    await userProgress.save();

    // Get next step
    const nextStep = await path.getNextStep(userId);

    res.json({
      success: true,
      message: 'Step completed successfully',
      data: {
        userProgress,
        nextStep,
        milestones: userProgress.milestones.filter(m => 
          new Date(m.achievedAt) > new Date(Date.now() - 5000) // Recent milestones
        )
      }
    });

  } catch (error) {
    console.error('Complete step error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete step',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's learning paths
const getUserPaths = async (req, res) => {
  try {
    const userId = req.user._id;
    const status = req.query.status; // 'enrolled', 'in-progress', 'completed', 'paused'

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const userPaths = await UserPathProgress.find(query)
      .populate('pathId', 'title description category difficulty estimatedDuration statistics')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: { userPaths }
    });

  } catch (error) {
    console.error('Get user paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user learning paths',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get recommended learning paths
const getRecommendedPaths = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;

    const recommendations = await LearningPath.getRecommendedPaths(userId, limit);

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Get recommended paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get trending learning paths
const getTrendingPaths = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const trendingPaths = await LearningPath.getTrendingPaths(limit, days);

    res.json({
      success: true,
      data: { trendingPaths }
    });

  } catch (error) {
    console.error('Get trending paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending paths',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update learning path progress settings
const updatePathSettings = async (req, res) => {
  try {
    const { pathId } = req.params;
    const { schedule, social } = req.body;
    const userId = req.user._id;

    const userProgress = await UserPathProgress.findOne({
      userId,
      pathId
    });

    if (!userProgress) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this learning path'
      });
    }

    if (schedule) {
      userProgress.schedule = { ...userProgress.schedule, ...schedule };
    }

    if (social) {
      userProgress.social = { ...userProgress.social, ...social };
    }

    await userProgress.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { userProgress }
    });

  } catch (error) {
    console.error('Update path settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create learning path (admin only)
const createLearningPath = async (req, res) => {
  try {
    const pathData = req.body;
    pathData.createdBy = req.user._id;

    const path = new LearningPath(pathData);
    await path.save();

    res.status(201).json({
      success: true,
      message: 'Learning path created successfully',
      data: { path }
    });

  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create learning path',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update learning path (admin only)
const updateLearningPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const updates = req.body;

    const path = await LearningPath.findByIdAndUpdate(
      pathId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }

    res.json({
      success: true,
      message: 'Learning path updated successfully',
      data: { path }
    });

  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update learning path',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getLearningPaths,
  getLearningPathById,
  enrollInPath,
  completeStep,
  getUserPaths,
  getRecommendedPaths,
  getTrendingPaths,
  updatePathSettings,
  createLearningPath,
  updateLearningPath
};

