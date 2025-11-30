import { API_URL } from '../config/api';

const getAuthHeader = () => {
  const token = sessionStorage.getItem('staffToken') || sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
};

export const equipmentAPI = {
  // Get all equipment with filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.location && filters.location !== 'all') params.append('location', filters.location);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const queryString = params.toString();
    const url = `${API_URL}/equipment${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch equipment');
    }

    return await response.json();
  },

  // Get single equipment
  getById: async (id) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch equipment');
    }

    return await response.json();
  },

  // Create equipment
  create: async (data) => {
    const response = await fetch(`${API_URL}/equipment`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create equipment');
    }

    return await response.json();
  },

  // Update equipment
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update equipment');
    }

    return await response.json();
  },

  // Delete equipment
  delete: async (id) => {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete equipment');
    }

    return await response.json();
  },

  // Get statistics
  getStatistics: async () => {
    const response = await fetch(`${API_URL}/equipment/statistics`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_URL}/equipment/categories`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  },

  // Get locations
  getLocations: async () => {
    const response = await fetch(`${API_URL}/equipment/locations`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }

    return await response.json();
  },

  // Add maintenance history
  addMaintenanceHistory: async (id, data) => {
    const response = await fetch(`${API_URL}/equipment/${id}/maintenance`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add maintenance history');
    }

    return await response.json();
  },

  // Record maintenance (alias for addMaintenanceHistory)
  recordMaintenance: async (id, data) => {
    return equipmentAPI.addMaintenanceHistory(id, data);
  },
};
