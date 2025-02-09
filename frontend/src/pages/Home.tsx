import React from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Box,
  Paper,
  Stack,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import {
  People as PeopleIcon,
  Event as EventIcon,
  MonetizationOn as MoneyIcon,
  Security as SecurityIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  AdminPanelSettings as AdminIcon,
  Church as ChurchIcon,
  AccountBalance as TreasurerIcon,
  ChildCare as ChildrenIcon,
  Computer as ITIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const teamSections = [
    {
      title: "Administração",
      icon: <AdminIcon fontSize="large" />,
      description: "Coordene perfeitamente entre pastores e membros. Permita que os membros se conectem e se sirvam com um diretório online da igreja.",
      features: [
        "Gestão de membros e visitantes",
        "Diretório online da comunidade",
        "Agendamento de eventos e reuniões",
        "Relatórios e análises"
      ]
    },
    {
      title: "Pastores",
      icon: <ChurchIcon fontSize="large" />,
      description: "Não deixe ninguém passar despercebido. Receba atualizações sobre eventos pessoais, compromissos e formas de servir dos membros.",
      features: [
        "Acompanhamento pastoral",
        "Gestão de células e grupos",
        "Registro de aconselhamento",
        "Agenda pastoral integrada"
      ]
    },
    {
      title: "Tesouraria",
      icon: <TreasurerIcon fontSize="large" />,
      description: "Garanta a saúde financeira com um software rápido e preciso para rastreamento de contribuições.",
      features: [
        "Controle de dízimos e ofertas",
        "Relatórios financeiros",
        "Prestação de contas",
        "Gestão de despesas"
      ]
    },
    {
      title: "Ministério Infantil",
      icon: <ChildrenIcon fontSize="large" />,
      description: "Mantenha-se organizado com ferramentas que simplificam a coordenação de voluntários e a comunicação com os pais.",
      features: [
        "Check-in seguro",
        "Controle de presença",
        "Comunicação com pais",
        "Gestão de voluntários"
      ]
    },
    {
      title: "TI",
      icon: <ITIcon fontSize="large" />,
      description: "Garanta a gestão segura de dados, simplifique as integrações do sistema e mantenha serviços online sem interrupções.",
      features: [
        "Backup automático",
        "Controle de acesso",
        "Integrações",
        "Suporte técnico"
      ]
    }
  ];

  return (
    <>
      <PublicNavbar />
      
      {/* Hero Section - Mais moderna e impactante */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          pt: { xs: 12, md: 20 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/pattern.png) repeat',
            opacity: 0.1,
          }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography 
                    variant="h1" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                      mb: 3
                    }}
                  >
                    Transforme sua comunidade com tecnologia
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      opacity: 0.9,
                      mb: 4,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 300
                    }}
                  >
                    Uma plataforma completa para gestão de igrejas e comunidades religiosas
                  </Typography>
                  <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={2}
                    sx={{ mb: 4 }}
                  >
                    <Button 
                      variant="contained" 
                      color="secondary"
                      size="large"
                      onClick={() => navigate('/demonstracao')}
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      Comece Gratuitamente
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit"
                      size="large"
                      onClick={() => navigate('/demonstracao')}
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        borderRadius: 2
                      }}
                    >
                      Agende uma Demo
                    </Button>
                  </Stack>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Mais de 1.000 comunidades já confiam em nós
                  </Typography>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Box sx={{ 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    right: 20,
                    bottom: 20,
                    background: theme.palette.secondary.main,
                    borderRadius: 4,
                    opacity: 0.1,
                    zIndex: 0
                  }
                }}>
                  <Box
                    component="img"
                    src="/dashboard-preview.png"
                    alt="Dashboard Preview"
                    sx={{
                      width: '100%',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      position: 'relative',
                      zIndex: 1,
                      transform: 'perspective(1000px) rotateY(-5deg)',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'perspective(1000px) rotateY(0deg)'
                      }
                    }}
                  />
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Mais visual e interativo */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 8, md: 12 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 50%, ${theme.palette.background.paper} 100%)`,
            zIndex: -1
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: 2,
                mb: 2,
                display: 'block'
              }}
            >
              RECURSOS INTEGRADOS
            </Typography>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Tudo que você precisa em um só lugar
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                mb: 3,
                fontWeight: 300
              }}
            >
              Uma solução completa para gestão da sua comunidade
            </Typography>
            <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 8 }} />
          </Box>

          <Grid container spacing={4}>
            {[
              {
                icon: <PeopleIcon />,
                title: "Gestão de Membros",
                description: "Cadastre e gerencie membros, visitantes e voluntários. Acompanhe a jornada espiritual de cada pessoa.",
                color: theme.palette.primary.main
              },
              {
                icon: <EventIcon />,
                title: "Eventos e Células",
                description: "Organize cultos, células e eventos especiais. Controle presença e engajamento dos participantes.",
                color: theme.palette.secondary.main
              },
              {
                icon: <MoneyIcon />,
                title: "Gestão Financeira",
                description: "Gerencie dízimos, ofertas e doações com transparência. Relatórios detalhados e prestação de contas.",
                color: theme.palette.success.main
              },
              {
                icon: <SecurityIcon />,
                title: "Segurança Total",
                description: "Proteção de dados, controle de acesso e backup automático. Sua informação sempre segura.",
                color: theme.palette.error.main
              },
              {
                icon: <MessageIcon />,
                title: "Comunicação",
                description: "Envie mensagens, e-mails e notificações. Mantenha todos informados e conectados.",
                color: theme.palette.info.main
              },
              {
                icon: <CheckCircleIcon />,
                title: "Check-in Digital",
                description: "Sistema de check-in para crianças e eventos. Segurança e controle de presença.",
                color: theme.palette.warning.main
              }
            ].map((feature, index) => (
              <Zoom in timeout={500 + index * 200} key={index}>
                <Grid item xs={12} md={4}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${feature.color}20`,
                        '& .feature-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                          color: feature.color
                        },
                        '& .feature-button': {
                          color: feature.color,
                          '& .MuiButton-endIcon': {
                            transform: 'translateX(4px)'
                          }
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${feature.color}50, ${feature.color})`
                      }
                    }}
                    onClick={() => navigate('/features')}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box 
                        className="feature-icon"
                        sx={{ 
                          mb: 3,
                          transition: 'all 0.3s ease',
                          transform: 'scale(1) rotate(0deg)',
                          display: 'inline-flex',
                          p: 2,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${feature.color}10, ${feature.color}20)`,
                          '& > svg': {
                            fontSize: '3rem',
                            color: feature.color,
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                          }
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 700,
                          color: feature.color
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ mb: 3 }}
                      >
                        {feature.description}
                      </Typography>
                      <Button 
                        className="feature-button"
                        endIcon={
                          <ArrowForwardIcon sx={{ 
                            transition: 'transform 0.3s ease'
                          }} />
                        }
                        sx={{ 
                          fontWeight: 600,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Saiba mais
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              </Zoom>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Donations Section - Nova seção de doações */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 10, md: 16 },
          background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/pattern.png) repeat',
            opacity: 0.1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: -100,
            width: 300,
            height: 300,
            background: `radial-gradient(circle, ${theme.palette.primary.main}40 0%, transparent 70%)`,
            transform: 'translateY(-50%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography 
                  variant="overline"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    letterSpacing: 2,
                    mb: 2,
                    display: 'block',
                    opacity: 0.9
                  }}
                >
                  CONTRIBUIÇÕES ONLINE
                </Typography>
                <Typography 
                  variant="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '2.75rem' },
                    mb: 3,
                    background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.8))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Simplifique as contribuições da sua comunidade
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 4,
                    opacity: 0.9,
                    fontWeight: 300,
                    lineHeight: 1.6
                  }}
                >
                  Ofereça múltiplas formas de contribuição com total segurança e transparência
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {[
                    {
                      title: "Múltiplas Formas de Pagamento",
                      description: "PIX, cartão de crédito, boleto e transferência"
                    },
                    {
                      title: "Contribuições Recorrentes",
                      description: "Configure doações automáticas mensais"
                    },
                    {
                      title: "Gestão Transparente",
                      description: "Relatórios detalhados e prestação de contas"
                    },
                    {
                      title: "Segurança Total",
                      description: "Transações seguras e criptografadas"
                    }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          gap: 2, 
                          alignItems: 'flex-start',
                          p: 2,
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)'
                          }
                        }}
                      >
                        <CheckCircleIcon 
                          sx={{ 
                            mt: 0.5, 
                            fontSize: '1.5rem',
                            color: theme.palette.primary.light
                          }} 
                        />
                        <Box>
                          <Typography variant="h6" gutterBottom fontWeight={600}>
                            {item.title}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2}
                >
                  <Button 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark
                      }
                    }}
                    onClick={() => navigate('/donations')}
                  >
                    Comece a Receber Doações
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    size="large"
                    sx={{ 
                      py: 2,
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                    onClick={() => navigate('/pricing')}
                  >
                    Ver Planos
                  </Button>
                </Stack>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Zoom in timeout={1000}>
                <Box
                  sx={{ 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    perspective: '1000px'
                  }}
                >
                  {/* Card de Exemplo de Doação */}
                  <Card
                    sx={{ 
                      p: 3,
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'rotate(-5deg) translateZ(20px)',
                      maxWidth: '80%',
                      ml: 'auto',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(-3deg) translateZ(30px)'
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        Dízimo Mensal
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" color="text.primary" fontWeight={800}>
                          R$ 100,00
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          /mês
                        </Typography>
                      </Box>
                      <Button variant="contained" color="primary" fullWidth>
                        Contribuir
                      </Button>
                    </Stack>
                  </Card>

                  {/* Card de Exemplo de Oferta */}
                  <Card
                    sx={{ 
                      p: 3,
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'rotate(0deg) translateZ(20px)',
                      maxWidth: '80%',
                      ml: 'auto',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(2deg) translateZ(30px)'
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="h6" color="secondary" fontWeight={600}>
                        Oferta Única
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" color="text.primary" fontWeight={800}>
                          R$ 50,00
                        </Typography>
                      </Box>
                      <Button variant="contained" color="secondary" fullWidth>
                        Ofertar
                      </Button>
                    </Stack>
                  </Card>

                  {/* Lista de Últimas Contribuições */}
                  <Card
                    sx={{ 
                      p: 3,
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      transform: 'rotate(5deg) translateZ(20px)',
                      maxWidth: '80%',
                      mr: 'auto',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(3deg) translateZ(30px)'
                      }
                    }}
                  >
                    <Stack spacing={2}>
                      <Typography variant="h6" color="secondary" fontWeight={600}>
                        Últimas Contribuições
                      </Typography>
                      <List sx={{ width: '100%' }}>
                        <ListItem 
                          sx={{ 
                            borderBottom: '1px solid rgba(0,0,0,0.1)',
                            py: 1.5
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="text.primary">
                                  Dízimo Mensal
                                </Typography>
                                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                  R$ 100,00
                                </Typography>
                              </Box>
                            }
                            secondary="Há 2 minutos"
                          />
                        </ListItem>
                        <ListItem 
                          sx={{ 
                            borderBottom: '1px solid rgba(0,0,0,0.1)',
                            py: 1.5
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="text.primary">
                                  Oferta Especial
                                </Typography>
                                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                  R$ 50,00
                                </Typography>
                              </Box>
                            }
                            secondary="Há 5 minutos"
                          />
                        </ListItem>
                        <ListItem 
                          sx={{ 
                            py: 1.5
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="subtitle2" color="text.primary">
                                  Contribuição Missionária
                                </Typography>
                                <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                  R$ 200,00
                                </Typography>
                              </Box>
                            }
                            secondary="Há 10 minutos"
                          />
                        </ListItem>
                      </List>
                    </Stack>
                  </Card>

                  {/* Ícone de Segurança */}
                  <Box
                    sx={{ 
                      position: 'absolute',
                      bottom: -30,
                      right: -30,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: '50%',
                      p: 2,
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: '3rem', color: 'white' }} />
                  </Box>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Sections - Mais organizado e visual */}
      <Box 
        sx={{ 
          bgcolor: 'grey.50',
          py: { xs: 8, md: 12 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 25%, ${theme.palette.grey[50]} 75%, ${theme.palette.background.paper} 100%)`
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8, position: 'relative' }}>
            <Typography 
              variant="overline"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 600,
                letterSpacing: 2,
                mb: 2,
                display: 'block'
              }}
            >
              SOLUÇÕES PERSONALIZADAS
            </Typography>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.75rem' },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Soluções para cada área
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                fontWeight: 300,
                mb: 3
              }}
            >
              Ferramentas específicas para cada ministério da sua comunidade
            </Typography>
            <Divider sx={{ maxWidth: 100, mx: 'auto', mb: 8 }} />
          </Box>

          <Grid container spacing={4}>
            {teamSections.map((section, index) => (
              <Fade in timeout={500 + index * 200} key={index}>
                <Grid item xs={12}>
                  <Card 
                    sx={{ 
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        boxShadow: theme.shadows[10],
                        '& .section-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '4px',
                        height: '100%',
                        background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: '4px 0 0 4px'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={3}>
                          <Box 
                            className="section-icon"
                            sx={{ 
                              textAlign: 'center',
                              p: 3,
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.light}40)`,
                              backdropFilter: 'blur(8px)',
                              transition: 'all 0.3s ease',
                              transform: 'scale(1) rotate(0deg)',
                              '& svg': {
                                fontSize: '4rem',
                                color: theme.palette.primary.main,
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                              }
                            }}
                          >
                            {React.cloneElement(section.icon, { 
                              sx: { fontSize: '4rem' }
                            })}
                            <Typography 
                              variant="h5" 
                              sx={{ 
                                mt: 2, 
                                fontWeight: 700,
                                color: theme.palette.primary.main
                              }}
                            >
                              {section.title}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={5}>
                          <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ 
                              fontSize: '1.1rem',
                              lineHeight: 1.6,
                              mb: { xs: 2, md: 0 }
                            }}
                          >
                            {section.description}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <List>
                            {section.features.map((feature, idx) => (
                              <ListItem 
                                key={idx} 
                                sx={{ 
                                  py: 1,
                                  px: 2,
                                  transition: 'all 0.2s ease',
                                  borderRadius: 2,
                                  '&:hover': {
                                    bgcolor: 'primary.light',
                                    transform: 'translateX(8px)'
                                  }
                                }}
                              >
                                <ListItemIcon>
                                  <CheckIcon 
                                    sx={{ 
                                      color: theme.palette.primary.main,
                                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                    }} 
                                  />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={feature}
                                  primaryTypographyProps={{
                                    sx: { 
                                      fontWeight: 500,
                                      fontSize: '1rem'
                                    }
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Fade>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section - Mais atraente */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(/pattern.png) repeat',
            opacity: 0.1,
          }
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Comece sua jornada hoje
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 6,
                opacity: 0.9,
                fontWeight: 300
              }}
            >
              Junte-se a milhares de comunidades que já estão usando o Comunidade+
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3}
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                onClick={() => navigate('/demonstracao')}
                sx={{ 
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  borderRadius: 2
                }}
              >
                Comece Gratuitamente
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                size="large"
                onClick={() => navigate('/demonstracao')}
                sx={{ 
                  py: 2,
                  px: 6,
                  fontSize: '1.2rem',
                  borderRadius: 2
                }}
              >
                Fale com um Especialista
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer - Mais organizado */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ fontWeight: 700 }}
              >
                Comunidade+
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  opacity: 0.7,
                  maxWidth: '300px',
                  mb: 3
                }}
              >
                Uma plataforma completa para gestão de comunidades religiosas.
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  Rua Exemplo, 123 - São Paulo, SP
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  contato@comunidademais.com.br
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                  +55 (11) 1234-5678
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Produto
              </Typography>
              <List dense>
                {['Recursos', 'Preços', 'Segurança'].map((item) => (
                  <ListItem key={item} sx={{ px: 0 }}>
                    <Button 
                      color="inherit" 
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={() => navigate(`/${item.toLowerCase()}`)}
                    >
                      {item}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Empresa
              </Typography>
              <List dense>
                {['Sobre', 'Contato', 'Blog'].map((item) => (
                  <ListItem key={item} sx={{ px: 0 }}>
                    <Button 
                      color="inherit"
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                      onClick={() => navigate(`/${item.toLowerCase()}`)}
                    >
                      {item}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Newsletter
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  opacity: 0.7,
                  mb: 3,
                  maxWidth: '300px'
                }}
              >
                Receba novidades, atualizações e dicas para sua comunidade
              </Typography>
              <Button 
                variant="outlined" 
                color="inherit"
                size="large"
                onClick={() => navigate('/newsletter')}
                sx={{
                  borderRadius: 2,
                  px: 4
                }}
              >
                Inscreva-se
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 6, bgcolor: 'grey.800' }} />
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Comunidade+. Todos os direitos reservados.
            </Typography>
            <Stack 
              direction="row" 
              spacing={3}
              sx={{ opacity: 0.7 }}
            >
              <Button color="inherit" size="small">
                Privacidade
              </Button>
              <Button color="inherit" size="small">
                Termos
              </Button>
              <Button color="inherit" size="small">
                Cookies
              </Button>
            </Stack>
        </Box>
      </Container>
      </Box>
    </>
  );
};

export default Home; 