import { API_URL } from '../config/api';

// Get admin auth headers
const getAdminAuthHeaders = () => {
  const token = sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const enrollmentAPI = {
  // Get all enrolled students
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) {
        queryParams.append('search', filters.search);
      }
      if (filters.program && filters.program !== 'all') {
        queryParams.append('program', filters.program);
      }
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      if (filters.batch && filters.batch !== 'all') {
        queryParams.append('batch', filters.batch);
      }

      const url = `${API_URL}/admin/students${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  // Get enrollment statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_URL}/admin/students`, {
        method: 'GET',
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate stats from the students data
      const students = data.students || [];
      const stats = {
        total: students.length,
        active: students.filter(s => s.status?.toLowerCase() === 'active').length,
        pending: students.filter(s => s.status?.toLowerCase() === 'pending').length,
        completed: students.filter(s => s.status?.toLowerCase() === 'completed').length,
      };

      return { success: true, stats, programs: data.programs || [], batches: data.batches || [] };
    } catch (error) {
      console.error('Error fetching enrollment stats:', error);
      throw error;
    }
  },

  // Update enrollment
  update: async (userId, updateData) => {
    try {
      const response = await fetch(`${API_URL}/admin/students/${userId}`, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating enrollment:', error);
      throw error;
    }
  },

  // Update enrollment status
  updateStatus: async (studentId, status) => {
    try {
      const response = await fetch(`${API_URL}/users/${studentId}`, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      throw error;
    }
  },

  // Delete enrollment
  delete: async (studentId, password) => {
    try {
      const response = await fetch(`${API_URL}/admin/students/${studentId}`, {
        method: 'DELETE',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  },
};

export default enrollmentAPI;
