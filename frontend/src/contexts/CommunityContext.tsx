import React, { createContext, useContext, useState, useEffect } from 'react';
import { Community } from '../types/community';
import { CommunityService } from '../services/community';

interface CommunityContextData {
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;
  communities: Community[];
  loading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
}

const CommunityContext = createContext<CommunityContextData>({} as CommunityContextData);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCommunities = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const data = await CommunityService.listCommunities();
      setCommunities(data);
      
      // Se não houver comunidade ativa e houver comunidades disponíveis,
      // seleciona a primeira como ativa
      if (!activeCommunity && data.length > 0) {
        const savedCommunityId = localStorage.getItem('activeCommunityId');
        const savedCommunity = savedCommunityId 
          ? data.find(c => c.id === savedCommunityId)
          : data[0];
        setActiveCommunity(savedCommunity || data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar comunidades');
      console.error('Erro ao carregar comunidades:', err);
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

  return (
    <CommunityContext.Provider
      value={{
        activeCommunity,
        setActiveCommunity,
        communities,
        loading,
        error,
        loadCommunities
      }}
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