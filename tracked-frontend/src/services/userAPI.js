const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const adminToken = localStorage.getItem('adminToken');
  
  // console.log('Admin user from localStorage:', adminUser);
  // console.log('Admin token from localStorage:', adminToken);
  
  // Check if we have a token - either in adminUser.token or as separate adminToken
  const token = adminUser.token || adminToken;
  
  if (!token) {
    // console.warn('No authentication token found. Admin needs to login again.');
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
    
    // Check if data is FormData for file uploads
    const isFormData = data instanceof FormData;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
    
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle validation errors (422)
      if (response.status === 422 && errorData.errors) {
        const errorMessages = Object.values(errorData.errors).flat();
        throw new Error(errorMessages.join(', ') || errorData.message || 'Validation failed');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
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

  // Get trainers (users with role 'trainer')
  getTrainers: async () => {
    const response = await apiClient.get('/users', { role: 'trainer' });
    return response;
  },

  // Get user statistics
  getStats: async () => {
    return apiClient.get('/users/stats');
  },

  // Get specific user
  getUser: async (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  // Create new user
  createUser: async (data) => {
    return apiClient.post('/users', data);
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