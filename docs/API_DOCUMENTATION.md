# Learning Buddy API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [User Management](#user-management-endpoints)
   - [Challenges](#challenge-endpoints)
   - [Learning Paths](#learning-path-endpoints)
   - [Gamification](#gamification-endpoints)
   - [AI Assistant](#ai-assistant-endpoints)
   - [Analytics](#analytics-endpoints)
6. [WebSocket Events](#websocket-events)
7. [SDK and Libraries](#sdk-and-libraries)

## Overview

The Learning Buddy API is a RESTful web service that provides access to all platform features including user management, challenges, AI tutoring, gamification, and analytics. The API is built using Node.js and Express.js, with MongoDB as the primary database.

### Base URL
```
Production: https://api.learningbuddy.com
Development: http://localhost:5000
```

### API Version
Current version: `v1`

All API endpoints are prefixed with `/api/v1` (or just `/api` for development).

### Content Type
All requests and responses use JSON format:
```
Content-Type: application/json
```

## Authentication

Learning Buddy uses JSON Web Tokens (JWT) for authentication. Tokens are issued upon successful login and must be included in the Authorization header for protected endpoints.

### Token Format
```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- Access tokens expire after 7 days
- Refresh tokens expire after 30 days

### Authentication Flow
1. User registers or logs in
2. Server returns access token and refresh token
3. Client includes access token in subsequent requests
4. When access token expires, use refresh token to get new access token

## Error Handling

The API uses standard HTTP status codes and returns detailed error information in JSON format.

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

API requests are rate-limited to ensure fair usage and system stability.

### Limits
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 login attempts per 15 minutes per IP
- **AI Chat**: 20 messages per minute per user
- **Challenge Submissions**: 10 submissions per minute per user

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01",
    "interests": ["javascript", "react", "algorithms"],
    "learningGoals": ["web development", "data structures"],
    "experienceLevel": "intermediate"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": null,
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "interests": ["javascript", "react", "algorithms"],
        "learningGoals": ["web development", "data structures"],
        "experienceLevel": "intermediate"
      },
      "gamification": {
        "level": 1,
        "xp": 0,
        "totalXp": 0,
        "xpToNextLevel": 100,
        "streak": {
          "current": 0,
          "longest": 0,
          "lastActivity": null
        },
        "badges": []
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "achievements": true,
          "reminders": true
        },
        "privacy": {
          "profileVisibility": "public",
          "showProgress": true,
          "showBadges": true
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 604800
    }
  }
}
```

#### POST /api/auth/login
Authenticate user and receive access tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "profile": { /* user profile data */ },
      "gamification": { /* gamification data */ },
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 604800
    }
  }
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

#### POST /api/auth/logout
Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### POST /api/auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /api/auth/reset-password
Reset password using reset token.

**Request Body:**
```json
{
  "token": "password-reset-token",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password successfully reset"
}
```

### User Management Endpoints

#### GET /api/users/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "email": "john@example.com",
      "profile": { /* complete profile data */ },
      "gamification": { /* gamification stats */ },
      "preferences": { /* user preferences */ },
      "statistics": {
        "challengesCompleted": 45,
        "totalTimeSpent": 1200,
        "averageScore": 87.5,
        "favoriteCategories": ["javascript", "algorithms"]
      }
    }
  }
}
```

#### PUT /api/users/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "interests": ["javascript", "react", "node.js"],
    "learningGoals": ["full-stack development"],
    "experienceLevel": "advanced"
  },
  "preferences": {
    "notifications": {
      "email": false,
      "push": true
    }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { /* updated user data */ }
  }
}
```

#### POST /api/users/avatar
Upload user avatar image.

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: <image-file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.learningbuddy.com/avatars/user-id/avatar.jpg"
  }
}
```

#### GET /api/users/:userId
Get public user profile (if privacy settings allow).

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "username": "johndoe",
      "profile": {
        "firstName": "John",
        "avatar": "https://cdn.learningbuddy.com/avatars/user-id/avatar.jpg"
      },
      "gamification": {
        "level": 8,
        "badges": ["javascript-master", "speed-demon"],
        "publicStats": {
          "challengesCompleted": 45,
          "rank": 156
        }
      }
    }
  }
}
```

