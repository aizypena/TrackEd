import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('trainerToken') || localStorage.getItem('adminToken') || localStorage.getItem('staffToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const programService = {
  // Get all programs
  getPrograms: async () => {
    try {
      const response = await axios.get(`${API_URL}/programs`, {
        headers: getAuthHeader(),
      });
      // Return the data array from the response
      return response.data.data || response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single program
  getProgram: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/programs/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
