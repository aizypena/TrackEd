import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedApplicantRoute = ({ children }) => {
  // Check if applicant/user is logged in by looking for the user token in localStorage
  const userToken = sessionStorage.getItem('userToken');
  const userData = sessionStorage.getItem('userData');
  
  // If no token or user data exists, redirect to login
  if (!userToken || !userData) {
    return <Navigate to="/login" replace />;
  }
  
  // Verify user role is applicant or student
  try {
    const user = JSON.parse(userData);
    if (user.role !== 'applicant' && user.role !== 'student') {
      // Invalid role, clear storage and redirect
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userData');
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    // Invalid user data, clear storage and redirect
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedApplicantRoute;
