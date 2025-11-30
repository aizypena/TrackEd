/**
 * Staff Authentication Utilities
 */

/**
 * Get the stored staff token
 * @returns {string|null} The staff authentication token
 */
export const getStaffToken = () => {
  return sessionStorage.getItem('staffToken');
};

/**
 * Get the stored staff user data
 * @returns {object|null} The staff user object
 */
export const getStaffUser = () => {
  const userStr = sessionStorage.getItem('staffUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing staff user data:', error);
    return null;
  }
};

/**
 * Check if staff is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isStaffAuthenticated = () => {
  const token = getStaffToken();
  const user = getStaffUser();
  
  if (!token || !user) return false;
  
  // Verify role is staff or trainer
  return user.role === 'staff' || user.role === 'trainer';
};

/**
 * Store staff authentication data
 * @param {string} token - The authentication token
 * @param {object} user - The user data
 */
export const setStaffAuth = (token, user) => {
  sessionStorage.setItem('staffToken', token);
  sessionStorage.setItem('staffUser', JSON.stringify(user));
};

/**
 * Clear staff authentication data and logout
 * @returns {void}
 */
export const staffLogout = () => {
  sessionStorage.removeItem('staffToken');
  sessionStorage.removeItem('staffUser');
  
  // Redirect to staff login page
  window.location.href = '/staff/login';
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization
 */
export const getStaffAuthHeaders = () => {
  const token = getStaffToken();
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
