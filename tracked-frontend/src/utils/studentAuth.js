/**
 * Student Authentication Utilities
 */

/**
 * Get the stored student token
 * @returns {string|null} The student authentication token
 */
export const getStudentToken = () => {
  return localStorage.getItem('studentToken');
};

/**
 * Get the stored student user data
 * @returns {object|null} The student user object
 */
export const getStudentUser = () => {
  const userStr = localStorage.getItem('studentUser');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing student user data:', error);
    return null;
  }
};

/**
 * Check if student is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isStudentAuthenticated = () => {
  const token = getStudentToken();
  const user = getStudentUser();
  
  if (!token || !user) return false;
  
  // Verify role is student
  return user.role === 'student';
};

/**
 * Store student authentication data
 * @param {string} token - The authentication token
 * @param {object} user - The user data
 */
export const setStudentAuth = (token, user) => {
  localStorage.setItem('studentToken', token);
  localStorage.setItem('studentUser', JSON.stringify(user));
};

/**
 * Clear student authentication data and logout
 * @returns {void}
 */
export const studentLogout = () => {
  localStorage.removeItem('studentToken');
  localStorage.removeItem('studentUser');
  
  // Redirect to student login page
  window.location.href = '/smi-lms/login';
};

/**
 * Get authorization header for API requests
 * @returns {object} Headers object with Authorization
 */
export const getStudentAuthHeaders = () => {
  const token = getStudentToken();
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
