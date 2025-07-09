import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Set token for future requests
          authService.setAuthToken(token);
          
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          const { user, token } = response.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          // Set token for future requests
          authService.setAuthToken(token);
          
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        // Clear token from requests
        authService.clearAuthToken();
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.updateProfile(profileData);
          const { user } = response.data;
          
          set({
            user,
            isLoading: false,
            error: null
          });
          
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Profile update failed'
          });
          throw error;
        }
      },

      refreshUser: async () => {
        try {
          const response = await authService.getProfile();
          const { user } = response.data;
          
          set({ user });
          return response;
        } catch (error) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Initialize auth state from stored token
      initializeAuth: () => {
        const { token } = get();
        if (token) {
          authService.setAuthToken(token);
          // Optionally refresh user data
          get().refreshUser().catch(() => {
            // If refresh fails, clear stored auth
            get().logout();
          });
        }
      }
    }),
    {
      name: 'learning-buddy-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Initialize auth on store creation
useAuthStore.getState().initializeAuth();

