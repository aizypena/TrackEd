// System Log API endpoints
import { API_URL as API_BASE_URL } from '../config/api';

// Get token from localStorage (check staff, admin, or general token)
const getAuthToken = () => {
  return sessionStorage.getItem('staffToken') || sessionStorage.getItem('adminToken') || localStorage.getItem('token');
};

export const systemLogAPI = {
  // Create a new system log entry
  logAction: async (action, description, logLevel = 'info') => {
    try {
      const response = await fetch(`${API_BASE_URL}/log-action`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          action,
          description,
          log_level: logLevel
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log action');
      }

      return data;
    } catch (error) {
      console.error('Error logging action:', error);
      // Don't throw error - logging should not break the main functionality
      return { success: false, error: error.message };
    }
  },

  // Get all system logs (admin only)
  getAll: async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const url = queryString 
        ? `${API_BASE_URL}/admin/system-logs?${queryString}` 
        : `${API_BASE_URL}/admin/system-logs`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch system logs');
      }

      return data;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw error;
    }
  }
};
