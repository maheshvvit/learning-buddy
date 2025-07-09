# Learning Buddy - Quick Start Guide

Get your Learning Buddy application up and running in minutes!

## 🚀 One-Command Setup

```bash
# Clone and start the application
git clone <your-repo-url> learning-buddy
cd learning-buddy
cp .env.example .env
./deployment/scripts/deploy.sh start
```

## 📋 Prerequisites

- **Docker** (v20.0+)
- **Docker Compose** (v2.0+)
- **Git**

## ⚡ Quick Setup Steps

### 1. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your settings (minimum required)
nano .env
```

**Required Environment Variables:**
```env
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters
OPENAI_API_KEY=sk-your-openai-api-key-here
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
```

### 2. Start Application
```bash
# Make deploy script executable
chmod +x deployment/scripts/deploy.sh

# Start all services
./deployment/scripts/deploy.sh start
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## 🎯 Test the Application

1. **Register a new account** at http://localhost:3000
2. **Login** with your credentials
3. **Browse challenges** in the dashboard
4. **Try the AI chat** feature
5. **Complete a challenge** to earn XP and badges

## 🛠️ Common Commands

```bash
# View service status
./deployment/scripts/deploy.sh status

# View logs
./deployment/scripts/deploy.sh logs

# Stop services
./deployment/scripts/deploy.sh stop

# Restart services
./deployment/scripts/deploy.sh restart

# Create database backup
./deployment/scripts/deploy.sh backup

# Health check
./deployment/scripts/deploy.sh health
```

## 🔧 Development Mode

For development with hot reloading:

```bash
# Backend (in backend/ directory)
npm install
npm run dev

# Frontend (in frontend/learning-buddy-frontend/ directory)
pnpm install
pnpm run dev
```

## 📚 Next Steps

1. **Read the full README.md** for detailed information
2. **Check API_DOCUMENTATION.md** for API details
3. **Customize the application** for your needs
4. **Deploy to production** using the provided scripts

## 🆘 Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker --version
docker-compose --version

# Check logs for errors
./deployment/scripts/deploy.sh logs
```

### Database connection issues
```bash
# Restart database service
docker-compose restart mongodb

# Check database logs
docker-compose logs mongodb
```

### Frontend not loading
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Restart frontend service
docker-compose restart frontend
```

## 📞 Support

- **Documentation**: See README.md and docs/ folder
- **Issues**: Check logs with `./deployment/scripts/deploy.sh logs`
- **API Reference**: docs/API_DOCUMENTATION.md

---

**🎉 Enjoy your Learning Buddy application!**

