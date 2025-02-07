import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../services/api';
import { Member } from '../types/member';

export interface Community {
  id: string;
  name: string;
  logo?: string;
}

interface AuthContextData {
  currentCommunity: Community | null;
  setCurrentCommunity: (community: Community | null) => void;
  member: Member | null;
  setMember: (member: Member | null) => void;
  currentUser: Member | null;
  isAuthenticated: boolean;
  login: (token: string, communityId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentCommunity, setCurrentCommunity] = useState<Community | null>(() => {
    const savedCommunity = localStorage.getItem('currentCommunity');
    return savedCommunity ? JSON.parse(savedCommunity) : null;
  });
  const [member, setMember] = useState<Member | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('memberToken');
  });

  // Persist currentCommunity when it changes
  useEffect(() => {
    if (currentCommunity) {
      localStorage.setItem('currentCommunity', JSON.stringify(currentCommunity));
    } else {
      localStorage.removeItem('currentCommunity');
    }
  }, [currentCommunity]);

  const loadMemberData = async (communityId: string) => {
    try {
      const response = await api.get(`/communities/${communityId}/members/me`);
      const memberData = response.data.member;
      
      // Garantir que o member tenha todos os campos necessários
      if (memberData && !memberData.id) {
        console.error('Member data is missing required fields:', memberData);
        throw new Error('Invalid member data');
      }
      
      setMember(memberData);

      // Load community data if not present
      if (!currentCommunity) {
        const communityResponse = await api.get(`/communities/${communityId}/public`);
        if (communityResponse.data.community) {
          setCurrentCommunity({
            id: communityResponse.data.community.id,
            name: communityResponse.data.community.name,
            logo: communityResponse.data.community.logo
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
      // Se houver erro, limpa os dados
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    const communityId = localStorage.getItem('communityId');
    if (token && communityId) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      loadMemberData(communityId);
    }
  }, []);

  const login = async (token: string, communityId: string) => {
    try {
      localStorage.setItem('memberToken', token);
      localStorage.setItem('communityId', communityId);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      
      // Load member data after setting the token
      const response = await api.get(`/communities/${communityId}/members/me`);
      const memberData = response.data.member;
      
      if (memberData && memberData.id) {
        setMember(memberData);
      } else {
        console.error('Member data not found or invalid:', memberData);
        throw new Error('Failed to load member data');
      }

      // Load community data if not present
      if (!currentCommunity) {
        const communityResponse = await api.get(`/communities/${communityId}/public`);
        if (communityResponse.data.community) {
          setCurrentCommunity({
            id: communityResponse.data.community.id,
            name: communityResponse.data.community.name,
            logo: communityResponse.data.community.logo
          });
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Clean up if member data loading fails
      localStorage.removeItem('memberToken');
      localStorage.removeItem('communityId');
      localStorage.removeItem('currentCommunity');
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setMember(null);
      setCurrentCommunity(null);
      throw error; // Re-throw to handle in the component
    }
  };

  const logout = () => {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('communityId');
    localStorage.removeItem('currentCommunity');
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
    currentUser: member,
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