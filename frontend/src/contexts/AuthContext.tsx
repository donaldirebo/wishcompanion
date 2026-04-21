import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from stored token
  useEffect(() => {
    const token = localStorage.getItem('ws_token');
    if (token) {
      authService.getMe()
        .then(setUser)
        .catch(() => localStorage.removeItem('ws_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login({ email, password });
    localStorage.setItem('ws_token', access_token);
    const me = await authService.getMe();
    setUser(me);
  };

  const register = async (email: string, password: string, name?: string) => {
    await authService.register({ email, password, name });
    // Auto-login after registration
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('ws_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

