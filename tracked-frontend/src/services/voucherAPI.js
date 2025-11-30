// Voucher related API endpoints
import { API_URL as API_BASE_URL } from '../config/api';

// Get token from localStorage (admin uses 'adminToken')
const getAuthToken = () => {
  return sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
};

export const voucherAPI = {
  // Get all vouchers
  getAll: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${API_BASE_URL}/vouchers?${queryString}` 
        : `${API_BASE_URL}/vouchers`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch vouchers');
      }

      return data;
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      throw error;
    }
  },

  // Get single voucher by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch voucher');
      }

      return data;
    } catch (error) {
      console.error('Error fetching voucher:', error);
      throw error;
    }
  },

  // Create new voucher
  create: async (voucherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          console.error('Validation errors:', JSON.stringify(data.errors, null, 2));
          const error = new Error(data.message || 'Failed to create voucher');
          error.errors = data.errors;
          throw error;
        }
        throw new Error(data.message || 'Failed to create voucher');
      }

      return data;
    } catch (error) {
      console.error('Error creating voucher:', error);
      throw error;
    }
  },

  // Update voucher
  update: async (id, voucherData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(voucherData)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          console.error('Validation errors:', JSON.stringify(data.errors, null, 2));
          const error = new Error(data.message || 'Failed to update voucher');
          error.errors = data.errors;
          throw error;
        }
        throw new Error(data.message || 'Failed to update voucher');
      }

      return data;
    } catch (error) {
      console.error('Error updating voucher:', error);
      throw error;
    }
  },

  // Delete voucher
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vouchers/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete voucher');
      }

      return data;
    } catch (error) {
      console.error('Error deleting voucher:', error);
      throw error;
    }
  }
};
