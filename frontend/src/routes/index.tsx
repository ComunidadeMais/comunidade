import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MemberDashboard from '../pages/member/MemberDashboard';
import MemberEvents from '../pages/member/MemberEvents';
import MemberGroups from '../pages/member/MemberGroups';
import MemberDonations from '../pages/member/MemberDonations';
import MemberPrayers from '../pages/member/MemberPrayers';
import MemberProfile from '../pages/member/MemberProfile';
import MemberFeed from '../pages/member/MemberFeed';
import MemberAchievements from '../pages/member/MemberAchievements';
import MemberLayout from '../layouts/MemberLayout';
import api from '../services/api';

// Componente para proteger rotas privadas do membro
const PrivateRoute = () => {
  const { currentCommunity, setCurrentCommunity } = useAuth();
  const { communityId } = useParams();
  const memberToken = localStorage.getItem('memberToken');
  
  useEffect(() => {
    const loadCommunityData = async () => {
      if (communityId && !currentCommunity) {
        try {
          const response = await api.get(`/communities/${communityId}/public`);
          const communityData = response.data.community;
          
          setCurrentCommunity({
            id: communityData.id,
            name: communityData.name,
            logo: communityData.logo,
          });
        } catch (error) {
          console.error('Erro ao carregar dados da comunidade:', error);
        }
      }
    };

    loadCommunityData();
  }, [communityId, currentCommunity, setCurrentCommunity]);
  
  if (!memberToken || !communityId) {
    return <Navigate to={`/communities/${communityId}/member/login`} replace />;
  }
  
  return (
    <MemberLayout>
      <Outlet />
    </MemberLayout>
  );
};

export function AppRoutes() {
  return (
    <Routes>
      {/* Rotas protegidas do Portal do Membro */}
      <Route element={<PrivateRoute />}>
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="events" element={<MemberEvents />} />
        <Route path="groups" element={<MemberGroups />} />
        <Route path="donations" element={<MemberDonations />} />
        <Route path="prayers" element={<MemberPrayers />} />
        <Route path="feed" element={<MemberFeed />} />
        <Route path="achievements" element={<MemberAchievements />} />
        <Route path="profile" element={<MemberProfile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
} 