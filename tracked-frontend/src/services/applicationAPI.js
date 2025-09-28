// Application related API endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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