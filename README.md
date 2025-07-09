# Learning Buddy – A 24/7 Learning Partner

![Learning Buddy Logo](https://img.shields.io/badge/Learning%20Buddy-24%2F7%20Learning%20Partner-blue?style=for-the-badge&logo=graduation-cap)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat&logo=mongodb)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-06B6D4?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Overview

Learning Buddy is a comprehensive, full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to revolutionize online learning through personalized, AI-powered educational experiences. Built with modern technologies and best practices, it provides a gamified learning environment that adapts to each user's pace and learning style.

### 🎯 Key Features

- **🧑‍💻 Interactive User Interface**: Modern React-based frontend with responsive design
- **🎮 Gamification Engine**: Points, badges, leaderboards, and achievement systems
- **🤖 AI-Powered Learning Assistant**: GPT-4 integration for personalized guidance
- **🧩 Micro Challenge System**: Auto-generated quizzes and coding challenges
- **🗃️ Personalization Hub**: Intelligent content recommendation engine
- **📊 Analytics Dashboard**: Comprehensive progress tracking and insights

## 🏗️ Architecture

Learning Buddy follows a modular, microservices-inspired architecture with six main modules:

### 1. User Interaction Layer
- **Frontend**: React.js with TypeScript and Tailwind CSS
- **Authentication**: JWT-based session management
- **Responsive Design**: Mobile-first approach with cross-device compatibility

### 2. Gamification Engine
- **Real-time Updates**: Firebase integration for live notifications
- **Achievement System**: Dynamic badge and XP point allocation
- **Social Features**: Leaderboards and peer comparison

### 3. AI-Powered Learning Buddy
- **Natural Language Processing**: OpenAI GPT-4 API integration
- **Personalized Recommendations**: Machine learning-driven content suggestions
- **Adaptive Learning Paths**: Dynamic curriculum adjustment based on performance

### 4. Micro Challenge System
- **Content Generation**: Automated quiz and coding challenge creation
- **Code Execution**: Judge0 API for live code testing and grading
- **Difficulty Scaling**: Performance-based challenge adjustment

### 5. Data & Personalization Hub
- **Database**: MongoDB with optimized schemas
- **User Profiling**: Comprehensive learning analytics and preferences
- **Content Management**: Scalable content delivery and organization

### 6. Analytics & Feedback Engine
- **Visualization**: Chart.js and D3.js for interactive data presentation
- **Performance Tracking**: Detailed progress monitoring and reporting
- **Admin Dashboard**: System-wide analytics and user management

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Helmet.js, CORS, Rate Limiting
- **File Upload**: Multer for media handling
- **Real-time**: Firebase Admin SDK

### Frontend
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand for lightweight state handling
- **Routing**: React Router v6 for navigation
- **HTTP Client**: Axios for API communication
- **Charts**: Recharts for data visualization

### Development Tools
- **Package Manager**: pnpm for efficient dependency management
- **Code Quality**: ESLint and Prettier for code formatting
- **Version Control**: Git with conventional commits
- **Environment**: Docker support for containerization

### External APIs
- **AI Services**: OpenAI GPT-4 API for intelligent tutoring
- **Code Execution**: Judge0 API for programming challenges
- **Real-time**: Firebase for live updates and notifications

## 📁 Project Structure

```
learning-buddy/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   ├── jwt.js             # JWT configuration
│   │   ├── openai.js          # OpenAI API setup
│   │   └── firebase.js        # Firebase configuration
│   ├── controllers/           # Business logic controllers
│   │   ├── auth/              # Authentication controllers
│   │   ├── challenges/        # Challenge management
│   │   ├── gamification/      # Gamification logic
│   │   ├── ai/                # AI integration
│   │   └── analytics/         # Analytics processing
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # Authentication middleware
│   │   └── validation.js      # Input validation
│   ├── models/                # MongoDB schemas
│   │   ├── User.js            # User data model
│   │   ├── Challenge.js       # Challenge schema
│   │   ├── UserProgress.js    # Progress tracking
│   │   ├── Badge.js           # Achievement system
│   │   ├── LearningPath.js    # Learning path structure
│   │   └── ChatSession.js     # AI chat sessions
│   ├── routes/                # API route definitions
│   │   ├── auth/              # Authentication routes
│   │   ├── challenges/        # Challenge endpoints
│   │   ├── gamification/      # Gamification APIs
│   │   ├── ai/                # AI service routes
│   │   └── analytics/         # Analytics endpoints
│   ├── seeds/                 # Database seeding
│   │   └── seedDatabase.js    # Sample data generation
│   ├── server.js              # Main server file
│   ├── test-server.js         # Development test server
│   └── package.json           # Backend dependencies
├── frontend/                  # React frontend application
│   └── learning-buddy-frontend/
│       ├── src/
│       │   ├── components/    # Reusable React components
│       │   │   ├── auth/      # Authentication components
│       │   │   ├── layout/    # Layout components
│       │   │   └── ui/        # UI component library
│       │   ├── pages/         # Page components
│       │   │   ├── auth/      # Login/Register pages
│       │   │   ├── challenges/ # Challenge pages
│       │   │   └── learning-paths/ # Learning path pages
│       │   ├── services/      # API service layer
│       │   ├── stores/        # State management
│       │   ├── lib/           # Utility functions
│       │   └── App.jsx        # Main application component
│       ├── public/            # Static assets
│       ├── index.html         # HTML template
│       └── package.json       # Frontend dependencies
├── docs/                      # Documentation
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

Before running Learning Buddy, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **pnpm** (v8.0.0 or higher)
- **MongoDB** (v6.0.0 or higher)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learning-buddy.git
   cd learning-buddy
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend/learning-buddy-frontend
   pnpm install
   ```

4. **Environment Configuration**
   
   Create environment files for both backend and frontend:
   
   **Backend (.env)**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/learning-buddy
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # OpenAI API
   OPENAI_API_KEY=your-openai-api-key-here
   
   # Firebase (Optional)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   
   # Judge0 API (Optional)
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your-judge0-api-key
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```
   
   **Frontend (.env)**
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:5000/api
   
   # App Configuration
   VITE_APP_NAME=Learning Buddy
   VITE_APP_VERSION=1.0.0
   ```

### Running the Application

1. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   
   The backend will be available at `http://localhost:5000`

3. **Start the frontend development server**
   ```bash
   cd frontend/learning-buddy-frontend
   pnpm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

4. **Seed the database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

### Development Mode

For development with hot reloading:

```bash
# Backend with nodemon
cd backend
npm run dev

# Frontend with Vite
cd frontend/learning-buddy-frontend
pnpm run dev
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "profile": {
    "firstName": "string",
    "lastName": "string",
    "dateOfBirth": "date",
    "interests": ["string"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "profile": {},
      "gamification": {}
    },
    "token": "string"
  }
}
```

#### POST /api/auth/login
Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {},
    "token": "string"
  }
}
```

