import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedStaffRoute = ({ children }) => {
  // Check if staff is logged in by looking for the staff token in localStorage
  const staffToken = localStorage.getItem('staffToken');
  const staffUser = localStorage.getItem('staffUser');
  
  // If no token or user data exists, redirect to staff login
  if (!staffToken || !staffUser) {
    return <Navigate to="/staff/login" replace />;
  }
  
  // Verify user role is staff or trainer
  try {
    const user = JSON.parse(staffUser);
    if (user.role !== 'staff' && user.role !== 'trainer') {
      // Invalid role, clear storage and redirect
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffUser');
      return <Navigate to="/staff/login" replace />;
    }
  } catch (error) {
    // Invalid user data, clear storage and redirect
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffUser');
    return <Navigate to="/staff/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedStaffRoute;
