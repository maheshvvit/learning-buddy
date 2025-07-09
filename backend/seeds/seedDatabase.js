const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User, Challenge, Badge, LearningPath } = require('../models');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learning-buddy', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = {
  // System badges
  badges: [
    {
      name: "First Steps",
      description: "Complete your first challenge",
      shortDescription: "Welcome to Learning Buddy!",
      icon: "🎯",
      category: "milestone",
      type: "progress",
      rarity: "common",
      criteria: { challengesCompleted: 1 },
      rewards: { xpBonus: 50 }
    },
    {
      name: "Quick Learner",
      description: "Complete 5 challenges in one day",
      shortDescription: "Speed demon!",
      icon: "⚡",
      category: "achievement",
      type: "performance",
      rarity: "uncommon",
      criteria: { challengesCompleted: 5 },
      rewards: { xpBonus: 100 }
    },
    {
      name: "Perfect Score",
      description: "Achieve 100% on any challenge",
      shortDescription: "Flawless execution!",
      icon: "💯",
      category: "achievement",
      type: "performance",
      rarity: "rare",
      criteria: { perfectScores: 1 },
      rewards: { xpBonus: 150 }
    },
    {
      name: "Streak Master",
      description: "Maintain a 7-day learning streak",
      shortDescription: "Consistency is key!",
      icon: "🔥",
      category: "streak",
      type: "consistency",
      rarity: "epic",
      criteria: { streakDays: 7 },
      rewards: { xpBonus: 200 }
    },
    {
      name: "Knowledge Seeker",
      description: "Complete 50 challenges",
      shortDescription: "Dedicated learner!",
      icon: "📚",
      category: "milestone",
      type: "progress",
      rarity: "epic",
      criteria: { challengesCompleted: 50 },
      rewards: { xpBonus: 500 }
    },
    {
      name: "Programming Prodigy",
      description: "Complete 20 programming challenges",
      shortDescription: "Code master!",
      icon: "💻",
      category: "skill",
      type: "mastery",
      rarity: "rare",
      criteria: { challengesCompleted: 20, challengeCategory: "programming" },
      rewards: { xpBonus: 300 }
    }
  ],

  // Sample challenges
  challenges: [
    {
      title: "JavaScript Basics: Variables and Data Types",
      description: "Learn the fundamentals of JavaScript variables and data types through interactive exercises.",
      shortDescription: "Master JS variables and data types",
      type: "quiz",
      category: "programming",
      difficulty: "beginner",
      estimatedTime: 15,
      tags: ["javascript", "variables", "data-types", "basics"],
      content: {
        questions: [
          {
            id: "q1",
            type: "multiple-choice",
            question: "Which of the following is the correct way to declare a variable in JavaScript?",
            options: ["var myVar;", "variable myVar;", "v myVar;", "declare myVar;"],
            correctAnswer: "var myVar;",
            explanation: "In JavaScript, variables are declared using 'var', 'let', or 'const' keywords.",
            points: 1
          },
          {
            id: "q2",
            type: "multiple-choice",
            question: "What data type is the value 'Hello World'?",
            options: ["Number", "String", "Boolean", "Object"],
            correctAnswer: "String",
            explanation: "Text values enclosed in quotes are strings in JavaScript.",
            points: 1
          },
          {
            id: "q3",
            type: "code",
            question: "Write a JavaScript statement to declare a variable named 'age' and assign it the value 25.",
            correctAnswer: "let age = 25;",
            explanation: "Variables can be declared and assigned in one statement.",
            points: 2,
            codeTemplate: "// Write your code here\n"
          }
        ]
      },
      scoring: {
        maxPoints: 4,
        passingScore: 3,
        xpReward: 100,
        bonusXp: {
          perfectScore: 25,
          fastCompletion: 15,
          firstAttempt: 10
        }
      }
    },
    {
      title: "Python Functions: Basics",
      description: "Learn how to create and use functions in Python programming language.",
      shortDescription: "Master Python functions",
      type: "coding",
      category: "programming",
      difficulty: "intermediate",
      estimatedTime: 30,
      tags: ["python", "functions", "programming"],
      content: {
        codingChallenge: {
          problemStatement: "Create a function that calculates the area of a rectangle given its width and height.",
          inputFormat: "Two integers: width and height",
          outputFormat: "A single integer: the area",
          examples: [
            {
              input: "5 3",
              output: "15",
              explanation: "Area = width × height = 5 × 3 = 15"
            }
          ],
          starterCode: {
            python: "def calculate_area(width, height):\n    # Write your code here\n    pass\n\n# Test your function\nwidth, height = map(int, input().split())\nresult = calculate_area(width, height)\nprint(result)"
          },
          testCases: [
            { input: "5 3", expectedOutput: "15", isHidden: false },
            { input: "10 7", expectedOutput: "70", isHidden: false },
            { input: "1 1", expectedOutput: "1", isHidden: true }
          ]
        }
      },
      scoring: {
        maxPoints: 100,
        passingScore: 70,
        xpReward: 150,
        bonusXp: {
          perfectScore: 50,
          fastCompletion: 25,
          firstAttempt: 20
        }
      }
    },
    {
      title: "Basic Algebra: Linear Equations",
      description: "Solve linear equations and understand the fundamentals of algebraic manipulation.",
      shortDescription: "Master linear equations",
      type: "quiz",
      category: "mathematics",
      difficulty: "beginner",
      estimatedTime: 20,
      tags: ["algebra", "linear-equations", "mathematics"],
      content: {
        questions: [
          {
            id: "q1",
            type: "short-answer",
            question: "Solve for x: 2x + 5 = 13",
            correctAnswer: "4",
            explanation: "2x = 13 - 5 = 8, so x = 8/2 = 4",
            points: 2
          },
          {
            id: "q2",
            type: "multiple-choice",
            question: "What is the slope of the line y = 3x + 2?",
            options: ["2", "3", "5", "3x"],
            correctAnswer: "3",
            explanation: "In the form y = mx + b, m is the slope. Here m = 3.",
            points: 1
          }
        ]
      },
      scoring: {
        maxPoints: 3,
        passingScore: 2,
        xpReward: 80,
        bonusXp: {
          perfectScore: 20,
          fastCompletion: 10,
          firstAttempt: 15
        }
      }
    }
  ],

  // Sample learning paths
  learningPaths: [
    {
      title: "JavaScript Fundamentals",
      description: "A comprehensive introduction to JavaScript programming covering variables, functions, objects, and more.",
      shortDescription: "Learn JavaScript from scratch",
      category: "programming",
      difficulty: "beginner",
      tags: ["javascript", "programming", "web-development"],
      steps: [
        {
          stepNumber: 1,
          title: "Variables and Data Types",
          description: "Learn about JavaScript variables and data types",
          type: "challenge",
          estimatedTime: 15,
          xpReward: 50,
          isRequired: true
        },
        {
          stepNumber: 2,
          title: "Functions Basics",
          description: "Understanding JavaScript functions",
          type: "challenge",
          estimatedTime: 25,
          xpReward: 75,
          isRequired: true,
          prerequisites: [{ stepNumber: 1, isRequired: true }]
        },
        {
          stepNumber: 3,
          title: "Objects and Arrays",
          description: "Working with JavaScript objects and arrays",
          type: "challenge",
          estimatedTime: 30,
          xpReward: 100,
          isRequired: true,
          prerequisites: [{ stepNumber: 2, isRequired: true }]
        }
      ],
      totalSteps: 3,
      estimatedDuration: 2,
      objectives: [
        {
          description: "Understand JavaScript variable declaration and data types",
          category: "knowledge"
        },
        {
          description: "Create and use JavaScript functions",
          category: "skill"
        },
        {
          description: "Manipulate objects and arrays in JavaScript",
          category: "application"
        }
      ],
      targetAudience: {
        experienceLevel: ["beginner"],
        roles: ["student", "professional"],
        goals: ["skill-improvement", "career-change"]
      }
    },
    {
      title: "Python Programming Basics",
      description: "Start your Python journey with this beginner-friendly path covering syntax, data structures, and basic programming concepts.",
      shortDescription: "Python programming for beginners",
      category: "programming",
      difficulty: "beginner",
      tags: ["python", "programming", "basics"],
      steps: [
        {
          stepNumber: 1,
          title: "Python Syntax and Variables",
          description: "Learn Python syntax and variable handling",
          type: "challenge",
          estimatedTime: 20,
          xpReward: 60,
          isRequired: true
        },
        {
          stepNumber: 2,
          title: "Control Structures",
          description: "Master if statements and loops",
          type: "challenge",
          estimatedTime: 35,
          xpReward: 90,
          isRequired: true,
          prerequisites: [{ stepNumber: 1, isRequired: true }]
        }
      ],
      totalSteps: 2,
      estimatedDuration: 1.5,
      objectives: [
        {
          description: "Write basic Python programs",
          category: "skill"
        },
        {
          description: "Use control structures effectively",
          category: "application"
        }
      ],
      targetAudience: {
        experienceLevel: ["beginner"],
        roles: ["student"],
        goals: ["skill-improvement"]
      }
    }
  ]
};

