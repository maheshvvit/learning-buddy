import axios from 'axios';

const API_BASE_URL = '/api/learning-paths';

export const fetchLearningPaths = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch learning paths:', error);
    throw error;
  }
};
