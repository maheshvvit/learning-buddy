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
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-white">
        <div className="flex flex-col justify-center items-center w-full p-12 text-black">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <Brain className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold">Learning Buddy</h1>
          </div>
          
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">
              Your 24/7 Learning Partner
            </h2>
            {/* Removed descriptive paragraph and bullet points as requested */}
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-black">Learning Buddy</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

