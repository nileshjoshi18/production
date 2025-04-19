import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredUserType }) {
  const { currentUser, userType } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate dashboard if user type doesn't match
    return <Navigate to={`/${userType}/dashboard`} replace />;
  }

  return children;
} 