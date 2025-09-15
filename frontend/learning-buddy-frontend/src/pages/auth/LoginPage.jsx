import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/app/dashboard';

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData);
      console.log('LoginPage: login response:', response);
      const authState = JSON.parse(localStorage.getItem('learning-buddy-auth'));
      console.log('LoginPage: localStorage auth state:', authState);
      toast.success('Welcome back!');
      // Wait for auth state to persist
      await new Promise(resolve => setTimeout(resolve, 500));
      // Initialize auth state
      const { initializeAuth } = useAuthStore.getState();
      await initializeAuth();
      navigate(from, { replace: true });
    } catch (error) {
      console.error('LoginPage: login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-xl shadow-lg text-white border-4 border-pink-300 bg-gradient-to-r from-purple-700/70 via-pink-600/70 to-red-600/70">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        <p className="text-pink-100 mt-2">
          Sign in to your account to continue learning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/auth/forgot-password"
              className="text-primary hover:text-primary/80"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
