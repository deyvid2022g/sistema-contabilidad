import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ViewerRouteGuardProps {
  allowedPaths: string[];
}

/**
 * A component that restricts viewer users to only access certain paths
 * If the current path is not in the allowedPaths array, it redirects to the dashboard
 */
const ViewerRouteGuard: React.FC<ViewerRouteGuardProps> = ({ allowedPaths }) => {
  const { user } = useAuth();
  const isViewer = user?.role === 'viewer';
  const currentPath = window.location.pathname;
  
  // If user is not a viewer, allow access to all routes
  if (!isViewer) {
    return <Outlet />;
  }
  
  // Check if the current path is allowed for viewers
  const isAllowedPath = allowedPaths.some(path => {
    // Exact match
    if (currentPath === path) return true;
    // Path starts with allowed path (for nested routes)
    if (path.endsWith('/*') && currentPath.startsWith(path.slice(0, -2))) return true;
    return false;
  });
  
  // If the path is allowed, render the route, otherwise redirect to dashboard
  return isAllowedPath ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default ViewerRouteGuard;