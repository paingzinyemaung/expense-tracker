import { Navigate, Outlet } from 'react-router';
import FullPageSpinner from '../../components/FullPageSpinner';
import { useAuth } from './useAuth';

export default function GuestRoute() {
  const { status } = useAuth();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to="/" replace />;
  return <Outlet />;
}
