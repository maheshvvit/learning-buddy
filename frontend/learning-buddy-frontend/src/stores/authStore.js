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
        console.log('AuthStore: login called with credentials', credentials);
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          console.log('AuthStore: login response', response);
          const { user, token } = response.data.data;
          console.log('AuthStore: extracted user and token', user, token);
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          console.log('AuthStore: login state updated', { user, token });
          
          // Set token for future requests
          authService.setAuthToken(token);

          // Persist token and user in localStorage correctly
          localStorage.setItem('learning-buddy-auth', JSON.stringify({
            state: {
              user,
              token,
              isAuthenticated: true,
              isInitializingAuth: false
            }
          }));
          console.log('AuthStore: localStorage updated with auth state');
          
          return response;
        } catch (error) {
          console.log('AuthStore: login error', error);
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          });
          throw error;
        }
      },

      logout: () => {
        console.log('AuthStore: logout called');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        console.log('AuthStore: logout state updated');
        
        // Clear token from requests
        authService.clearAuthToken();

        // Clear localStorage
        localStorage.removeItem('learning-buddy-auth');
      },

      refreshUser: async () => {
      console.log('AuthStore: refreshUser called');
      try {
        const response = await authService.getProfile();
        console.log('AuthStore: refreshUser response', response);
        const { user } = response.data;
        
        set({ user, isAuthenticated: true });
        console.log('AuthStore: refreshUser state updated');
        return response;
      } catch (error) {
        console.log('AuthStore: refreshUser error', error);
        get().logout();
        throw error;
      }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
      console.log('AuthStore: initializeAuth called');
      set({ isInitializingAuth: true });
      const { token } = get();
      console.log('AuthStore: initializeAuth token:', token);
      if (token) {
        authService.setAuthToken(token);
        try {
          console.log('AuthStore: calling refreshUser');
          await get().refreshUser();
          console.log('AuthStore: refreshUser succeeded');
          set({ isAuthenticated: true });
        } catch (error) {
          console.log('AuthStore: refreshUser failed', error);
          // get().logout();
        }
      }
      set({ isInitializingAuth: false });
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          const { user, token } = response.data.data;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          
          authService.setAuthToken(token);
          
          localStorage.setItem('learning-buddy-auth', JSON.stringify({
            state: {
              user,
              token,
              isAuthenticated: true,
              isInitializingAuth: false
            }
          }));
          
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed'
          });
          throw error;
        }
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
      }
    }),
    {
      name: 'learning-buddy-auth'
    }
  )
);

useAuthStore.subscribe(
  (state) => {
    if (state._hasHydrated) {
      useAuthStore.getState().initializeAuth();
    }
  },
  (state) => state._hasHydrated
);
