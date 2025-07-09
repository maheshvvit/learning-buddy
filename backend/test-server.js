const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Learning Buddy API is running',
    timestamp: new Date().toISOString()
  });
});

// Mock auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Mock authentication
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          username: 'testuser',
          email: email,
          profile: {
            firstName: 'Test',
            lastName: 'User'
          },
          gamification: {
            level: 5,
            xp: 1250,
            totalXp: 1250,
            xpToNextLevel: 250,
            streak: { current: 7 },
            badges: ['beginner', 'consistent']
          }
        },
        token: 'mock-jwt-token-12345'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, profile } = req.body;
  
  if (username && email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          username: username,
          email: email,
          profile: profile || { firstName: 'New', lastName: 'User' },
          gamification: {
            level: 1,
            xp: 0,
            totalXp: 0,
            xpToNextLevel: 100,
            streak: { current: 0 },
            badges: []
          }
        },
        token: 'mock-jwt-token-12345'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'Username, email and password are required'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;

