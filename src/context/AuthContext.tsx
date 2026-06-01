import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../features/auth/api';
import { logger } from '../lib/logger';
import { clearSentryUser, setSentryUser } from '../lib/sentry';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setSentryUser(userData);
          logger.info('auth', 'Session restored');
        } catch {
          localStorage.removeItem('token');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    setSentryUser(response.user);
    logger.info('auth', 'User logged in');
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ email, password, name });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    setSentryUser(response.user);
    logger.info('auth', 'User registered');
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    clearSentryUser();
    logger.info('auth', 'User logged out');
  }, []);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
