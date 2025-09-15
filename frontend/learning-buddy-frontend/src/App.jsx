import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChallengePage from './pages/challenges/ChallengePage';
import ChallengeDetailPage from './pages/challenges/ChallengeDetailPage';
import LearningPathsPage from './pages/learning-paths/LearningPathsPage';
import LearningPathDetailPage from './pages/learning-paths/LearningPathDetailPage';
import ProgressPage from './pages/ProgressPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Protected Route Component
import ProtectedRoute from './components/auth/ProtectedRoute';

import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const initializeAuth = useAuthStore(state => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>
            
            {/* Protected Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Challenges */}
              <Route path="challenges" element={<ChallengePage />} />
              <Route path="challenges/:challengeId" element={<ChallengeDetailPage />} />
              
              {/* Learning Paths */}
              <Route path="learning-paths" element={<LearningPathsPage />} />
              <Route path="learning-paths/:pathId" element={<LearningPathDetailPage />} />
              
              {/* Progress & Analytics */}
              <Route path="progress" element={<ProgressPage />} />
              <Route path="leaderboard" element={<LeaderboardPage />} />
              
              {/* AI Chat */}
              <Route path="chat" element={<ChatPage />} />
              <Route path="chat/:sessionId" element={<ChatPage />} />
              
              {/* User */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