### Challenge Endpoints

#### GET /api/challenges
Retrieve available challenges with filtering options.

**Query Parameters:**
- `category`: Filter by challenge category
- `difficulty`: Filter by difficulty level (beginner, intermediate, advanced)
- `type`: Filter by challenge type (quiz, coding, mixed)
- `page`: Pagination page number
- `limit`: Number of results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "challenges": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

#### POST /api/challenges/:id/attempt
Submit an attempt for a specific challenge.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "string",
      "answer": "string",
      "timeSpent": 30
    }
  ],
  "code": "string",
  "language": "javascript"
}
```

### Gamification Endpoints

#### GET /api/gamification/leaderboard
Retrieve the global leaderboard.

**Query Parameters:**
- `timeframe`: daily, weekly, monthly, all-time
- `category`: Filter by specific category
- `limit`: Number of users to return

#### POST /api/gamification/badges/:badgeId/claim
Claim an earned badge.

### AI Endpoints

#### POST /api/ai/chat/start
Start a new AI chat session.

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "message": "Hello! I'm your AI Learning Buddy..."
  }
}
```

#### POST /api/ai/chat/:sessionId/message
Send a message to the AI assistant.

**Request Body:**
```json
{
  "message": "string",
  "context": {
    "currentChallenge": "string",
    "userProgress": {}
  }
}
```

### Analytics Endpoints

