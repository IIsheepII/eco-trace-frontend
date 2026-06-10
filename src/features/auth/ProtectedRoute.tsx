import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../../components/StateView';
import { useAuth } from './AuthProvider';

export function ProtectedRoute({ permissions }: { permissions?: string[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState label="Checking session" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permissions?.length && !permissions.every((permission) => user.permissions.includes(permission))) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
