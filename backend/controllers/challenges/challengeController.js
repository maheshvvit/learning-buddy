const { Challenge, UserProgress, Badge } = require('../../models');

// Get all challenges with filtering and pagination
const getChallenges = async (req, res) => {
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
    
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sort === 'popular') {
      sort = { 'statistics.totalAttempts': -1 };
    } else if (req.query.sort === 'rating') {
      sort = { 'statistics.qualityRating': -1 };
    } else if (req.query.sort === 'difficulty') {
      sort = { difficultyLevel: 1 };
    }

    const challenges = await Challenge.find(query)
      .populate('author', 'username profile.firstName profile.lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Challenge.countDocuments(query);

    // If user is authenticated, get their progress on these challenges
    let userProgress = {};
    if (req.user) {
      const challengeIds = challenges.map(c => c._id);
      const progress = await UserProgress.find({
        userId: req.user._id,
        challengeId: { $in: challengeIds }
      });
      
      userProgress = progress.reduce((acc, p) => {
        acc[p.challengeId.toString()] = {
          completed: p.completed,
          score: p.score,
          attempts: p.attemptNumber
        };
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        challenges: challenges.map(challenge => ({
          ...challenge.toObject(),
          userProgress: userProgress[challenge._id.toString()] || null
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
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId)
      .populate('author', 'username profile.firstName profile.lastName');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge.isPublished || !challenge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Challenge is not available'
      });
    }

    // Check prerequisites if user is authenticated
    let prerequisitesMet = true;
    let missingPrerequisites = [];
    
    if (req.user && challenge.prerequisites.length > 0) {
      const prereqCheck = await challenge.checkPrerequisites(req.user._id);
      prerequisitesMet = prereqCheck.met;
      missingPrerequisites = prereqCheck.missing;
    }

    // Get user's progress on this challenge
    let userProgress = null;
    if (req.user) {
      userProgress = await UserProgress.findOne({
        userId: req.user._id,
        challengeId: challengeId
      }).sort({ attemptNumber: -1 });
    }

    res.json({
      success: true,
      data: {
        challenge,
        userProgress,
        prerequisitesMet,
        missingPrerequisites
      }
    });

  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Start challenge attempt
const startChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (!challenge.isPublished || !challenge.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Challenge is not available'
      });
    }

    // Check prerequisites
    const prereqCheck = await challenge.checkPrerequisites(userId);
    if (!prereqCheck.met) {
      return res.status(403).json({
        success: false,
        message: 'Prerequisites not met',
        missingPrerequisites: prereqCheck.missing
      });
    }

    // Check if user has an active attempt
    const activeAttempt = await UserProgress.findOne({
      userId,
      challengeId,
      status: 'in-progress'
    });

    if (activeAttempt) {
      return res.json({
        success: true,
        message: 'Resuming existing attempt',
        data: { attempt: activeAttempt }
      });
    }

    // Get the next attempt number
    const lastAttempt = await UserProgress.findOne({
      userId,
      challengeId
    }).sort({ attemptNumber: -1 });

    const attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

    // Create new attempt
    const attempt = new UserProgress({
      userId,
      challengeId,
      attemptNumber,
      maxPossibleScore: challenge.scoring.maxPoints,
      estimatedTime: challenge.estimatedTime
    });

    await attempt.save();

    res.json({
      success: true,
      message: 'Challenge attempt started',
      data: { attempt }
    });

  } catch (error) {
    console.error('Start challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Submit challenge attempt
const submitChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { responses, timeSpent } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Find the active attempt
    const attempt = await UserProgress.findOne({
      userId,
      challengeId,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: 'No active attempt found'
      });
    }

    // Calculate score based on challenge type
    let totalScore = 0;
    let processedResponses = [];

    if (challenge.type === 'quiz') {
      for (const response of responses) {
        const question = challenge.content.questions.find(q => q.id === response.questionId);
        if (question) {
          const isCorrect = response.userAnswer === question.correctAnswer;
          const pointsEarned = isCorrect ? question.points : 0;
          totalScore += pointsEarned;

          processedResponses.push({
            questionId: response.questionId,
            questionType: question.type,
            userAnswer: response.userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect,
            pointsEarned,
            timeSpent: response.timeSpent || 0
          });
        }
      }
    }

    // Update attempt
    attempt.responses = processedResponses;
    attempt.score = totalScore;
    attempt.timeSpent = timeSpent || 0;
    attempt.completedAt = new Date();
    attempt.status = 'completed';
    attempt.completed = true;
    attempt.passed = totalScore >= challenge.scoring.passingScore;

    // Calculate XP
    const xpEarned = attempt.calculateXP(challenge);
    
    await attempt.save();

    // Update challenge statistics
    challenge.updateStatistics({
      completed: true,
      score: attempt.percentage,
      timeSpent: timeSpent
    });
    await challenge.save();

    // Update user XP and check for level up
    const user = req.user;
    const levelUpResult = user.addXP(xpEarned);
    user.updateStreak();
    user.statistics.challengesCompleted += 1;
    user.statistics.challengesAttempted += 1;
    user.statistics.totalTimeSpent += Math.floor(timeSpent / 60); // Convert to minutes
    
    // Update average score
    const totalScore_user = user.statistics.averageScore * (user.statistics.challengesCompleted - 1) + attempt.percentage;
    user.statistics.averageScore = totalScore_user / user.statistics.challengesCompleted;
    
    await user.save();

    // Check and award badges
    const newBadges = await Badge.checkAndAwardBadges(userId);

    res.json({
      success: true,
      message: 'Challenge submitted successfully',
      data: {
        attempt,
        xpEarned,
        levelUp: levelUpResult,
        newBadges: newBadges.map(b => b.badge)
      }
    });

  } catch (error) {
    console.error('Submit challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's challenge history
const getChallengeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await UserProgress.find({ userId })
      .populate('challengeId', 'title category difficulty type')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserProgress.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get challenge history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get recommended challenges
const getRecommendedChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await Challenge.getRecommendedChallenges(userId, limit);

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Get recommended challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create challenge (admin only)
const createChallenge = async (req, res) => {
  try {
    const challengeData = req.body;
    challengeData.author = req.user._id;

    const challenge = new Challenge(challengeData);
    await challenge.save();

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge }
    });

  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update challenge (admin only)
const updateChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const updates = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      message: 'Challenge updated successfully',
      data: { challenge }
    });

  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete challenge (admin only)
const deleteChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { isActive: false },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      message: 'Challenge deleted successfully'
    });

  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete challenge',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getChallenges,
  getChallengeById,
  startChallenge,
  submitChallenge,
  getChallengeHistory,
  getRecommendedChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge
};

