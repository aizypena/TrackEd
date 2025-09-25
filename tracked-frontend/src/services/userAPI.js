const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('Admin user from localStorage:', adminUser);
  console.log('Admin token from localStorage:', adminToken);
  
  // Check if we have a token - either in adminUser.token or as separate adminToken
  const token = adminUser.token || adminToken;
  
  if (!token) {
    console.warn('No authentication token found. Admin needs to login again.');
    return null;
  }
  
  return token;
};

// API client with authentication
const apiClient = {
  get: async (endpoint, params = {}) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }
    
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  post: async (endpoint, data = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  put: async (endpoint, data = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  delete: async (endpoint) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};

// User API methods
export const userAPI = {
  // Get all users with pagination and filtering
  getUsers: async (params = {}) => {
    return apiClient.get('/users', params);
  },

  // Get user statistics
  getStats: async () => {
    return apiClient.get('/users/stats');
  },

  // Get specific user
  getUser: async (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  // Update user
  updateUser: async (userId, data) => {
    return apiClient.put(`/users/${userId}`, data);
  },

  // Delete user
  deleteUser: async (userId) => {
    return apiClient.delete(`/users/${userId}`);
  },
};

export default userAPI;