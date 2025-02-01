import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Community } from '../hooks/useSelectedCommunity';
import { CommunityService } from '../services/community';

export interface CommunityContextData {
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;
  communities: Community[];
  loading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
  selectedCommunity: Community | null;
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

export interface CommunityContextType {
  community: Community | null;
  communityId: string;
  setCommunity: (community: Community | null) => void;
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;
  communities: Community[];
  loading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
  selectedCommunity: Community | null;
  setSelectedCommunity: (community: Community | null) => void;
}

export const CommunityContext = createContext<CommunityContextType | null>(null);

interface CommunityProviderProps {
  children: ReactNode;
}

export function CommunityProvider({ children }: CommunityProviderProps) {
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  // Carrega a comunidade ativa do localStorage
  useEffect(() => {
    const loadActiveCommunity = async () => {
      const activeCommunityId = localStorage.getItem('activeCommunityId');
      if (activeCommunityId) {
        try {
          const response = await CommunityService.getCommunity(activeCommunityId);
          setActiveCommunity(response);
          setSelectedCommunity(response);
        } catch (error) {
          console.error('Erro ao carregar comunidade ativa:', error);
          localStorage.removeItem('activeCommunityId');
        }
      }
    };

    loadActiveCommunity();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const response = await CommunityService.listCommunities();
      setCommunities(response);
      if (response.length > 0 && !activeCommunity) {
        setActiveCommunity(response[0]);
        setSelectedCommunity(response[0]);
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
      setSelectedCommunity(activeCommunity);
    } else {
      localStorage.removeItem('activeCommunityId');
      setSelectedCommunity(null);
    }
  }, [activeCommunity]);

  const value = {
    activeCommunity,
    setActiveCommunity,
    communities,
    setCommunities,
    selectedCommunity,
    setSelectedCommunity,
    community: activeCommunity,
    communityId: activeCommunity?.id || '',
    setCommunity: setActiveCommunity,
    loading,
    error,
    loadCommunities
  };

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity deve ser usado dentro de um CommunityProvider');
  }
  return context;
}; 