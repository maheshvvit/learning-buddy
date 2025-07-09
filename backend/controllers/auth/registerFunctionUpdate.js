// Updated register function with error handling around token generation

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

module.exports = register;
