import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/AuthProvider';
import { FullScreenLoader } from '@/components/shared/FullScreenLoader';

export const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <FullScreenLoader label="Loading admin workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.auth.login} />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return <FullScreenLoader label="Preparing sign in..." />;
  }

  if (isAuthenticated) {
    return <Navigate replace to={ROUTES.dashboard} />;
  }

  return <Outlet />;
};
