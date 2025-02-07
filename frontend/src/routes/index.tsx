import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import MemberDashboard from '../pages/member/MemberDashboard';
import MemberLogin from '../pages/member/MemberLogin';
import MemberEvents from '../pages/member/MemberEvents';
import MemberGroups from '../pages/member/MemberGroups';
import MemberDonations from '../pages/member/MemberDonations';
import MemberPrayers from '../pages/member/MemberPrayers';
import MemberProfile from '../pages/member/MemberProfile';
import MemberLayout from '../layouts/MemberLayout';
import api from '../services/api';

export function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota pública para login de membros */}
        <Route path="/communities/:communityId/member/login" element={<MemberLogin />} />

        {/* Rotas protegidas do Portal do Membro */}
        <Route path="/communities/:communityId/member/*" element={<PrivateRoute />}>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="events" element={<MemberEvents />} />
          <Route path="groups" element={<MemberGroups />} />
          <Route path="donations" element={<MemberDonations />} />
          <Route path="prayers" element={<MemberPrayers />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Redireciona para o login se tentar acessar uma rota inválida */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

// Componente para proteger rotas privadas
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