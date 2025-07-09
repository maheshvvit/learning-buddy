// Import all models
const User = require('./User');
const Challenge = require('./Challenge');
const UserProgress = require('./UserProgress');
const Badge = require('./Badge');
const LearningPath = require('./LearningPath');
const UserPathProgress = require('./UserPathProgress');
const ChatSession = require('./ChatSession');

// Export all models
module.exports = {
  User,
  Challenge,
  UserProgress,
  Badge,
  LearningPath,
  UserPathProgress,
  ChatSession
};

// Initialize model relationships and hooks
const initializeModels = () => {
  console.log('Models initialized successfully');
  
  // You can add any model initialization logic here
  // For example, creating default admin user, system badges, etc.
};

module.exports.initializeModels = initializeModels;

