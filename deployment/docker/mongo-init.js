// MongoDB initialization script for Learning Buddy

// Switch to the learning-buddy database
db = db.getSiblingDB('learning-buddy');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'learning-buddy'
    }
  ]
});

// Create indexes for better performance
print('Creating indexes...');

// User collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ 'gamification.level': -1 });
db.users.createIndex({ 'gamification.xp': -1 });
db.users.createIndex({ createdAt: 1 });

// Challenge collection indexes
db.challenges.createIndex({ category: 1 });
db.challenges.createIndex({ difficulty: 1 });
db.challenges.createIndex({ type: 1 });
db.challenges.createIndex({ tags: 1 });
db.challenges.createIndex({ rating: -1 });
db.challenges.createIndex({ createdAt: -1 });

// UserProgress collection indexes
db.userprogresses.createIndex({ userId: 1, challengeId: 1 });
db.userprogresses.createIndex({ userId: 1, submittedAt: -1 });
db.userprogresses.createIndex({ challengeId: 1 });
db.userprogresses.createIndex({ score: -1 });

// Badge collection indexes
db.badges.createIndex({ category: 1 });
db.badges.createIndex({ rarity: 1 });

// LearningPath collection indexes
db.learningpaths.createIndex({ category: 1 });
db.learningpaths.createIndex({ difficulty: 1 });
db.learningpaths.createIndex({ rating: -1 });

// UserPathProgress collection indexes
db.userpathprogresses.createIndex({ userId: 1, pathId: 1 }, { unique: true });
db.userpathprogresses.createIndex({ userId: 1, enrolledAt: -1 });

// ChatSession collection indexes
db.chatsessions.createIndex({ userId: 1, createdAt: -1 });
db.chatsessions.createIndex({ userId: 1, lastActivity: -1 });

print('Indexes created successfully!');

// Insert sample data
print('Inserting sample data...');

// Sample badges
db.badges.insertMany([
  {
    id: 'first-challenge',
    name: 'First Steps',
    description: 'Complete your first challenge',
    icon: 'trophy',
    rarity: 'common',
    category: 'achievement',
    requirements: {
      type: 'challenge_completion',
      count: 1
    },
    xpReward: 50,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'javascript-master',
    name: 'JavaScript Master',
    description: 'Complete 20 JavaScript challenges',
    icon: 'code',
    rarity: 'epic',
    category: 'skill',
    requirements: {
      type: 'challenge_completion',
      category: 'javascript',
      count: 20
    },
    xpReward: 500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a challenge in under 5 minutes',
    icon: 'lightning',
    rarity: 'rare',
    category: 'performance',
    requirements: {
      type: 'time_completion',
      maxTime: 300
    },
    xpReward: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample challenges
db.challenges.insertMany([
  {
    title: 'JavaScript Variables and Data Types',
    description: 'Learn the fundamentals of JavaScript variables and data types',
    category: 'javascript',
    difficulty: 'beginner',
    type: 'quiz',
    tags: ['variables', 'data-types', 'fundamentals'],
    estimatedTime: 30,
    xpReward: 100,
    rating: 4.5,
    prerequisites: [],
    content: {
      introduction: 'Variables are containers for storing data values...',
      sections: []
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which keyword is used to declare a variable in JavaScript?',
        options: ['var', 'let', 'const', 'All of the above'],
        correctAnswer: 3,
        explanation: 'All three keywords (var, let, const) can be used to declare variables in JavaScript.',
        points: 10
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'React Hooks Deep Dive',
    description: 'Advanced concepts in React Hooks including custom hooks and optimization',
    category: 'react',
    difficulty: 'advanced',
    type: 'mixed',
    tags: ['react', 'hooks', 'advanced'],
    estimatedTime: 60,
    xpReward: 300,
    rating: 4.8,
    prerequisites: ['react-basics'],
    content: {
      introduction: 'React Hooks allow you to use state and other React features...',
      sections: []
    },
    questions: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Sample learning paths
db.learningpaths.insertMany([
  {
    title: 'JavaScript Fundamentals',
    description: 'Master the basics of JavaScript programming',
    category: 'javascript',
    difficulty: 'beginner',
    estimatedDuration: '4 weeks',
    totalChallenges: 15,
    totalXp: 1500,
    prerequisites: [],
    skills: ['javascript', 'programming-basics'],
    modules: [
      {
        id: 'module1',
        title: 'Variables and Data Types',
        description: 'Learn about JavaScript variables and data types',
        estimatedTime: '1 week',
        challenges: [],
        prerequisites: [],
        order: 1
      }
    ],
    rating: 4.7,
    enrolledUsers: 0,
    completionRate: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print('Sample data inserted successfully!');
print('MongoDB initialization completed!');

