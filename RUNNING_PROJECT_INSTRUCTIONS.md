# Running Learning Buddy Project

## Method 1: Local Development Setup

### Prerequisites
- Node.js v18 or higher
- pnpm v8 or higher
- MongoDB v6 or higher (running locally or via Docker)
- Git

### Steps

1. Clone the repository (if not already done)
   ```bash
   git clone https://github.com/your-username/learning-buddy.git
   cd learning-buddy
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend/learning-buddy-frontend
   pnpm install
   ```

4. Create environment files

   - Backend `.env` file (in `backend/` directory)
     ```
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://localhost:27017/learning-buddy
     JWT_SECRET=your-super-secret-jwt-key-here
     JWT_EXPIRES_IN=7d
     OPENAI_API_KEY=your-openai-api-key-here
     FIREBASE_PROJECT_ID=your-firebase-project-id
     FIREBASE_PRIVATE_KEY=your-firebase-private-key
     FIREBASE_CLIENT_EMAIL=your-firebase-client-email
     JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
     JUDGE0_API_KEY=your-judge0-api-key
     FRONTEND_URL=http://localhost:5173
     ```

   - Frontend `.env` file (in `frontend/learning-buddy-frontend/` directory)
     ```
     VITE_API_URL=http://localhost:5000/api
     VITE_APP_NAME=Learning Buddy
     VITE_APP_VERSION=1.0.0
     ```

5. Start MongoDB locally or via Docker

   - Locally (if installed)
     ```bash
     sudo systemctl start mongod
     ```

   - Or via Docker
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo:6
     ```

6. Start backend server
   ```bash
   cd backend
   npm start
   ```
   Backend will be available at http://localhost:5000

7. Start frontend development server
   ```bash
   cd ../frontend/learning-buddy-frontend
   pnpm run dev
   ```
   Frontend will be available at http://localhost:5173

8. (Optional) Seed the database with sample data
   ```bash
   cd backend
   npm run seed
   ```

---

## Method 2: Using Docker Compose

### Prerequisites
- Docker
- Docker Compose

### Steps

1. Ensure Docker is running

2. From the project root directory, run:
   ```bash
   docker-compose up --build
   ```

3. This will start MongoDB, Redis, backend API, frontend app, and nginx reverse proxy.

4. Access the frontend at http://localhost:3000

5. Backend API will be available at http://localhost:5000

---

## Notes

- Make sure to set environment variables in `.env` files or Docker environment as needed.
- For development, use Method 1 to get hot reloading and easier debugging.
- For production or full stack testing, use Method 2 with Docker Compose.

---

If you need any further help or specific commands, feel free to ask.
