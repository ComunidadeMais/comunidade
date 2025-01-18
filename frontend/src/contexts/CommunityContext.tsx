import React, { createContext, useContext, useState, useEffect } from 'react';
import { Community } from '../types/community';
import { CommunityService } from '../services/community';

export interface CommunityContextData {
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;
  communities: Community[];
  loading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
  selectedCommunity: {
    id: string;
    name: string;
  } | null;
}

const communityContextDefaultValues: CommunityContextData = {
  activeCommunity: null,
  setActiveCommunity: () => {},
  communities: [],
  loading: false,
  error: null,
  loadCommunities: async () => {},
  selectedCommunity: null
};

export const CommunityContext = createContext<CommunityContextData>(communityContextDefaultValues);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const response = await CommunityService.listCommunities();
      setCommunities(response);
      if (response.length > 0 && !activeCommunity) {
        setActiveCommunity(response[0]);
      }
    } catch (error) {
      setError('Erro ao carregar comunidades');
      console.error('Erro ao carregar comunidades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salva a comunidade ativa no localStorage
  useEffect(() => {
    if (activeCommunity) {
      localStorage.setItem('activeCommunityId', activeCommunity.id);
    } else {
      localStorage.removeItem('activeCommunityId');
    }
  }, [activeCommunity]);

  const value = {
    activeCommunity,
    setActiveCommunity,
    communities,
    loading,
    error,
    loadCommunities,
    selectedCommunity: activeCommunity
  };

  return (
    <CommunityContext.Provider
      value={value}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity deve ser usado dentro de um CommunityProvider');
  }
  return context;
}; 