// Program related API endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Get token from localStorage (check staff, admin, or general token)
const getAuthToken = () => {
  return localStorage.getItem('staffToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
};

export const programAPI = {
  // Get all programs
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${API_BASE_URL}/programs?${queryString}` 
        : `${API_BASE_URL}/programs`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch programs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      throw error;
    }
  },

  // Get single program by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch program');
      }

      return data;
    } catch (error) {
      console.error('Error fetching program:', error);
      throw error;
    }
  },

  // Create new program
  create: async (programData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/programs`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(programData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create program');
      }

      return data;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  },

  // Update existing program
  update: async (id, programData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(programData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update program');
      }

      return data;
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  },

  // Delete program
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/programs/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete program');
      }

      return data;
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }
};
