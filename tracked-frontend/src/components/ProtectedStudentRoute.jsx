import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedStudentRoute = ({ children }) => {
  // Check if student is logged in by looking for the student token in localStorage
  const studentToken = localStorage.getItem('studentToken');
  const studentUser = localStorage.getItem('studentUser');
  
  // If no token or user data exists, redirect to student login
  if (!studentToken || !studentUser) {
    return <Navigate to="/smi-lms/login" replace />;
  }
  
  // Verify user role is student
  try {
    const user = JSON.parse(studentUser);
    if (user.role !== 'student') {
      // Invalid role, clear storage and redirect
      localStorage.removeItem('studentToken');
      localStorage.removeItem('studentUser');
      return <Navigate to="/smi-lms/login" replace />;
    }
  } catch (error) {
    // Invalid user data, clear storage and redirect
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentUser');
    return <Navigate to="/smi-lms/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedStudentRoute;
