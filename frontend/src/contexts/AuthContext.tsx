import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';

export interface Community {
  id: string;
  name: string;
  logo?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  photo?: string;
}

interface AuthContextData {
  currentCommunity: Community | null;
  setCurrentCommunity: (community: Community | null) => void;
  member: Member | null;
  setMember: (member: Member | null) => void;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('memberToken');
  });

  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('memberToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('memberToken');
    delete api.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setMember(null);
    setCurrentCommunity(null);
  };

  const value = {
    currentCommunity,
    setCurrentCommunity,
    member,
    setMember,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}; 