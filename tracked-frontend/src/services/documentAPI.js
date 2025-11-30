import { API_URL as API_BASE_URL } from '../config/api';

// Get auth token from localStorage or sessionStorage
const getAuthToken = () => {
  const token = sessionStorage.getItem('userToken');
  
  if (!token) {
    console.warn('No authentication token found. User needs to login again.');
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
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  post: async (endpoint, data, isFormData = false) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
    
    // Only add Content-Type for JSON, FormData sets its own
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
  
  delete: async (endpoint) => {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token available. Please login again.');
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  },
};

// Document API
const documentAPI = {
  // Get all documents for authenticated user
  getDocuments: async () => {
    try {
      const response = await apiClient.get('/documents');
      return response;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },
  
  // Upload a document
  uploadDocument: async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      
      const response = await apiClient.post('/documents/upload', formData, true);
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (type) => {
    try {
      const response = await apiClient.delete(`/documents/${type}`);
      return response;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // Get document view URL with proper authentication
  getDocumentViewUrl: async (type) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token available. Please login again.');
      }
      
      const response = await fetch(`${API_BASE_URL}/documents/${type}/view`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      // Create a URL for the blob
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },
};

export default documentAPI;
