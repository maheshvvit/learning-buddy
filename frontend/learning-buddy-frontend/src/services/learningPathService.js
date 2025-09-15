import axios from 'axios';

const API_BASE_URL = '/api/learning-paths';

export const fetchLearningPaths = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data; // Fixed: Return the actual learning paths array directly
  } catch (error) {
    console.error('Failed to fetch learning paths:', error);
    throw error;
  }
};

export const fetchLearningPathById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch learning path with id ${id}:`, error);
    throw error;
  }
};
