/**
 * Trainer Authentication Utilities
 */

/**
 * Get the stored trainer token
 * @returns {string|null} The trainer authentication token
 */
export const getTrainerToken = () => {
  return localStorage.getItem('trainerToken');
};

/**
 * Get the stored trainer user data
 * @returns {object|null} The trainer user object
 */
export const getTrainerUser = () => {
  const userStr = localStorage.getItem('trainerUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing trainer user data:', error);
    return null;
  }
};

/**
 * Check if trainer is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isTrainerAuthenticated = () => {
  const token = getTrainerToken();
  const user = getTrainerUser();
  
  if (!token || !user) return false;
  
  // Verify role is trainer
  return user.role === 'trainer';
};

/**
 * Store trainer authentication data
 * @param {string} token - The authentication token
 * @param {object} user - The user data
 */
export const setTrainerAuth = (token, user) => {
  localStorage.setItem('trainerToken', token);
  localStorage.setItem('trainerUser', JSON.stringify(user));
};

/**
 * Clear trainer authentication data and logout
 * @returns {void}
 */
export const trainerLogout = () => {
  localStorage.removeItem('trainerToken');
  localStorage.removeItem('trainerUser');
  // Also remove old token format for backwards compatibility
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  
  // Redirect to trainer login page
  window.location.href = '/trainer-lms/login';
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization
 */
export const getTrainerAuthHeaders = () => {
  const token = getTrainerToken();
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
