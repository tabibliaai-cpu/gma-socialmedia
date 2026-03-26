'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading, setUser, setToken, setLoading, logout: storeLogout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        setToken(token);
        const { data } = await authAPI.getProfile();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        setLoading(false); // No token, stop loading
      }
    } catch (profileError: any) {
      // If the token is invalid, WIPE EVERYTHING
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token: string, userData: any) => {
    // Force sync between LocalStorage and the State Store
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    
    // Tiny delay to ensure state is set before redirecting
    setTimeout(() => {
      router.push('/feed');
    }, 100);
  };

  const logout = () => {
    // FIX: Actually clear the browser storage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    storeLogout();
    router.push('/login');
  };

  const refreshProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
