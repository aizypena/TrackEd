import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  // Check if admin is logged in by looking for the admin token in localStorage
  const adminToken = sessionStorage.getItem('adminToken');
  const adminUser = sessionStorage.getItem('adminUser');
  
  // If no token or user data exists, redirect to admin login
  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default ProtectedAdminRoute;