### Challenge Endpoints

#### GET /api/challenges
Get list of available challenges with filtering and pagination.

**Query Parameters:**
- `category` (string): Filter by category (javascript, python, algorithms, etc.)
- `difficulty` (string): Filter by difficulty (beginner, intermediate, advanced)
- `type` (string): Filter by type (quiz, coding, mixed)
- `tags` (string): Comma-separated list of tags
- `search` (string): Search in title and description
- `page` (number): Page number (default: 1)
- `limit` (number): Results per page (default: 20, max: 100)
- `sort` (string): Sort by (newest, oldest, difficulty, rating, popularity)

**Example Request:**
```
GET /api/challenges?category=javascript&difficulty=intermediate&page=1&limit=10&sort=rating
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "JavaScript Closures Deep Dive",
        "description": "Master the concept of closures in JavaScript",
        "category": "javascript",
        "difficulty": "intermediate",
        "type": "mixed",
        "tags": ["closures", "functions", "scope"],
        "estimatedTime": 45,
        "xpReward": 200,
        "rating": 4.8,
        "totalAttempts": 1250,
        "successRate": 73.2,
        "prerequisites": ["javascript-basics"],
        "thumbnail": "https://cdn.learningbuddy.com/challenges/thumbnails/closures.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 156,
      "pages": 16,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["javascript", "python", "algorithms", "react"],
      "difficulties": ["beginner", "intermediate", "advanced"],
      "types": ["quiz", "coding", "mixed"]
    }
  }
}
```

#### GET /api/challenges/:challengeId
Get detailed information about a specific challenge.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "challenge": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "JavaScript Closures Deep Dive",
      "description": "Master the concept of closures in JavaScript with practical examples and exercises.",
      "category": "javascript",
      "difficulty": "intermediate",
      "type": "mixed",
      "tags": ["closures", "functions", "scope"],
      "estimatedTime": 45,
      "xpReward": 200,
      "rating": 4.8,
      "prerequisites": ["javascript-basics"],
      "learningObjectives": [
        "Understand what closures are and how they work",
        "Identify common use cases for closures",
        "Avoid common pitfalls with closures"
      ],
      "content": {
        "introduction": "Closures are one of the most powerful features in JavaScript...",
        "sections": [
          {
            "title": "What are Closures?",
            "content": "A closure is created when...",
            "examples": [
              {
                "title": "Basic Closure Example",
                "code": "function outerFunction(x) {\n  function innerFunction(y) {\n    return x + y;\n  }\n  return innerFunction;\n}",
                "explanation": "In this example..."
              }
            ]
          }
        ]
      },
      "questions": [
        {
          "id": "q1",
          "type": "multiple-choice",
          "question": "What is a closure in JavaScript?",
          "options": [
            "A function that returns another function",
            "A function that has access to variables in its outer scope",
            "A function that is immediately invoked",
            "A function that takes no parameters"
          ],
          "correctAnswer": 1,
          "explanation": "A closure is created when a function has access to variables in its outer scope...",
          "points": 10
        },
        {
          "id": "q2",
          "type": "coding",
          "question": "Create a function that uses closures to create a counter",
          "starterCode": "function createCounter() {\n  // Your code here\n}",
          "testCases": [
            {
              "input": "const counter = createCounter(); counter(); counter();",
              "expectedOutput": "2"
            }
          ],
          "solution": "function createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}",
          "points": 20
        }
      ],
      "userProgress": {
        "attempts": 2,
        "bestScore": 85,
        "completed": false,
        "timeSpent": 32,
        "lastAttempt": "2024-01-01T00:00:00.000Z"
      }
    }
  }
}
```

#### POST /api/challenges/:challengeId/attempt
Submit an attempt for a challenge.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "answer": 1,
      "timeSpent": 15
    },
    {
      "questionId": "q2",
      "answer": "function createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}",
      "timeSpent": 180
    }
  ],
  "totalTimeSpent": 195,
  "metadata": {
    "browser": "Chrome 91.0",
    "screenResolution": "1920x1080"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "challengeId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "score": 90,
      "maxScore": 100,
      "percentage": 90,
      "timeSpent": 195,
      "completed": true,
      "results": [
        {
          "questionId": "q1",
          "correct": true,
          "points": 10,
          "maxPoints": 10,
          "feedback": "Correct! Closures do indeed have access to variables in their outer scope."
        },
        {
          "questionId": "q2",
          "correct": true,
          "points": 20,
          "maxPoints": 20,
          "feedback": "Excellent implementation! Your counter function correctly uses closures.",
          "codeAnalysis": {
            "complexity": "O(1)",
            "style": "Good",
            "suggestions": []
          }
        }
      ],
      "xpEarned": 200,
      "badgesEarned": ["first-completion"],
      "achievements": [
        {
          "type": "speed_bonus",
          "description": "Completed under estimated time",
          "xpBonus": 50
        }
      ],
      "submittedAt": "2024-01-01T00:00:00.000Z"
    },
    "userStats": {
      "totalXp": 1450,
      "newLevel": 6,
      "levelUp": true,
      "streak": {
        "current": 5,
        "longest": 12
      }
    }
  }
}
```