#### GET /api/analytics/dashboard
Get user dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalXp": 2450,
      "level": 8,
      "challengesCompleted": 47,
      "timeSpent": 1240
    },
    "recentActivity": [],
    "progressCharts": {}
  }
}
```

## 🎮 Features in Detail

### Gamification System

Learning Buddy incorporates comprehensive gamification elements to enhance user engagement and motivation:

**Experience Points (XP) System**
- Base XP awarded for challenge completion
- Bonus XP for perfect scores and speed completion
- Streak multipliers for consecutive daily activity
- Category-specific XP bonuses

**Badge Achievement System**
- **Beginner Badges**: First challenge, first perfect score
- **Skill Badges**: Category mastery, language proficiency
- **Achievement Badges**: Speed demon, perfectionist, consistent learner
- **Rare Badges**: Special event participation, community contributions

**Leaderboard Features**
- Global rankings with multiple timeframes
- Category-specific leaderboards
- Friend comparisons and challenges
- Achievement showcases

### AI Learning Assistant

The AI-powered learning buddy provides personalized guidance through:

**Intelligent Tutoring**
- Context-aware explanations and hints
- Step-by-step problem-solving guidance
- Concept clarification and examples
- Learning path recommendations

**Adaptive Learning**
- Performance analysis and weakness identification
- Personalized challenge recommendations
- Difficulty adjustment based on user progress
- Learning style adaptation

**Natural Language Interaction**
- Conversational interface for questions
- Code review and feedback
- Concept explanations in simple terms
- Study plan generation

### Challenge System

The micro challenge system offers diverse learning experiences:

**Challenge Types**
- **Multiple Choice Quizzes**: Concept understanding and recall
- **Coding Challenges**: Programming problem-solving
- **Mixed Challenges**: Combined theoretical and practical questions
- **Project Challenges**: Real-world application scenarios

**Adaptive Difficulty**
- Dynamic difficulty adjustment based on performance
- Prerequisite tracking and enforcement
- Progressive skill building
- Mastery-based advancement

**Real-time Feedback**
- Instant answer validation
- Detailed explanations for incorrect answers
- Performance analytics and insights
- Improvement suggestions

## 🔧 Development

### Code Style and Standards

Learning Buddy follows industry best practices for code quality and maintainability:

**Backend Standards**
- RESTful API design principles
- Comprehensive error handling and logging
- Input validation and sanitization
- Security best practices (OWASP guidelines)
- Modular architecture with separation of concerns

**Frontend Standards**
- Component-based architecture
- TypeScript for type safety
- Responsive design principles
- Accessibility compliance (WCAG 2.1)
- Performance optimization

### Testing Strategy

**Backend Testing**
- Unit tests for individual functions and modules
- Integration tests for API endpoints
- Database testing with test fixtures
- Security testing for authentication and authorization

**Frontend Testing**
- Component unit tests with React Testing Library
- Integration tests for user workflows
- End-to-end testing with Playwright
- Visual regression testing

### Performance Optimization

**Backend Optimizations**
- Database indexing and query optimization
- Caching strategies with Redis
- API response compression
- Rate limiting and request throttling

**Frontend Optimizations**
- Code splitting and lazy loading
- Image optimization and compression
- Bundle size optimization
- Progressive Web App (PWA) features

## 🚀 Deployment

### Production Environment Setup

**Backend Deployment**
1. **Environment Configuration**
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://your-production-db
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name learning-buddy-api
   pm2 startup
   pm2 save
   ```

3. **Reverse Proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

**Frontend Deployment**
1. **Build for Production**
   ```bash
   cd frontend/learning-buddy-frontend
   pnpm run build
   ```

2. **Static File Serving**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### Docker Deployment

**Docker Compose Configuration**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/learning-buddy
    depends_on:
      - mongodb
    
  frontend:
    build: ./frontend/learning-buddy-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Cloud Deployment Options

**AWS Deployment**
- **Backend**: AWS Elastic Beanstalk or ECS
- **Frontend**: AWS S3 + CloudFront
- **Database**: AWS DocumentDB or MongoDB Atlas
- **File Storage**: AWS S3 for user uploads

**Google Cloud Platform**
- **Backend**: Google App Engine or Cloud Run
- **Frontend**: Firebase Hosting
- **Database**: Google Cloud Firestore or MongoDB Atlas
- **File Storage**: Google Cloud Storage

**Heroku Deployment**
- **Backend**: Heroku Dynos with MongoDB Atlas
- **Frontend**: Netlify or Vercel
- **Environment**: Heroku Config Vars

## 🤝 Contributing

We welcome contributions to Learning Buddy! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Create a Pull Request**

### Commit Message Convention

We use conventional commits for clear and consistent commit messages:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

### Code Review Process

All contributions go through a thorough code review process:

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Peer Review**: At least one team member reviews the code
3. **Testing**: Manual testing of new features
4. **Documentation**: Ensure documentation is updated
5. **Merge**: Approved changes are merged to main branch

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT-4 API for AI-powered learning assistance
- **Judge0** for code execution and testing capabilities
- **MongoDB** for the robust document database solution
- **React Team** for the excellent frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **shadcn/ui** for the beautiful component library

## 📞 Support

For support, questions, or feature requests:

- **Email**: support@learningbuddy.com
- **GitHub Issues**: [Create an issue](https://github.com/your-username/learning-buddy/issues)
- **Documentation**: [Full documentation](https://docs.learningbuddy.com)
- **Community**: [Discord server](https://discord.gg/learningbuddy)

## 🗺️ Roadmap

### Version 1.1 (Q2 2024)
- Mobile application (React Native)
- Advanced analytics dashboard
- Collaborative learning features
- Video content integration

### Version 1.2 (Q3 2024)
- Multi-language support
- Advanced AI tutoring capabilities
- Integration with external learning platforms
- Enhanced accessibility features

### Version 2.0 (Q4 2024)
- Virtual reality learning experiences
- Advanced machine learning recommendations
- Enterprise features and SSO
- Advanced reporting and analytics

---

**Built with ❤️ by the Learning Buddy Team**

*Empowering learners worldwide with AI-powered, personalized education.*

