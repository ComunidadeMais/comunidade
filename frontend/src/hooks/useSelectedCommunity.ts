import { useContext } from 'react';
import { CommunityContext } from '../contexts/CommunityContext';

export interface Community {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityContextType {
  activeCommunity: Community | null;
  setActiveCommunity: (community: Community | null) => void;
  communities: Community[];
  loading: boolean;
  error: string | null;
  loadCommunities: () => Promise<void>;
}

export const useSelectedCommunity = () => {
  const context = useContext(CommunityContext);
  
  if (!context) {
    throw new Error('useSelectedCommunity must be used within a CommunityProvider');
  }
  
  return {
    selectedCommunity: context.activeCommunity,
    setSelectedCommunity: context.setActiveCommunity
  };
}; 