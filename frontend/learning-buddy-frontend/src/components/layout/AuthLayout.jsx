import { Outlet, Navigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary">
        <div className="flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-primary-foreground rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Learning Buddy</h1>
          </div>
          
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              Your 24/7 Learning Partner
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Personalized challenges, AI-powered guidance, and gamified learning 
              to help you achieve your goals faster than ever.
            </p>
            
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Interactive challenges and quizzes</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>AI-powered learning recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Progress tracking and analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                <span>Badges and leaderboards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Learning Buddy</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

