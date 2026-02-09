import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import * as authService from '@/services/auth';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token'),
  );
  const [isLoading, setIsLoading] = useState(!!localStorage.getItem('token'));

  const isAuthenticated = !!token && !!user;

  const saveAuth = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login(email, password);
      saveAuth(result.user, result.token);
    },
    [saveAuth],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await authService.register(name, email, password);
      saveAuth(result.user, result.token);
    },
    [saveAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // Load user on mount if token exists
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isAuthenticated, isLoading, login, register, logout }),
    [user, token, isAuthenticated, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
