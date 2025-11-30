import axios from 'axios';
import { API_URL } from '../config/api';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('trainerToken') || sessionStorage.getItem('adminToken') || sessionStorage.getItem('staffToken');
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
