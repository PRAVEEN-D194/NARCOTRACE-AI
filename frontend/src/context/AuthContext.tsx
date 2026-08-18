import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Investigator } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Investigator | null;
  login: (badgeNumber: string, password?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getSavedUser = (): Investigator | null => {
    const saved = localStorage.getItem('narco_trace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [user, setUser] = useState<Investigator | null>(getSavedUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);

  const login = async (badgeNumber: string, password?: string): Promise<boolean> => {
    try {
      const authResponse = await api.login(badgeNumber, password || 'password123');
      if (authResponse && authResponse.user) {
        localStorage.setItem('narco_trace_user', JSON.stringify(authResponse.user));
        localStorage.setItem('narco_trace_token', authResponse.access_token);
        setUser(authResponse.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (e: any) {
      const errMsg = e.response?.data?.detail || e.message || 'Authentication failed.';
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('narco_trace_user');
    localStorage.removeItem('narco_trace_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
