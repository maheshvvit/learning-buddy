import api from './authService';

export const getDashboardAnalytics = async (timeframe) => {
  try {
    const response = await api.get('analytics/dashboard', {
      params: { timeframe }
    });
    return response.data.data.analytics;
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error);
    throw error;
  }
};
