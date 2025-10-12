import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedTrainerRoute = ({ children }) => {
  // Check if trainer is logged in by looking for the trainer token in localStorage
  const trainerToken = localStorage.getItem('trainerToken');
  const trainerUser = localStorage.getItem('trainerUser');
  
  // If no token or user data exists, redirect to trainer login
  if (!trainerToken || !trainerUser) {
    return <Navigate to="/trainer-lms/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedTrainerRoute;