#### GET /api/challenges/:challengeId/attempts
Get user's attempt history for a challenge.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "score": 90,
        "percentage": 90,
        "timeSpent": 195,
        "completed": true,
        "xpEarned": 200,
        "submittedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "summary": {
      "totalAttempts": 3,
      "bestScore": 90,
      "averageScore": 78.3,
      "totalTimeSpent": 420,
      "completed": true
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "pages": 1
    }
  }
}
```

### Learning Path Endpoints

#### GET /api/learning-paths
Get available learning paths.

**Query Parameters:**
- `category` (string): Filter by category
- `difficulty` (string): Filter by difficulty level
- `duration` (string): Filter by estimated duration (short, medium, long)
- `page` (number): Page number
- `limit` (number): Results per page

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "paths": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Full-Stack JavaScript Developer",
        "description": "Complete path from beginner to full-stack JavaScript developer",
        "category": "web-development",
        "difficulty": "beginner-to-advanced",
        "estimatedDuration": "12 weeks",
        "totalChallenges": 45,
        "totalXp": 5000,
        "prerequisites": [],
        "skills": ["javascript", "react", "node.js", "mongodb"],
        "thumbnail": "https://cdn.learningbuddy.com/paths/fullstack-js.jpg",
        "rating": 4.9,
        "enrolledUsers": 2340,
        "completionRate": 78.5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

#### GET /api/learning-paths/:pathId
Get detailed information about a learning path.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "path": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Full-Stack JavaScript Developer",
      "description": "Complete path from beginner to full-stack JavaScript developer",
      "category": "web-development",
      "difficulty": "beginner-to-advanced",
      "estimatedDuration": "12 weeks",
      "totalChallenges": 45,
      "totalXp": 5000,
      "skills": ["javascript", "react", "node.js", "mongodb"],
      "learningObjectives": [
        "Master JavaScript fundamentals",
        "Build interactive web applications with React",
        "Create backend APIs with Node.js",
        "Work with databases using MongoDB"
      ],
      "modules": [
        {
          "id": "module1",
          "title": "JavaScript Fundamentals",
          "description": "Learn the core concepts of JavaScript",
          "estimatedTime": "3 weeks",
          "challenges": [
            {
              "id": "60f7b3b3b3b3b3b3b3b3b3b3",
              "title": "Variables and Data Types",
              "difficulty": "beginner",
              "xpReward": 100,
              "required": true
            }
          ],
          "prerequisites": [],
          "order": 1
        }
      ],
      "userProgress": {
        "enrolled": true,
        "startedAt": "2024-01-01T00:00:00.000Z",
        "completedChallenges": 12,
        "totalChallenges": 45,
        "completionPercentage": 26.7,
        "currentModule": "module2",
        "xpEarned": 1200,
        "estimatedTimeRemaining": "8 weeks"
      }
    }
  }
}
```

