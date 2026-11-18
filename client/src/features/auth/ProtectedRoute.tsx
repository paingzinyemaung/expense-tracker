import { Navigate, Outlet, useLocation } from 'react-router';
import FullPageSpinner from '../../components/FullPageSpinner';
import { useAuth } from './useAuth';

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
