import { getTrainerAuthHeaders, getTrainerToken, setTrainerAuth } from '../utils/trainerAuth';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Trainer API Service
 */
export const trainerAPI = {
  /**
   * Update trainer profile
   * @param {object} profileData - The profile data to update
   * @returns {Promise<object>} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trainer/profile`, {
        method: 'PUT',
        headers: getTrainerAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update localStorage with new user data
      if (data.user) {
        const token = getTrainerToken();
        setTrainerAuth(token, data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating trainer profile:', error);
      throw error;
    }
  },

  /**
   * Update trainer password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirmation - New password confirmation
   * @returns {Promise<object>} Response data
   */
  updatePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trainer/password`, {
        method: 'PUT',
        headers: getTrainerAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPasswordConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update password');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating trainer password:', error);
      throw error;
    }
  },

  /**
   * Get assigned programs
   * @returns {Promise<object>} Assigned programs data
   */
  getAssignedPrograms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trainer/assigned-programs`, {
        method: 'GET',
        headers: getTrainerAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assigned programs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching assigned programs:', error);
      throw error;
    }
  },
};

export default trainerAPI;