#### POST /api/learning-paths/:pathId/enroll
Enroll in a learning path.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "enrollment": {
      "pathId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "enrolledAt": "2024-01-01T00:00:00.000Z",
      "status": "active"
    }
  }
}
```

### Gamification Endpoints

#### GET /api/gamification/leaderboard
Get the global leaderboard.

**Query Parameters:**
- `timeframe` (string): daily, weekly, monthly, all-time (default: weekly)
- `category` (string): Filter by specific category
- `limit` (number): Number of users to return (default: 50, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "60f7b3b3b3b3b3b3b3b3b3b3",
          "username": "codeMaster",
          "avatar": "https://cdn.learningbuddy.com/avatars/user1.jpg"
        },
        "stats": {
          "xp": 15420,
          "level": 25,
          "challengesCompleted": 156,
          "streak": 45
        },
        "badges": ["javascript-master", "algorithm-expert", "speed-demon"]
      }
    ],
    "userRank": {
      "rank": 156,
      "user": {
        "id": "current-user-id",
        "username": "johndoe"
      },
      "stats": {
        "xp": 2450,
        "level": 8,
        "challengesCompleted": 47
      }
    },
    "metadata": {
      "timeframe": "weekly",
      "totalUsers": 5420,
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/gamification/badges
Get available badges and user's earned badges.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "badges": [
      {
        "id": "javascript-master",
        "name": "JavaScript Master",
        "description": "Complete 20 JavaScript challenges",
        "icon": "https://cdn.learningbuddy.com/badges/js-master.svg",
        "rarity": "epic",
        "category": "skill",
        "requirements": {
          "type": "challenge_completion",
          "category": "javascript",
          "count": 20
        },
        "xpReward": 500,
        "earned": true,
        "earnedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "userBadges": {
      "total": 12,
      "byRarity": {
        "common": 5,
        "rare": 4,
        "epic": 2,
        "legendary": 1
      },
      "recent": [
        {
          "id": "speed-demon",
          "earnedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  }
}
```

#### POST /api/gamification/badges/:badgeId/claim
Claim an earned badge.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "badge": {
      "id": "javascript-master",
      "name": "JavaScript Master",
      "xpReward": 500,
      "claimedAt": "2024-01-01T00:00:00.000Z"
    },
    "userStats": {
      "totalXp": 2950,
      "newLevel": 9,
      "levelUp": true
    }
  }
}
```

### AI Assistant Endpoints

#### POST /api/ai/chat/start
Start a new AI chat session.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "context": {
    "type": "general",
    "challengeId": null,
    "topic": "javascript"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "context": {
        "type": "general",
        "topic": "javascript"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "initialMessage": {
      "id": "msg1",
      "type": "ai",
      "content": "Hello! I'm your AI Learning Buddy. I'm here to help you with JavaScript concepts and challenges. What would you like to learn about today?",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "suggestions": [
        "Explain JavaScript closures",
        "Help with async/await",
        "Review my code",
        "Recommend practice problems"
      ]
    }
  }
}
```

#### POST /api/ai/chat/:sessionId/message
Send a message to the AI assistant.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "message": "Can you explain how JavaScript closures work?",
  "context": {
    "currentChallenge": null,
    "codeSnippet": null,
    "userProgress": {
      "level": 8,
      "completedTopics": ["variables", "functions", "arrays"]
    }
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg2",
      "type": "ai",
      "content": "Great question! Closures are one of the most powerful features in JavaScript. A closure is created when a function is defined inside another function and has access to the outer function's variables.\n\nHere's a simple example:\n\n```javascript\nfunction outerFunction(x) {\n  function innerFunction(y) {\n    return x + y; // innerFunction has access to 'x'\n  }\n  return innerFunction;\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // Output: 8\n```\n\nThe inner function \"closes over\" the variable `x` from the outer function, even after the outer function has finished executing. This is what makes it a closure!",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "codeExamples": [
        {
          "language": "javascript",
          "code": "function outerFunction(x) {\n  function innerFunction(y) {\n    return x + y;\n  }\n  return innerFunction;\n}",
          "explanation": "Basic closure example showing variable access"
        }
      ],
      "suggestions": [
        "Show me more closure examples",
        "What are common closure use cases?",
        "How do closures relate to scope?",
        "Practice closure problems"
      ],
      "relatedTopics": ["scope", "functions", "lexical-environment"],
      "difficulty": "intermediate"
    },
    "session": {
      "messageCount": 2,
      "lastActivity": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### GET /api/ai/chat/:sessionId
Get chat session history.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number): Page number for message pagination
- `limit` (number): Messages per page (default: 50)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "context": {
        "type": "general",
        "topic": "javascript"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastActivity": "2024-01-01T00:00:00.000Z",
      "messageCount": 5
    },
    "messages": [
      {
        "id": "msg1",
        "type": "ai",
        "content": "Hello! I'm your AI Learning Buddy...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "msg2",
        "type": "user",
        "content": "Can you explain how JavaScript closures work?",
        "timestamp": "2024-01-01T00:00:05.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 5,
      "pages": 1
    }
  }
}
```

#### GET /api/ai/chat
Get user's chat sessions.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Sessions per page (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "JavaScript Closures Discussion",
        "context": {
          "type": "general",
          "topic": "javascript"
        },
        "messageCount": 8,
        "lastMessage": {
          "content": "Thanks for the explanation!",
          "timestamp": "2024-01-01T00:00:00.000Z"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastActivity": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  }
}
```

