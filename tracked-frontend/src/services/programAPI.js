// Program related API endpoints
import { API_URL as API_BASE_URL } from '../config/api';

// Get token from localStorage (check staff, admin, or general token)
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || 
         localStorage.getItem('staffToken') || 
         localStorage.getItem('token') || 
         localStorage.getItem('userToken') ||
         sessionStorage.getItem('userToken');
};

// Check if user is actually logged in with valid session
const isAuthenticated = () => {
  // Check for admin session
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  if (adminToken && adminUser) return true;
  
  // Check for staff session
  const staffToken = localStorage.getItem('staffToken');
  const staffUser = localStorage.getItem('staffUser');
  if (staffToken && staffUser) return true;
  
  // Check for trainer session
  const trainerToken = localStorage.getItem('trainerToken');
  const trainerUser = localStorage.getItem('trainerUser');
  if (trainerToken && trainerUser) return true;
  
  // Check for applicant/student session
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  if (userToken && userData) return true;
  
  return false;
};

export const programAPI = {
  // Get all programs
  getAll: async (params = {}) => {
    try {
      // Use public endpoint if not authenticated, otherwise use authenticated endpoint
      const endpoint = isAuthenticated() ? '/programs' : '/public/programs';
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${API_BASE_URL}${endpoint}?${queryString}` 
        : `${API_BASE_URL}${endpoint}`;

      const headers = {
        'Accept': 'application/json'
      };
      
      // Only add Authorization header if authenticated
      if (isAuthenticated()) {
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
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
