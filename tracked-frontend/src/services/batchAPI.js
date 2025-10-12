// Batch related API endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Get token from localStorage (admin uses 'adminToken')
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

export const batchAPI = {
  // Get all batches
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${API_BASE_URL}/batches?${queryString}` 
        : `${API_BASE_URL}/batches`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch batches');
      }

      return data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Get single batch by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch batch');
      }

      return data;
    } catch (error) {
      console.error('Error fetching batch:', error);
      throw error;
    }
  },

  // Create new batch
  create: async (batchData) => {
    try {
      console.log('Creating batch with data:', batchData);
      
      const response = await fetch(`${API_BASE_URL}/batches`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(batchData)
      });

      const data = await response.json();
      console.log('API Response:', response.status, data);

      if (!response.ok) {
        const error = new Error(data.message || 'Failed to create batch');
        error.errors = data.errors;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update existing batch
  update: async (id, batchData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(batchData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update batch');
      }

      return data;
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  },

  // Delete batch
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete batch');
      }

      return data;
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  },

  // Get enrolled students for a batch
  getEnrolledStudents: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/batches/${id}/students`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch enrolled students');
      }

      return data;
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      throw error;
    }
  }
};
