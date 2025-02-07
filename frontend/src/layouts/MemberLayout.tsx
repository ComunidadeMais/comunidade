import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  ListItemButton,
  useTheme,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Group as GroupIcon,
  AttachMoney as DonationIcon,
  Favorite as PrayerIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Feed as FeedIcon,
  EmojiEvents as AchievementsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { formatImageUrl } from '../config/api';

const drawerWidth = 240;

interface MemberLayoutProps {
  children: React.ReactNode;
}

interface CommunityData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
}

const MemberLayout: React.FC<MemberLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const navigate = useNavigate();
  const { communityId } = useParams();
  const theme = useTheme();
  const { logout } = useAuth();

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const response = await api.get(`/communities/${communityId}/public`);
        console.log('Dados da comunidade carregados:', response.data);
        console.log('Logo original:', response.data.community.logo);
        console.log('Logo formatada:', formatImageUrl(response.data.community.logo));
        setCommunityData(response.data.community);
      } catch (error) {
        console.error('Erro ao carregar dados da comunidade:', error);
      }
    };

    if (communityId) {
      loadCommunityData();
    }
  }, [communityId]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate(`/communities/${communityId}/member/login`);
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/dashboard`),
      color: '#2196F3', // Azul
    },
    {
      text: 'Feed',
      icon: <FeedIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/feed`),
      color: '#00BCD4', // Ciano
    },
    {
      text: 'Eventos',
      icon: <EventIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/events`),
      color: '#4CAF50', // Verde
    },
    {
      text: 'Grupos',
      icon: <GroupIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/groups`),
      color: '#FF9800', // Laranja
    },
    {
      text: 'Doações',
      icon: <DonationIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/donations`),
      color: '#9C27B0', // Roxo
    },
    {
      text: 'Pedidos de Oração',
      icon: <PrayerIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/prayers`),
      color: '#E91E63', // Rosa
    },
    {
      text: 'Conquistas',
      icon: <AchievementsIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/achievements`),
      color: '#FFC107', // Amarelo
    },
    {
      text: 'Perfil',
      icon: <ProfileIcon />,
      onClick: () => navigate(`/communities/${communityId}/member/profile`),
      color: '#607D8B', // Azul acinzentado
    },
  ];

  const drawer = (
    <Box sx={{ mt: 1 }}>
      <List>
        {menuItems.map((item) => (
          <ListItemButton 
            key={item.text} 
            onClick={item.onClick}
            sx={{
              my: 0.5,
              mx: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: `${item.color}15`,
              },
              '&.Mui-selected': {
                backgroundColor: `${item.color}20`,
                '&:hover': {
                  backgroundColor: `${item.color}30`,
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: item.color,
              '& svg': {
                fontSize: 24,
              }
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: 500,
                  fontSize: '0.95rem',
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: '100%',
          backgroundColor: theme.palette.primary.dark,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          
            {communityData && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={formatImageUrl(communityData.logo)}
                  alt={communityData.name}
                  sx={{ width: 40, height: 40 }}
                />
                <Typography variant="h6" noWrap component="div">
                  {communityData.name}
                </Typography>
              </Box>
            )}
          </Box>

          <Tooltip title="Sair">
            <IconButton color="inherit" onClick={handleLogout} size="large">
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: drawerWidth }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              pt: '64px',
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          pl: 0
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default MemberLayout; 