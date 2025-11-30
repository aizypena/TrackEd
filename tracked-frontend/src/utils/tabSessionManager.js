/**
 * Tab Session Manager - Simple approach
 * Auth tokens stored in sessionStorage automatically clear when tab is closed
 * but persist during page refresh
 */

/**
 * Start tab session management
 */
export const startTabSession = () => {
  // No need for beforeunload event
  // sessionStorage automatically clears when tab is closed
  return {
    cleanup: () => {
      // Nothing to clean up
    }
  };
};

/**
 * Set auth data (use sessionStorage - auto clears on tab close)
 */
export const setAuthData = (key, value) => {
  sessionStorage.setItem(key, value);
};

/**
 * Get auth data
 */
export const getAuthData = (key) => {
  return sessionStorage.getItem(key);
};

/**
 * Remove auth data
 */
export const removeAuthData = (key) => {
  sessionStorage.removeItem(key);
};

/**
 * Clear auth data for specific role
 */
export const clearRoleAuthData = (role) => {
  switch (role) {
    case 'admin':
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
      break;
    case 'staff':
      sessionStorage.removeItem('staffToken');
      sessionStorage.removeItem('staffUser');
      break;
    case 'trainer':
      sessionStorage.removeItem('trainerToken');
      sessionStorage.removeItem('trainerUser');
      break;
    case 'student':
      sessionStorage.removeItem('studentToken');
      sessionStorage.removeItem('studentUser');
      break;
    case 'applicant':
    case 'user':
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userData');
      break;
  }
};