// Seed functions
const seedBadges = async (adminUserId) => {
  console.log('Seeding badges...');
  
  for (const badgeData of seedData.badges) {
    const existingBadge = await Badge.findOne({ name: badgeData.name });
    
    if (!existingBadge) {
      const badge = new Badge({
        ...badgeData,
        createdBy: adminUserId,
        isSystemBadge: true
      });
      
      await badge.save();
      console.log(`Created badge: ${badge.name}`);
    }
  }
};

const seedChallenges = async (adminUserId) => {
  console.log('Seeding challenges...');
  
  for (const challengeData of seedData.challenges) {
    const existingChallenge = await Challenge.findOne({ title: challengeData.title });
    
    if (!existingChallenge) {
      const challenge = new Challenge({
        ...challengeData,
        author: adminUserId,
        isPublished: true,
        isActive: true
      });
      
      await challenge.save();
      console.log(`Created challenge: ${challenge.title}`);
    }
  }
};

const seedLearningPaths = async (adminUserId) => {
  console.log('Seeding learning paths...');
  
  for (const pathData of seedData.learningPaths) {
    const existingPath = await LearningPath.findOne({ title: pathData.title });
    
    if (!existingPath) {
      const path = new LearningPath({
        ...pathData,
        createdBy: adminUserId,
        isPublished: true,
        isActive: true,
        isFeatured: true
      });
      
      await path.save();
      console.log(`Created learning path: ${path.title}`);
    }
  }
};

