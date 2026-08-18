import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Investigator } from '../types';
import { CURRENT_INVESTIGATOR } from '../data/mockData';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Investigator | null;
  login: (badgeNumber: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default logged in for easy demo flow
  const [user, setUser] = useState<Investigator | null>(CURRENT_INVESTIGATOR);

  const login = async (badgeNumber: string): Promise<boolean> => {
    // Demo authentication check
    if (badgeNumber.trim().length > 0) {
      setIsAuthenticated(true);
      setUser(CURRENT_INVESTIGATOR);
      return true;
    }
    return false;
  };

  const logout = () => {
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
