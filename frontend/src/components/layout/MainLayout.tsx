import { FC, ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useTheme,
  Typography,
  Divider,
  Tooltip,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as MembersIcon,
  Groups as GroupsIcon,
  Event as EventsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  People as FamilyIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Event as EventIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import Navbar from './Navbar';
import { useCommunity } from '../../contexts/CommunityContext';

const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 72;

interface MainLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  path: string;
  icon?: ReactNode;
  description: string;
  section?: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  text: string;
  path: string;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    description: 'Visão geral da sua comunidade',
    section: 'Principal'
  },
  {
    text: 'Membros',
    path: '/members',
    icon: <MembersIcon />,
    description: 'Gerenciar membros da comunidade',
    section: 'Gestão',
    subItems: [
      {
        text: 'Lista de Membros',
        path: '/members',
        description: 'Visualizar e gerenciar membros'
      },
      {
        text: 'Famílias',
        path: '/families',
        description: 'Gerenciar famílias da comunidade'
      },
      {
        text: 'Grupos',
        path: '/groups',
        description: 'Organizar grupos e subgrupos'
      }
    ]
  },
  {
    text: 'Eventos',
    path: '/events',
    icon: <EventsIcon />,
    description: 'Agendar e gerenciar eventos',
    section: 'Gestão',
    subItems: [
      {
        text: 'Lista de Eventos',
        path: '/events',
        description: 'Visualizar e gerenciar eventos'
      },
      {
        text: 'Calendário',
        path: '/events/calendar',
        description: 'Visualizar eventos no calendário'
      }
    ]
  },
  {
    text: 'Comunicações',
    path: '/communications',
    icon: <EmailIcon />,
    description: 'Gerenciar comunicações',
    section: 'Gestão',
    subItems: [
      {
        text: 'Lista',
        path: '/communications',
        description: 'Visualizar lista de comunicações'
      },
      {
        text: 'Templates',
        path: '/communications/templates',
        description: 'Visualizar e gerenciar templates de comunicações'
      }
    ]
  },
  {
    text: 'Configurações',
    path: '/settings',
    icon: <SettingsIcon />,
    description: 'Ajustar preferências do sistema',
    section: 'Sistema'
  },
];

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const { loadCommunities } = useCommunity();

  useEffect(() => {
    loadCommunities();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
    loadCommunities();
  };

  const handleDrawerCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleExpandClick = (itemText: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemText]: !prev[itemText]
    }));
  };

  const renderMenuSection = (section: string) => {
    const sectionItems = menuItems.filter(item => item.section === section);
    
    return (
      <Box key={section}>
        {!isCollapsed && (
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{
              px: 3,
              py: 1.5,
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {section}
          </Typography>
        )}
        <List sx={{ px: 2 }}>
          {sectionItems.map((item) => (
            <Box key={item.text}>
              <ListItem key={item.text} disablePadding>
                <Tooltip
                  title={isCollapsed ? `${item.text} - ${item.description}` : ''}
                  placement="right"
                >
                  <ListItemButton
                    selected={!item.subItems && location.pathname === item.path}
                    onClick={() => item.subItems ? handleExpandClick(item.text) : navigate(item.path)}
                    sx={{
                      borderRadius: '12px',
                      minHeight: 48,
                      px: 2.5,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.18),
                        },
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {!isCollapsed && (
                      <Box sx={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontWeight: location.pathname === item.path ? 600 : 400,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.text.secondary,
                              display: 'block',
                              marginTop: '-4px',
                            }}
                          >
                            {item.description}
                          </Typography>
                        </Box>
                        {item.subItems && (
                          expandedItems[item.text] ? <ExpandLessIcon /> : <ExpandMoreIcon />
                        )}
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
              {!isCollapsed && item.subItems && (
                <Collapse in={expandedItems[item.text]} timeout="auto" unmountOnExit>
                  <List sx={{ pl: 4 }}>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          selected={location.pathname === subItem.path}
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            borderRadius: '12px',
                            minHeight: 40,
                            px: 2.5,
                            mb: 1,
                            '&.Mui-selected': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.12),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.18),
                              },
                            },
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.06),
                            },
                          }}
                        >
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: location.pathname === subItem.path ? 600 : 400,
                            }}
                            secondary={subItem.description}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              sx: { color: theme.palette.text.secondary }
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
        <Divider sx={{ mx: 2, my: 1 }} />
      </Box>
    );
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        {!mobileOpen && (
          <Tooltip title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}>
            <ListItemButton
              onClick={handleDrawerCollapse}
              sx={{
                borderRadius: '12px',
                minWidth: 40,
                p: 1,
                justifyContent: 'center',
              }}
            >
              {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </ListItemButton>
          </Tooltip>
        )}
      </Toolbar>
      <Divider />
      {['Principal', 'Gestão', 'Sistema'].map(renderMenuSection)}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Box
        component="nav"
        sx={{
          width: { sm: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
          flexShrink: { sm: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Drawer móvel */}
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
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Drawer permanente */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
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
          p: 3,
          width: {
            sm: `calc(100% - ${isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH}px)`,
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}; 