#### POST /api/ai/generate-path
Generate a personalized learning path based on user's goals and current level.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "goals": ["full-stack development", "react mastery"],
  "timeCommitment": "10 hours per week",
  "currentLevel": "intermediate",
  "preferredTopics": ["javascript", "react", "node.js"],
  "avoidTopics": ["php", "java"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "learningPath": {
      "id": "generated-path-id",
      "title": "Personalized Full-Stack JavaScript Path",
      "description": "Custom learning path generated based on your goals and current level",
      "estimatedDuration": "8 weeks",
      "totalChallenges": 32,
      "modules": [
        {
          "title": "Advanced JavaScript Concepts",
          "challenges": ["closures-deep-dive", "async-programming"],
          "estimatedTime": "2 weeks"
        }
      ],
      "generatedAt": "2024-01-01T00:00:00.000Z",
      "aiRecommendations": {
        "reasoning": "Based on your intermediate level and full-stack goals...",
        "focusAreas": ["async programming", "state management", "API design"],
        "skipReasons": ["You already have strong fundamentals in variables and functions"]
      }
    }
  }
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get user dashboard analytics.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `timeframe` (string): 7d, 30d, 90d, 1y (default: 30d)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalXp": 2450,
      "level": 8,
      "challengesCompleted": 47,
      "averageScore": 87.3,
      "timeSpent": 1240,
      "streak": {
        "current": 12,
        "longest": 28
      },
      "rank": 156,
      "totalUsers": 5420
    },
    "recentActivity": [
      {
        "type": "challenge_completed",
        "challengeTitle": "JavaScript Closures",
        "score": 92,
        "xpEarned": 200,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "progressCharts": {
      "dailyXp": [
        {
          "date": "2024-01-01",
          "xp": 120,
          "timeSpent": 45,
          "challenges": 2
        }
      ],
      "categoryProgress": [
        {
          "category": "javascript",
          "completed": 15,
          "total": 20,
          "percentage": 75
        }
      ],
      "skillDistribution": [
        {
          "skill": "frontend",
          "percentage": 35
        }
      ]
    },
    "achievements": {
      "recentBadges": [
        {
          "id": "javascript-master",
          "name": "JavaScript Master",
          "earnedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "nextGoals": [
        {
          "type": "badge",
          "name": "React Expert",
          "progress": 60,
          "requirement": "Complete 15 React challenges"
        }
      ]
    }
  }
}
```

#### GET /api/analytics/learning
Get detailed learning analytics.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `timeframe` (string): Time period for analysis
- `category` (string): Filter by specific category

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "learningPatterns": {
      "mostActiveHours": [14, 15, 16, 20, 21],
      "mostActiveDays": ["monday", "tuesday", "wednesday"],
      "averageSessionLength": 35,
      "preferredDifficulty": "intermediate",
      "learningVelocity": "steady"
    },
    "performanceAnalysis": {
      "strengths": ["javascript", "problem-solving"],
      "weaknesses": ["algorithms", "data-structures"],
      "improvementAreas": [
        {
          "area": "Time Complexity",
          "currentLevel": "beginner",
          "recommendedActions": ["Practice Big O notation", "Solve algorithm challenges"]
        }
      ]
    },
    "progressTrends": {
      "xpGrowth": {
        "trend": "increasing",
        "rate": 15.2,
        "prediction": "On track to reach level 10 in 3 weeks"
      },
      "accuracyTrend": {
        "trend": "stable",
        "average": 87.3,
        "recent": 89.1
      }
    },
    "recommendations": [
      {
        "type": "challenge",
        "title": "Binary Search Implementation",
        "reason": "Improve algorithm skills",
        "priority": "high"
      }
    ]
  }
}
```

#### GET /api/analytics/comparison
Get progress comparison with peers and global averages.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `type` (string): peers, global, previous (default: peers)
- `timeframe` (string): Comparison time period

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "type": "peers",
      "metrics": {
        "xpEarned": {
          "user": 450,
          "peer_average": 320,
          "percentile": 78,
          "trend": "above_average"
        },
        "challengesCompleted": {
          "user": 8,
          "peer_average": 6.2,
          "percentile": 72
        },
        "averageScore": {
          "user": 87.3,
          "peer_average": 82.1,
          "percentile": 68
        },
        "timeSpent": {
          "user": 240,
          "peer_average": 180,
          "percentile": 85
        }
      },
      "insights": [
        "You're performing 40% better than peers in XP earning",
        "Your consistency is in the top 25% of users",
        "Consider focusing on accuracy to improve scores"
      ],
      "peerGroup": {
        "criteria": "Similar level and interests",
        "size": 1250,
        "averageLevel": 7.8
      }
    }
  }
}
```

## WebSocket Events

Learning Buddy uses WebSocket connections for real-time features like live notifications, leaderboard updates, and AI chat streaming.

### Connection
```javascript
const socket = io('wss://api.learningbuddy.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### User Events
- `user:xp_gained` - When user earns XP
- `user:level_up` - When user levels up
- `user:badge_earned` - When user earns a badge
- `user:streak_updated` - When learning streak changes

#### Challenge Events
- `challenge:attempt_submitted` - When challenge attempt is submitted
- `challenge:results_ready` - When challenge results are processed

#### Leaderboard Events
- `leaderboard:rank_changed` - When user's rank changes
- `leaderboard:updated` - When leaderboard is refreshed

#### AI Chat Events
- `ai:message_streaming` - Streaming AI response
- `ai:message_complete` - AI response completed
- `ai:typing` - AI is generating response

### Example Usage
```javascript
socket.on('user:level_up', (data) => {
  console.log(`Congratulations! You reached level ${data.newLevel}`);
  showLevelUpAnimation(data);
});

socket.on('ai:message_streaming', (data) => {
  updateChatMessage(data.messageId, data.content);
});
```

## SDK and Libraries

### JavaScript SDK
```bash
npm install @learningbuddy/sdk
```

```javascript
import LearningBuddy from '@learningbuddy/sdk';

const lb = new LearningBuddy({
  apiKey: 'your-api-key',
  baseURL: 'https://api.learningbuddy.com'
});

// Authenticate
await lb.auth.login('user@example.com', 'password');

// Get challenges
const challenges = await lb.challenges.list({
  category: 'javascript',
  difficulty: 'intermediate'
});

// Submit attempt
const result = await lb.challenges.submitAttempt(challengeId, {
  answers: [/* answers */]
});
```

### Python SDK
```bash
pip install learningbuddy-sdk
```

```python
from learningbuddy import LearningBuddy

lb = LearningBuddy(api_key='your-api-key')

# Authenticate
lb.auth.login('user@example.com', 'password')

# Get user analytics
analytics = lb.analytics.get_dashboard()
print(f"User level: {analytics['overview']['level']}")
```

## Rate Limiting and Best Practices

### Best Practices
1. **Cache responses** when possible to reduce API calls
2. **Use pagination** for large datasets
3. **Implement exponential backoff** for retries
4. **Handle rate limits gracefully** with proper error handling
5. **Use WebSockets** for real-time features instead of polling
6. **Validate input** on the client side before API calls
7. **Store tokens securely** and implement proper refresh logic

### Error Handling Example
```javascript
async function makeAPICall() {
  try {
    const response = await fetch('/api/challenges', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 429) {
      // Rate limited - wait and retry
      const retryAfter = response.headers.get('Retry-After');
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return makeAPICall();
    }
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

---

For more information and updates, visit our [developer documentation](https://docs.learningbuddy.com) or contact our support team at api-support@learningbuddy.com.

