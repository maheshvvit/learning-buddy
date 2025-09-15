import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = () => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!usernameRegex.test(formData.username)) {
      toast.error('Username must be 3-30 characters and can only contain letters, numbers, and underscores');
      return false;
    }

    if (!emailRegex.test(formData.email)) {
      toast.error('Please provide a valid email address');
      return false;
    }

    if (!passwordRegex.test(formData.password)) {
      toast.error('Password must be at least 6 characters and contain at least one lowercase letter, one uppercase letter, and one number');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName
        }
      };

      await register(userData);
      toast.success('Account created successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      const { initializeAuth } = useAuthStore.getState();
      await initializeAuth();
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-xl shadow-lg border border-gray-300 bg-white text-gray-900">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold mb-2 text-gray-900">Create your account</h2>
        <p className="text-gray-600">Join thousands of learners on their journey to success</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
          <Label htmlFor="firstName" className="text-pink-600 opacity-100">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
              placeholder="Alice"
            />
          </div>
          <div>
          <Label htmlFor="lastName" className="text-pink-600 opacity-100">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
              placeholder="Smith"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="username" className="text-pink-600 opacity-100">Username</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            className="mt-1 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
            placeholder="alice123"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-pink-600 opacity-100">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
            placeholder="alice@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-pink-600 opacity-100">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="pr-10 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-pink-600 hover:text-pink-800"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-pink-600 opacity-100">Confirm password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="pr-10 bg-pink-50 text-pink-900 placeholder-pink-400 focus:ring-pink-400 focus:border-pink-400"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-pink-600 hover:text-pink-800"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-colors duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="text-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-md p-2 text-white font-semibold">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="underline hover:text-yellow-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
