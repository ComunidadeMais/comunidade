import { FC, useEffect, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Groups as GroupsIcon,
  Add as AddIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/auth';
import { User } from '../../types/user';
import { Community } from '../../types/community';
import { useCommunity } from '../../contexts/CommunityContext';
import { formatCommunityType, formatCommunityStatus, getCommunityTypeColor } from '../../utils/formatters';

const logoUrl = new URL('../../assets/Comunidade+.PNG', import.meta.url).href;

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [communityMenuAnchor, setCommunityMenuAnchor] = useState<null | HTMLElement>(null);
  const { activeCommunity, communities, setActiveCommunity, loadCommunities } = useCommunity();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AuthService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };
    loadUser();
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleProfileMenuClose();
  };

  const handleCommunityMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    loadCommunities();
    setCommunityMenuAnchor(event.currentTarget);
  };

  const handleCommunityMenuClose = () => {
    setCommunityMenuAnchor(null);
  };

  const handleCommunitySelect = (community: Community) => {
    setActiveCommunity(community);
    handleCommunityMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="abrir menu"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src={logoUrl} 
              alt="Logo Comunidade+" 
              style={{ 
                height: '32px',
                width: 'auto',
                marginRight: '8px'
              }} 
            />
            <Typography variant="h6" noWrap component="div">
              Comunidade+
            </Typography>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          ml: 'auto'
        }}>
          <Box 
            onClick={handleCommunityMenuOpen}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Avatar
              src={activeCommunity?.logo ? `http://localhost:8080/uploads/${activeCommunity.logo}` : undefined}
              sx={{ width: 32, height: 32 }}
            >
              {activeCommunity?.name.charAt(0)}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2">
                {activeCommunity?.name || 'Selecione uma comunidade'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {activeCommunity?.type && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getCommunityTypeColor(activeCommunity.type)
                    }}
                  />
                )}
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {activeCommunity?.type ? formatCommunityType(activeCommunity.type) : ''}
                </Typography>
              </Box>
            </Box>
            <ArrowDropDownIcon />
          </Box>

          <Tooltip title="Notificações">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Mensagens">
            <IconButton color="inherit">
              <Badge badgeContent={2} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <Box 
              onClick={handleProfileMenuOpen}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2">
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {user?.email}
                </Typography>
              </Box>
              <Avatar 
                src={user?.avatar}
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: '2px solid',
                  borderColor: 'primary.contrastText'
                }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
            </Box>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={communityMenuAnchor}
          open={Boolean(communityMenuAnchor)}
          onClose={handleCommunityMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              width: 320,
              maxHeight: 400
            }
          }}
        >
          <MenuItem
            onClick={() => navigate('/admin/communities')}
            sx={{ 
              color: 'primary.main',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ListItemIcon>
              <AddIcon color="primary" />
            </ListItemIcon>
            Gerenciar Comunidades
          </MenuItem>
          {communities.map((community) => (
            <MenuItem
              key={community.id}
              onClick={() => handleCommunitySelect(community)}
              selected={community.id === activeCommunity?.id}
            >
              <ListItemIcon>
                <Avatar
                  src={community.logo ? `http://localhost:8080/uploads/${community.logo}` : undefined}
                  sx={{ width: 32, height: 32 }}
                >
                  {community.name.charAt(0)}
                </Avatar>
              </ListItemIcon>
              <Box>
                <Typography variant="subtitle2">
                  {community.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getCommunityTypeColor(community.type)
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatCommunityType(community.type)}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Perfil
          </MenuItem>
          <MenuItem onClick={() => navigate('/settings')}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 