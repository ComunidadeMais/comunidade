import { useContext } from 'react';
import { CommunityContext } from '../contexts/CommunityContext';
import { Community } from '../types/community';

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