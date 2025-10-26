import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('trainerToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const quizService = {
  // Get all quizzes with optional filters
  getQuizzes: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`${API_URL}/quizzes?${params.toString()}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single quiz with questions
  getQuiz: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/quizzes/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new quiz
  createQuiz: async (quizData) => {
    try {
      const response = await axios.post(`${API_URL}/quizzes`, quizData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    try {
      const response = await axios.put(`${API_URL}/quizzes/${id}`, quizData, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/quizzes/${id}`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
