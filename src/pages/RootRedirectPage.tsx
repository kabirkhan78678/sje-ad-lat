import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/AuthProvider';

export const RootRedirectPage = () => {
  const { isAuthenticated } = useAuth();

  return <Navigate replace to={isAuthenticated ? ROUTES.dashboard : ROUTES.auth.login} />;
};
