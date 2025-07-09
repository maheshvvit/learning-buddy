import api from './authService';

export const challengeService = {
  // Get all challenges with filtering
  getChallenges: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/challenges?${queryParams}`);
  },

  // Get challenge by ID
  getChallengeById: (challengeId) => {
    return api.get(`/challenges/${challengeId}`);
  },

  // Start challenge attempt
  startChallenge: (challengeId) => {
    return api.post(`/challenges/${challengeId}/start`);
  },

  // Submit challenge attempt
  submitChallenge: (challengeId, data) => {
    return api.post(`/challenges/${challengeId}/submit`, data);
  },

  // Get user's challenge history
  getChallengeHistory: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/challenges/user/history?${queryParams}`);
  },

  // Get recommended challenges
  getRecommendedChallenges: (limit = 10) => {
    return api.get(`/challenges/user/recommended?limit=${limit}`);
  }
};

export const learningPathService = {
  // Get all learning paths
  getLearningPaths: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/learning-paths?${queryParams}`);
  },

  // Get learning path by ID
  getLearningPathById: (pathId) => {
    return api.get(`/learning-paths/${pathId}`);
  },

  // Enroll in learning path
  enrollInPath: (pathId) => {
    return api.post(`/learning-paths/${pathId}/enroll`);
  },

  // Complete a step
  completeStep: (pathId, stepNumber, data) => {
    return api.post(`/learning-paths/${pathId}/steps/${stepNumber}/complete`, data);
  },

  // Get user's learning paths
  getUserPaths: (status) => {
    const params = status ? `?status=${status}` : '';
    return api.get(`/learning-paths/user/enrolled${params}`);
  },

  // Get recommended paths
  getRecommendedPaths: (limit = 5) => {
    return api.get(`/learning-paths/user/recommended?limit=${limit}`);
  },

  // Get trending paths
  getTrendingPaths: (limit = 10, days = 7) => {
    return api.get(`/learning-paths/trending?limit=${limit}&days=${days}`);
  }
};

export const gamificationService = {
  // Get all badges
  getBadges: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return api.get(`/gamification/badges?${queryParams}`);
  },

  // Get user's badges
  getUserBadges: (userId) => {
    const path = userId ? `/gamification/badges/user/${userId}` : '/gamification/badges/user';
    return api.get(path);
  },

  // Get leaderboard
  getLeaderboard: (type = 'xp', limit = 50, timeframe = 'all') => {
    return api.get(`/gamification/leaderboard?type=${type}&limit=${limit}&timeframe=${timeframe}`);
  },

  // Get gamification stats
  getGamificationStats: (userId) => {
    const path = userId ? `/gamification/stats/${userId}` : '/gamification/stats';
    return api.get(path);
  },

  // Check for new badges
  checkBadges: () => {
    return api.post('/gamification/check-badges');
  }
};

export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: (timeframe = 30) => {
    return api.get(`/analytics/dashboard?timeframe=${timeframe}`);
  },

  // Get detailed learning analytics
  getLearningAnalytics: (timeframe = 90, category) => {
    const params = new URLSearchParams({ timeframe });
    if (category) params.append('category', category);
    return api.get(`/analytics/learning?${params.toString()}`);
  },

  // Get progress comparison
  getProgressComparison: (compareWith = 'peers', timeframe = 30) => {
    return api.get(`/analytics/comparison?compareWith=${compareWith}&timeframe=${timeframe}`);
  },

  // Export user data
  exportUserData: (format = 'json') => {
    return api.get(`/analytics/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json'
    });
  }
};

export const aiService = {
  // Start new chat session
  startChatSession: (context) => {
    return api.post('/ai/chat/start', { context });
  },

  // Send message to AI
  sendMessage: (sessionId, message, attachments) => {
    return api.post(`/ai/chat/${sessionId}/message`, { message, attachments });
  },

  // Get chat session
  getChatSession: (sessionId) => {
    return api.get(`/ai/chat/${sessionId}`);
  },

  // Get user's chat sessions
  getChatSessions: (limit = 20) => {
    return api.get(`/ai/chat?limit=${limit}`);
  },

  // Provide feedback on AI message
  provideFeedback: (sessionId, messageId, feedback) => {
    return api.post(`/ai/chat/${sessionId}/messages/${messageId}/feedback`, feedback);
  },

  // Generate personalized learning path
  generatePersonalizedPath: (preferences, goals, currentLevel) => {
    return api.post('/ai/generate-path', { preferences, goals, currentLevel });
  },

  // Analyze user weaknesses
  analyzeWeaknesses: (timeframe = 30) => {
    return api.get(`/ai/analyze-weaknesses?timeframe=${timeframe}`);
  }
};

