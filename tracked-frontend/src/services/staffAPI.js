import { getStaffAuthHeaders, getStaffToken, setStaffAuth } from '../utils/staffAuth';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Staff API Service
 */
export const staffAPI = {
  /**
   * Update staff profile
   * @param {object} profileData - The profile data to update
   * @returns {Promise<object>} Updated user data
   */
  updateProfile: async (profileData) => {
    try {
      console.log('API URL:', `${API_BASE_URL}/staff/profile`);
      console.log('Headers:', getStaffAuthHeaders());
      console.log('Profile Data:', profileData);

      const response = await fetch(`${API_BASE_URL}/staff/profile`, {
        method: 'PUT',
        headers: getStaffAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Success response data:', data);
      
      // Update localStorage with new user data
      if (data.user) {
        const token = getStaffToken();
        setStaffAuth(token, data.user);
        console.log('Updated localStorage with new user data');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating staff profile:', error);
      throw error;
    }
  },

  /**
   * Update staff password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} newPasswordConfirmation - New password confirmation
   * @returns {Promise<object>} Response data
   */
  updatePassword: async (currentPassword, newPassword, newPasswordConfirmation) => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/password`, {
        method: 'PUT',
        headers: getStaffAuthHeaders(),
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
      console.error('Error updating staff password:', error);
      throw error;
    }
  },
};

export default staffAPI;
