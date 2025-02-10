import { FC } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { HelmetProvider } from 'react-helmet-async';
import theme from './theme';
import Navbar from './components/layout/Navbar';
import { MainLayout } from './components/layout/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Groups from './pages/Groups';
import GroupForm from './pages/GroupForm';
import GroupDetails from './pages/GroupDetails';
import GroupMembers from './pages/GroupMembers';
import { Events } from './pages/Events/Events';
import Calendar from './pages/Events/Calendar';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Communities from './pages/admin/Communities';
import { AuthService } from './services/auth';
import { CommunityProvider } from './contexts/CommunityContext';
import MemberForm from './pages/MemberForm';
import FamilyList from './pages/FamilyList';
import FamilyForm from './pages/FamilyForm';
import FamilyMembers from './pages/FamilyMembers';
import { EventForm } from './pages/Events/EventForm';
import CommunicationSettings from './pages/settings/CommunicationSettings';
import Communications from './pages/communications/Communications';
import CommunicationForm from './pages/communications/CommunicationForm';
import Templates from './pages/communications/Templates';
import TemplateForm from './pages/communications/TemplateForm';
import { UsersProvider } from './contexts/UsersContext';
import { EventView } from './pages/Events/EventView';
import { CheckIn } from './pages/events/CheckIn';
import { CheckInDashboard } from './pages/events/CheckInDashboard';
import FinancialCategories from './pages/financial/categories';
import Suppliers from './pages/financial/suppliers';
import Expenses from './pages/financial/expenses';
import Revenues from './pages/financial/revenues';
import Reports from './pages/financial/reports';
import Campaigns from './pages/donations/campaigns';
import Donations from './pages/donations/donations';
import RecurringDonations from './pages/donations/recurring';
import DonationSettings from './pages/donations/settings';
import AsaasSettings from './pages/donations/asaas/settings';
import CreateAsaasAccount from './pages/donations/asaas/create';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberLogin from './pages/member/MemberLogin';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes';
import LeadForm from './pages/LeadForm';
import ThankYou from './pages/ThankYou';
import { Analytics } from '@vercel/analytics/react';

// Componente para proteger rotas
const PrivateRoute: FC<{ element: React.ReactElement }> = ({ element }) => {
  const isAuthenticated = AuthService.isAuthenticated();
  const location = useLocation();
  
  // Verifica se é uma rota do portal do membro
  const isMemberRoute = location.pathname.includes('/member/');
  
  if (!isAuthenticated) {
    // Se for rota de membro, redireciona para o login do membro
    if (isMemberRoute) {
      const pathParts = location.pathname.split('/');
      const communityId = pathParts[2]; // /communities/:communityId/member/...
      return <Navigate to={`/communities/${communityId}/member/login`} />;
    }
    // Se não for rota de membro, redireciona para o login administrativo
    return <Navigate to="/login" />;
  }

  // Se for rota do membro, retorna o elemento direto, sem o MainLayout
  if (isMemberRoute) {
    return element;
  }

  // Para as demais rotas, mantém o MainLayout
  return <MainLayout>{element}</MainLayout>;
};

const queryClient = new QueryClient();

const App: FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AuthProvider>
              <CommunityProvider>
                <Routes>
                  {/* Rotas Públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/demonstracao" element={<LeadForm />} />
                  <Route path="/obrigado" element={<ThankYou />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/events/:eventId/view" element={<EventView />} />
                  <Route path="/events/:eventId/checkin" element={<CheckIn />} />

                  {/* Portal do Membro */}
                  <Route path="/communities/:communityId/member/login" element={<MemberLogin />} />
                  <Route path="/communities/:communityId/member/*" element={<AppRoutes />} />

                  {/* Rotas Administrativas protegidas */}
                  <Route path="/*" element={
                    <UsersProvider>
                      <Routes>
                        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
                        <Route path="/members" element={<PrivateRoute element={<Members />} />} />
                        <Route path="/members/new" element={<PrivateRoute element={<MemberForm />} />} />
                        <Route path="/members/:id" element={<PrivateRoute element={<MemberForm />} />} />
                        <Route path="/families" element={<PrivateRoute element={<FamilyList />} />} />
                        <Route path="/families/new" element={<PrivateRoute element={<FamilyForm />} />} />
                        <Route path="/families/:id/edit" element={<PrivateRoute element={<FamilyForm />} />} />
                        <Route path="/families/:id/members" element={<PrivateRoute element={<FamilyMembers />} />} />
                        <Route path="/groups" element={<PrivateRoute element={<Groups />} />} />
                        <Route path="/groups/new" element={<PrivateRoute element={<GroupForm />} />} />
                        <Route path="/groups/:id" element={<PrivateRoute element={<GroupDetails />} />} />
                        <Route path="/groups/:id/edit" element={<PrivateRoute element={<GroupForm />} />} />
                        <Route path="/communities/:communityId/groups/:groupId/members" element={<PrivateRoute element={<GroupMembers />} />} />
                        <Route path="/events" element={<PrivateRoute element={<Events />} />} />
                        <Route path="/events/calendar" element={<PrivateRoute element={<Calendar />} />} />
                        <Route path="/events/new" element={<PrivateRoute element={<EventForm />} />} />
                        <Route path="/events/:eventId/edit" element={<PrivateRoute element={<EventForm />} />} />
                        <Route path="/events/:eventId/checkin/dashboard" element={<PrivateRoute element={<CheckInDashboard />} />} />
                        <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
                        <Route path="/settings/communication" element={<PrivateRoute element={<CommunicationSettings />} />} />
                        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                        <Route path="/admin/communities" element={<PrivateRoute element={<Communities />} />} />

                        {/* Rotas de Comunicação */}
                        <Route path="/communications" element={<PrivateRoute element={<Communications />} />} />
                        <Route path="/communications/new" element={<PrivateRoute element={<CommunicationForm />} />} />
                        <Route path="/communications/:communicationId/edit" element={<PrivateRoute element={<CommunicationForm />} />} />

                        {/* Rotas de Templates */}
                        <Route path="/communications/templates" element={<PrivateRoute element={<Templates />} />} />
                        <Route path="/communications/templates/new" element={<PrivateRoute element={<TemplateForm />} />} />
                        <Route path="/communications/templates/:templateId/edit" element={<PrivateRoute element={<TemplateForm />} />} />

                        {/* Rotas Financeiras */}
                        <Route path="/financial/categories" element={<PrivateRoute element={<FinancialCategories />} />} />
                        <Route path="/financial/suppliers" element={<PrivateRoute element={<Suppliers />} />} />
                        <Route path="/financial/expenses" element={<PrivateRoute element={<Expenses />} />} />
                        <Route path="/financial/revenues" element={<PrivateRoute element={<Revenues />} />} />
                        <Route path="/financial/reports" element={<PrivateRoute element={<Reports />} />} />

                        {/* Rotas de Doações */}
                        <Route path="/donations/campaigns" element={<PrivateRoute element={<Campaigns />} />} />
                        <Route path="/donations" element={<PrivateRoute element={<Donations />} />} />
                        <Route path="/donations/recurring" element={<PrivateRoute element={<RecurringDonations />} />} />
                        <Route path="/donations/settings" element={<PrivateRoute element={<DonationSettings />} />} />
                        <Route path="/donations/asaas" element={<PrivateRoute element={<AsaasSettings />} />} />
                        <Route path="/donations/asaas/create" element={<PrivateRoute element={<CreateAsaasAccount />} />} />
                      </Routes>
                    </UsersProvider>
                  } />
                </Routes>
              </CommunityProvider>
            </AuthProvider>
          </Router>
          <Analytics />
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
