import React, { ReactNode } from 'react';
import { Navigate, outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: ('tenant' | 'landlord' | 'admin')[];
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-lightBg">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    // Optional: Redirect to a permission denied page or their respective dashboard
    return <Navigate to="/" replace />; // Or /unauthorized
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;