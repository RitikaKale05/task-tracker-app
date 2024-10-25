// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user.user);

  if (!user || !user.uid) {
    return <Navigate to="/" replace />; // Redirect to home (sign-in) if not authenticated
  }

  return children;
};

export default ProtectedRoute;
