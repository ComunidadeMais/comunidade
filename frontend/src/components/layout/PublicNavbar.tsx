import { FC, useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Button,
  Container,
  useScrollTrigger,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  KeyboardArrowDown as ArrowDownIcon,
  Menu as MenuIcon,
  ChevronRight as ChevronRightIcon,
  People as PeopleIcon,
  Church as ChurchIcon,
  AccountBalance as TreasurerIcon,
  ChildCare as ChildrenIcon,
  Computer as ITIcon,
  Security as SecurityIcon,
  MonetizationOn as MoneyIcon,
  Event as EventIcon,
  Message as MessageIcon,
  Info as InfoIcon,
  ContactSupport as ContactIcon,
  Article as BlogIcon,
  Star as StarIcon
} from '@mui/icons-material';

const PublicNavbar: FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [platformAnchor, setPlatformAnchor] = useState<null | HTMLElement>(null);
  const [solutionsAnchor, setSolutionsAnchor] = useState<null | HTMLElement>(null);
  const [companyAnchor, setCompanyAnchor] = useState<null | HTMLElement>(null);

  const platformMenuItems = [
    { title: 'Gestão de Membros', icon: <PeopleIcon />, path: '/features/members' },
    { title: 'Eventos e Células', icon: <EventIcon />, path: '/features/events' },
    { 
      title: 'Contribuições', 
      icon: <MoneyIcon />, 
      path: '/features/donations',
      highlight: true 
    },
    { title: 'Comunicação', icon: <MessageIcon />, path: '/features/communication' },
  ];

  const solutionsMenuItems = [
    { title: 'Administração', icon: <ChurchIcon />, path: '/solutions/admin' },
    { title: 'Pastores', icon: <ChurchIcon />, path: '/solutions/pastors' },
    { title: 'Tesouraria', icon: <TreasurerIcon />, path: '/solutions/treasury' },
    { title: 'Ministério Infantil', icon: <ChildrenIcon />, path: '/solutions/children' },
    { title: 'TI', icon: <ITIcon />, path: '/solutions/it' },
  ];

  const companyMenuItems = [
    { title: 'Sobre Nós', icon: <InfoIcon />, path: '/about' },
    { title: 'Contato', icon: <ContactIcon />, path: '/contact' },
    { title: 'Blog', icon: <BlogIcon />, path: '/blog' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setPlatformAnchor(null);
    setSolutionsAnchor(null);
    setCompanyAnchor(null);
    setMobileMenuOpen(false);
  };

  return (
    <AppBar 
      position="fixed" 
      color="transparent"
      sx={{ 
        boxShadow: trigger ? 1 : 0,
        backdropFilter: trigger ? 'blur(20px)' : 'none',
        backgroundColor: trigger ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
        transition: 'all 0.3s',
        borderBottom: trigger ? `1px solid ${theme.palette.divider}` : 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 80 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: { xs: 1, md: 0 }, 
              mr: { md: 6 },
              fontWeight: 800,
              fontSize: '1.75rem',
              color: trigger ? 'primary.main' : 'white',
              cursor: 'pointer',
              letterSpacing: '-0.5px',
              '&:hover': {
                opacity: 0.9
              }
            }}
            onClick={() => navigate('/')}
          >
            Comunidade+
          </Typography>

          {/* Desktop Menu */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
              <Button 
                color={trigger ? "primary" : "inherit"}
                endIcon={<ArrowDownIcon sx={{ transition: 'transform 0.2s' }} />}
                onClick={(e) => setPlatformAnchor(e.currentTarget)}
                sx={{ 
                  mr: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  color: trigger ? 'text.primary' : 'white',
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                    '& .MuiSvgIcon-root': {
                      transform: 'rotate(180deg)'
                    }
                  }
                }}
              >
                Plataforma
              </Button>
              <Menu
                anchorEl={platformAnchor}
                open={Boolean(platformAnchor)}
                onClose={() => setPlatformAnchor(null)}
                MenuListProps={{ 
                  sx: { 
                    py: 2,
                    px: 1,
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
                  } 
                }}
                PaperProps={{
                  elevation: 8,
                  sx: { 
                    mt: 1,
                    minWidth: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundImage: 'none',
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}20`
                  }
                }}
              >
                {platformMenuItems.map((item) => (
                  <MenuItem 
                    key={item.title}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{ 
                      py: 2,
                      px: 2.5,
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        transform: 'translateX(8px)',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                        '& .MuiTypography-root': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 42,
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '& svg': {
                        fontSize: '1.5rem'
                      }
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          sx={{ 
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            transition: 'color 0.2s ease'
                          }}
                        >
                          {item.title}
                        </Typography>
                        {item.highlight && (
                          <StarIcon 
                            sx={{ 
                              fontSize: '1rem',
                              color: '#FFD700',
                              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }} 
                          />
                        )}
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: theme.palette.text.secondary,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.title === 'Gestão de Membros' && 'Cadastro e acompanhamento de membros'}
                        {item.title === 'Eventos e Células' && 'Organize eventos e grupos pequenos'}
                        {item.title === 'Contribuições' && 'Gestão financeira e doações online'}
                        {item.title === 'Comunicação' && 'Mensagens e notificações'}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>

              <Button 
                color={trigger ? "primary" : "inherit"}
                endIcon={<ArrowDownIcon sx={{ transition: 'transform 0.2s' }} />}
                onClick={(e) => setSolutionsAnchor(e.currentTarget)}
                sx={{ 
                  mr: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  color: trigger ? 'text.primary' : 'white',
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                    '& .MuiSvgIcon-root': {
                      transform: 'rotate(180deg)'
                    }
                  }
                }}
              >
                Soluções
              </Button>
              <Menu
                anchorEl={solutionsAnchor}
                open={Boolean(solutionsAnchor)}
                onClose={() => setSolutionsAnchor(null)}
                MenuListProps={{ 
                  sx: { 
                    py: 2,
                    px: 1,
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
                  } 
                }}
                PaperProps={{
                  elevation: 8,
                  sx: { 
                    mt: 1,
                    minWidth: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundImage: 'none',
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}20`
                  }
                }}
              >
                {solutionsMenuItems.map((item) => (
                  <MenuItem 
                    key={item.title}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{ 
                      py: 2,
                      px: 2.5,
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        transform: 'translateX(8px)',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                        '& .MuiTypography-root': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 42,
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '& svg': {
                        fontSize: '1.5rem'
                      }
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <Box>
                      <Typography 
                        sx={{ 
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: theme.palette.text.secondary,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.title === 'Administração' && 'Gestão completa da igreja'}
                        {item.title === 'Pastores' && 'Ferramentas para liderança pastoral'}
                        {item.title === 'Tesouraria' && 'Controle financeiro e relatórios'}
                        {item.title === 'Ministério Infantil' && 'Gestão do ministério infantil'}
                        {item.title === 'TI' && 'Suporte e infraestrutura'}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>

              <Button 
                color={trigger ? "primary" : "inherit"}
                onClick={() => navigate('/pricing')}
                sx={{ 
                  mr: 1,
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  color: trigger ? 'text.primary' : 'white',
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Preços
              </Button>

              <Button 
                color={trigger ? "primary" : "inherit"}
                endIcon={<ArrowDownIcon sx={{ transition: 'transform 0.2s' }} />}
                onClick={(e) => setCompanyAnchor(e.currentTarget)}
                sx={{ 
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                  fontWeight: 500,
                  color: trigger ? 'text.primary' : 'white',
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
                    '& .MuiSvgIcon-root': {
                      transform: 'rotate(180deg)'
                    }
                  }
                }}
              >
                Empresa
              </Button>
              <Menu
                anchorEl={companyAnchor}
                open={Boolean(companyAnchor)}
                onClose={() => setCompanyAnchor(null)}
                MenuListProps={{ 
                  sx: { 
                    py: 2,
                    px: 1,
                    backgroundImage: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`
                  } 
                }}
                PaperProps={{
                  elevation: 8,
                  sx: { 
                    mt: 1,
                    minWidth: 320,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundImage: 'none',
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(20px)',
                    boxShadow: `0 8px 32px 0 ${theme.palette.primary.main}20`
                  }
                }}
              >
                {companyMenuItems.map((item) => (
                  <MenuItem 
                    key={item.title}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{ 
                      py: 2,
                      px: 2.5,
                      borderRadius: 2,
                      mb: 1,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        transform: 'translateX(8px)',
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                          transform: 'scale(1.1)'
                        },
                        '& .MuiTypography-root': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 42,
                      color: theme.palette.text.secondary,
                      transition: 'all 0.2s ease',
                      '& svg': {
                        fontSize: '1.5rem'
                      }
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <Box>
                      <Typography 
                        sx={{ 
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: theme.palette.text.secondary,
                          transition: 'color 0.2s ease'
                        }}
                      >
                        {item.title === 'Sobre Nós' && 'Conheça nossa história'}
                        {item.title === 'Contato' && 'Fale com nossa equipe'}
                        {item.title === 'Blog' && 'Artigos e novidades'}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Login/Register Buttons */}
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            {!isMobile && (
              <>
                <Button 
                  color={trigger ? "primary" : "inherit"}
                  onClick={() => navigate('/login')}
                  sx={{ 
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 500,
                    color: trigger ? 'text.primary' : 'white',
                    '&:hover': {
                      backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    py: 1,
                    px: 3,
                    borderRadius: 2,
                    fontWeight: 600,
                    boxShadow: trigger ? 4 : 'none',
                    '&:hover': {
                      boxShadow: trigger ? 8 : 'none'
                    }
                  }}
                >
                  Registrar
                </Button>
              </>
            )}
            {isMobile && (
              <IconButton
                color={trigger ? "primary" : "inherit"}
                onClick={() => setMobileMenuOpen(true)}
                sx={{ 
                  p: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: trigger ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 360,
            bgcolor: 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 3
          }}>
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                fontWeight: 800,
                fontSize: '1.5rem'
              }}
            >
              Comunidade+
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button 
              variant="contained" 
              color="secondary"
              fullWidth
              size="large"
              onClick={() => handleMenuClick('/register')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600
              }}
            >
              Registrar
            </Button>
            <Button 
              variant="outlined" 
              color="primary"
              fullWidth
              size="large"
              onClick={() => handleMenuClick('/login')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500
              }}
            >
              Login
            </Button>
          </Box>

          <List sx={{ px: 0 }}>
            <ListItem sx={{ px: 0 }}>
              <Typography 
                variant="overline" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600,
                  letterSpacing: 1
                }}
              >
                Plataforma
              </Typography>
            </ListItem>
            {platformMenuItems.map((item) => (
              <ListItem 
                component="div"
                key={item.title}
                sx={{ px: 0 }}
              >
                <Button
                  fullWidth
                  onClick={() => handleMenuClick(item.path)}
                  startIcon={
                    <Box sx={{ 
                      color: 'text.secondary',
                      '& svg': { fontSize: '1.25rem' }
                    }}>
                      {item.icon}
                    </Box>
                  }
                  endIcon={<ChevronRightIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'primary.light'
                    }
                  }}
                >
                  {item.title}
                </Button>
              </ListItem>
            ))}

            <ListItem sx={{ px: 0, mt: 2 }}>
              <Typography 
                variant="overline" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600,
                  letterSpacing: 1
                }}
              >
                Soluções
              </Typography>
            </ListItem>
            {solutionsMenuItems.map((item) => (
              <ListItem 
                component="div"
                key={item.title}
                sx={{ px: 0 }}
              >
                <Button
                  fullWidth
                  onClick={() => handleMenuClick(item.path)}
                  startIcon={
                    <Box sx={{ 
                      color: 'text.secondary',
                      '& svg': { fontSize: '1.25rem' }
                    }}>
                      {item.icon}
                    </Box>
                  }
                  endIcon={<ChevronRightIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'primary.light'
                    }
                  }}
                >
                  {item.title}
                </Button>
              </ListItem>
            ))}

            <ListItem sx={{ px: 0, mt: 2 }}>
              <Button 
                color="primary"
                fullWidth
                onClick={() => handleMenuClick('/pricing')}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  justifyContent: 'flex-start',
                  fontWeight: 500
                }}
              >
                Preços
              </Button>
            </ListItem>

            <ListItem sx={{ px: 0, mt: 2 }}>
              <Typography 
                variant="overline" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 600,
                  letterSpacing: 1
                }}
              >
                Empresa
              </Typography>
            </ListItem>
            {companyMenuItems.map((item) => (
              <ListItem 
                component="div"
                key={item.title}
                sx={{ px: 0 }}
              >
                <Button
                  fullWidth
                  onClick={() => handleMenuClick(item.path)}
                  startIcon={
                    <Box sx={{ 
                      color: 'text.secondary',
                      '& svg': { fontSize: '1.25rem' }
                    }}>
                      {item.icon}
                    </Box>
                  }
                  endIcon={<ChevronRightIcon />}
                  sx={{ 
                    justifyContent: 'flex-start',
                    py: 1.5,
                    px: 2,
                    borderRadius: 2,
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: 'primary.light'
                    }
                  }}
                >
                  {item.title}
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default PublicNavbar; 