const crypto = require('crypto');
const { User, Badge } = require('../../models');
const { generateToken } = require('../../config/jwt');

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {}
    });

    await user.save();

    // Generate JWT token with error handling
    let token;
    try {
      token = generateToken({ userId: user._id });
    } catch (tokenError) {
      console.error('Error generating JWT token:', tokenError);
      return res.status(500).json({
        success: false,
        message: 'Registration failed: Error generating authentication token',
      });
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Check and award welcome badges
    setTimeout(async () => {
      try {
        await Badge.checkAndAwardBadges(user._id);
      } catch (error) {
        console.error('Error awarding welcome badges:', error);
      }
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Log detailed error including validation errors if any
    if (error.name === 'ValidationError') {
      for (const field in error.errors) {
        console.error(`Validation error for ${field}: ${error.errors[field].message}`);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({ userId: user._id });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('gamification.badges.badgeId', 'name description icon rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const userId = req.user._id;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.gamification;
    delete updates.isActive;
    delete updates.isVerified;

    // Handle avatar upload if present
    if (req.file) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      // Save avatar file path relative to uploads folder
      user.profile.avatar = `/uploads/avatars/${req.file.filename}`;

      // Merge other updates except avatar
      if (updates.profile) {
        user.profile = { ...user.profile.toObject(), ...updates.profile };
        delete updates.profile;
      }
      Object.assign(user, updates);

      await user.save();

      const populatedUser = await User.findById(userId).populate('gamification.badges.badgeId', 'name description icon rarity');

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: populatedUser }
      });
    }

    // Handle nested profile updates separately to merge fields
    if (updates.profile) {
      const profileUpdates = updates.profile;
      delete updates.profile;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Merge profile fields
      user.profile = { ...user.profile.toObject(), ...profileUpdates };

      // Merge other top-level updates
      Object.assign(user, updates);

      await user.save();

      const populatedUser = await User.findById(userId).populate('gamification.badges.badgeId', 'name description icon rarity');

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: populatedUser }
      });
    }

    // If no nested profile updates, proceed as before
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('gamification.badges.badgeId', 'name description icon rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // In a real application, you would send an email here
    // For demo purposes, we'll just return the token
    res.json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken: resetToken // Remove this in production
      }
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { settings } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { settings: user.settings }
    });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Soft delete - deactivate account instead of hard delete
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`,
        username: `deleted_${Date.now()}_${user.username}`
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { UserProgress, UserPathProgress } = require('../../models');

    // Get user with populated data
    const user = await User.findById(userId)
      .populate('gamification.badges.badgeId', 'name description icon rarity');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get challenge progress analytics
    const challengeAnalytics = await UserProgress.getUserAnalytics(userId);

    // Get active learning paths
    const activePaths = await UserPathProgress.getActivePaths(userId);

    // Calculate additional stats
    const stats = {
      profile: {
        level: user.gamification.level,
        xp: user.gamification.xp,
        totalXp: user.gamification.totalXp,
        currentStreak: user.gamification.streak.current,
        longestStreak: user.gamification.streak.longest,
        badgeCount: user.gamification.badges.length
      },
      challenges: challengeAnalytics,
      learningPaths: {
        active: activePaths.length,
        totalEnrolled: await UserPathProgress.countDocuments({ userId })
      },
      achievements: user.gamification.achievements.length
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  updateSettings,
  deleteAccount,
  getUserStats
};

