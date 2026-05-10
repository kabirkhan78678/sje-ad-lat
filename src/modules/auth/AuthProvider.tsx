import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authApi, extractTokenFromAuthResponse, type LoginPayload } from '@/services/api/auth';
import { authStorage } from '@/services/auth-storage';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  const logout = useCallback(() => {
    authStorage.clearToken();
    setToken(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authApi.login(payload);
    const nextToken = extractTokenFromAuthResponse(response);

    if (!nextToken) {
      throw new Error('The login response did not include a token.');
    }

    authStorage.setToken(nextToken);
    setToken(nextToken);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      isInitializing,
      login,
      logout,
    }),
    [isInitializing, login, logout, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};
