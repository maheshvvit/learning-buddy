import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('learning-buddy-auth');
      console.log('authService: axios request interceptor token from localStorage:', token);
      if (token) {
        try {
          const authData = JSON.parse(token);
          console.log('authService: parsed authData:', authData);
          if (authData.state?.token) {
            let tokenValue = authData.state.token;
            if (typeof tokenValue === 'object' && tokenValue.token) {
              tokenValue = tokenValue.token;
            }
            config.headers.Authorization = `Bearer ${tokenValue}`;
            console.log('authService: Authorization header set:', config.headers.Authorization);
          } else {
            console.log('authService: No token found in authData.state');
          }
        } catch (error) {
          console.error('Error parsing auth token:', error);
        }
      } else {
        console.log('authService: No token found in localStorage');
      }
      console.log('authService: request config headers:', config.headers);
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('learning-buddy-auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Set auth token for requests
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('learning-buddy-auth');
  },

  // Auth endpoints
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  logout: () => {
    return api.post('/auth/logout');
  },

  getProfile: () => {
    return api.get('/auth/profile');
  },

  updateProfile: (profileData) => {
    if (profileData instanceof FormData) {
      return api.put('/auth/profile', profileData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return api.put('/auth/profile', profileData);
  },

  changePassword: (passwordData) => {
    return api.post('/auth/change-password', passwordData);
  },

  requestPasswordReset: (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: (resetData) => {
    return api.post('/auth/reset-password', resetData);
  },

  updateSettings: (settings) => {
    return api.put('/auth/settings', settings);
  },

  getUserStats: () => {
    return api.get('/auth/stats');
  }
};

export default api;

