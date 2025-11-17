// Contact form API endpoints
import { API_URL as API_BASE_URL } from '../config/api';

export const contactAPI = {
  /**
   * Submit contact form message
   * @param {Object} formData - Contact form data
   * @param {string} formData.full_name - Full name
   * @param {string} formData.email - Email address
   * @param {string} formData.phone - Phone number
   * @param {string} formData.subject - Message subject
   * @param {string} formData.message - Message content
   * @returns {Promise<Object>} Response data
   */
  submit: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      return data;
    } catch (error) {
      console.error('Contact form submission error:', error);
      throw error;
    }
  }
};