const createAdminUser = async () => {
  console.log('Creating admin user...');
  
  const existingAdmin = await User.findOne({ email: 'admin@learningbuddy.com' });
  
  if (!existingAdmin) {
    const adminUser = new User({
      username: 'admin',
      email: 'admin@learningbuddy.com',
      password: 'admin123', // This will be hashed automatically
      role: 'admin',
      isVerified: true,
      profile: {
        firstName: 'Learning',
        lastName: 'Buddy',
        bio: 'System Administrator'
      },
      gamification: {
        level: 100,
        xp: 100000,
        totalXp: 100000
      }
    });
    
    await adminUser.save();
    console.log('Admin user created successfully');
    return adminUser._id;
  } else {
    console.log('Admin user already exists');
    return existingAdmin._id;
  }
};

const createDemoUser = async () => {
  console.log('Creating demo user...');
  
  const existingDemo = await User.findOne({ email: 'demo@learningbuddy.com' });
  
  if (!existingDemo) {
    const demoUser = new User({
      username: 'demo_user',
      email: 'demo@learningbuddy.com',
      password: 'demo123',
      role: 'learner',
      isVerified: true,
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        bio: 'Demo account for testing'
      },
      learningPreferences: {
        subjects: ['programming', 'mathematics'],
        difficulty: 'beginner',
        learningStyle: 'visual',
        dailyGoal: 60
      }
    });
    
    await demoUser.save();
    console.log('Demo user created successfully');
    return demoUser._id;
  } else {
    console.log('Demo user already exists');
    return existingDemo._id;
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    // Create admin user first
    const adminUserId = await createAdminUser();
    
    // Create demo user
    await createDemoUser();
    
    // Seed all data
    await seedBadges(adminUserId);
    await seedChallenges(adminUserId);
    await seedLearningPaths(adminUserId);
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

