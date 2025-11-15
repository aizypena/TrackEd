/**
 * Admin Authentication Utilities
 */

/**
 * Get the stored admin token
 * @returns {string|null} The admin authentication token
 */
export const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * Get the stored admin user data
 * @returns {object|null} The admin user object
 */
export const getAdminUser = () => {
  const userStr = localStorage.getItem('adminUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing admin user data:', error);
    return null;
  }
};

/**
 * Check if admin is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAdminAuthenticated = () => {
  const token = getAdminToken();
  const user = getAdminUser();
  
  if (!token || !user) return false;
  
  // Verify role is admin
  return user.role === 'admin';
};

/**
 * Store admin authentication data
 * @param {string} token - The authentication token
 * @param {object} user - The user data
 */
export const setAdminAuth = (token, user) => {
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminUser', JSON.stringify(user));
};

/**
 * Clear admin authentication data and logout
 * @returns {void}
 */
export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  
  // Redirect to admin login page
  window.location.href = '/admin/login';
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAdminAuthHeaders = () => {
  const token = getAdminToken();
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
