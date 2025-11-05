// Application related API endpoints
import { API_URL as API_BASE_URL } from '../config/api';

export const applicationAPI = {
  submit: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/application`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      return data;
    } catch (error) {
      console.error('Application submission error:', error);
      throw error;
    }
  }
};