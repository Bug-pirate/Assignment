import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface GuardAuthShape { isAuthenticated: boolean; isLoading: boolean }

export const ProtectedRoute = () => {
  const auth = useAuth() as GuardAuthShape;
  if (auth.isLoading) return null; // placeholder for loader
  return auth.isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};
