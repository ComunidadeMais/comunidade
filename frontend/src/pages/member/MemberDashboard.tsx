import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import memberDashboardService, { MemberDashboardData } from '../../services/member/dashboard';
import { formatImageUrl } from '../../config/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  IconButton,
  Tab,
  Tabs,
  Paper,
  Tooltip,
  CircularProgress,
  useTheme,
  Container,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Event as EventIcon,
  Group as GroupIcon,
  EmojiEvents as AchievementIcon,
  AttachMoney as DonationIcon,
  VolunteerActivism as MinistryIcon,
  Assignment as TaskIcon,
  School as TrainingIcon,
  Favorite as PrayerIcon,
  CalendarMonth,
  ArrowForward,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import MemberLayout from '../../layouts/MemberLayout';

const MotionGrid = motion(Grid);
const MotionCard = motion.create(Card);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MemberDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [memberData, setMemberData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentCommunity, member } = useAuth();

  useEffect(() => {
    if (currentCommunity?.id && member?.id) {
      loadMemberData();
    }
  }, [currentCommunity, member]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentCommunity?.id || !member?.id) {
        throw new Error('ID da comunidade ou membro não encontrado');
      }

      const data = await memberDashboardService.getMemberDashboard(currentCommunity.id, member.id);
      setMemberData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
      setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'answered':
        return theme.palette.success.main;
      case 'praying':
      case 'available':
        return theme.palette.info.main;
      case 'pending':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'answered':
        return <CheckCircleIcon sx={{ color: getStatusColor(status) }} />;
      default:
        return <AccessTimeIcon sx={{ color: getStatusColor(status) }} />;
    }
  };

  if (loading || !memberData) {
    return (
      <MemberLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={loadMemberData}>
            Tentar Novamente
          </Button>
        </Container>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Container 
        maxWidth={false} 
        sx={{ 
          maxWidth: theme.breakpoints.values.lg,
          m: 0,
          p: 0
        }}
      >
        {/* Profile Section */}
        <MotionGrid
          container
          spacing={3}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                },
              }}
            >
              <Box position="relative" display="flex" alignItems="center" gap={3}>
                <Avatar
                  src={formatImageUrl(member?.photo)}
                  alt={member?.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    bgcolor: theme.palette.primary.dark,
                  }}
                >
                  {!member?.photo && member?.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                    {member?.name || 'Membro'}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                    {memberData?.profile?.role || 'Carregando...'}
                  </Typography>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    {memberData?.profile?.joinDate && (
                      <Chip
                        label={`Membro desde ${format(new Date(memberData.profile.joinDate), 'PP', { locale: ptBR })}`}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                      />
                    )}
                    {memberData?.profile?.engagementScore && (
                      <Chip
                        icon={<AchievementIcon />}
                        label={`Engajamento: ${memberData.profile.engagementScore}%`}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                      />
                    )}
                    {member?.type && (
                      <Chip
                        label={member.type === 'regular' ? 'Membro Regular' : 
                               member.type === 'visitor' ? 'Visitante' : 'Transferido'}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.15)',
                          color: 'white',
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </MotionGrid>

        {/* Quick Actions */}
        <Box mt={4}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Ações Rápidas
          </Typography>
          <Grid container spacing={2}>
            {[
              { icon: <EventIcon sx={{ fontSize: 32 }}/>, title: "Participar de Evento", color: '#4CAF50' },
              { icon: <PrayerIcon sx={{ fontSize: 32 }}/>, title: "Pedido de Oração", color: '#E91E63' },
              { icon: <DonationIcon sx={{ fontSize: 32 }}/>, title: "Nova Doação", color: '#9C27B0' },
              { icon: <MinistryIcon sx={{ fontSize: 32 }}/>, title: "Voluntariar-se", color: '#2196F3' },
            ].map((action, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <MotionCard
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 8px 24px rgba(${action.color}, 0.25)`,
                      '&::before': {
                        opacity: 1,
                      },
                      '& .action-icon': {
                        transform: 'scale(1.1) rotate(5deg)',
                        color: action.color,
                        background: `${action.color}25`,
                      },
                      '& .action-title': {
                        color: action.color,
                        transform: 'translateY(-2px)',
                      }
                    },
                  }}
                >
                  <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 3,
                  }}>
                    <Box
                      className="action-icon"
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: action.color,
                        bgcolor: `${action.color}15`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      className="action-title"
                      sx={{ 
                        fontWeight: 'medium',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {action.title}
                    </Typography>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Content Tabs */}
        <Box mt={4}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="member dashboard tabs"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 'medium',
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            <Tab label="Atividades" />
            <Tab label="Ministério" />
            <Tab label="Conquistas" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {/* Próximos Eventos */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Próximos Eventos
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.events?.length > 0 ? (
                          memberData.events.map((event: any) => (
                            <ListItem
                              key={event.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                  <EventIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={event.name}
                                secondary={format(new Date(event.date), "PPp", { locale: ptBR })}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                sx={{ minWidth: 120 }}
                              >
                                Participar
                              </Button>
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhum evento encontrado" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Pedidos de Oração */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Pedidos de Oração
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.prayers?.length > 0 ? (
                          memberData.prayers.map((prayer: any) => (
                            <ListItem
                              key={prayer.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: getStatusColor(prayer.status) }}>
                                  <PrayerIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={prayer.title}
                                secondary={format(new Date(prayer.date), "PP", { locale: ptBR })}
                              />
                              {getStatusIcon(prayer.status)}
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhuma oração encontrada" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Doações Recentes */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Doações Recentes
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.donations?.length > 0 ? (
                          memberData.donations.map((donation: any) => (
                            <ListItem
                              key={donation.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                                  <DonationIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`R$ ${donation.amount.toFixed(2)}`}
                                secondary={format(new Date(donation.date), "PP", { locale: ptBR })}
                              />
                              {getStatusIcon(donation.status)}
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhuma doação encontrada" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Grupos */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Meus Grupos
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.groups?.length > 0 ? (
                          memberData.groups.map((group: any) => (
                            <ListItem
                              key={group.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                  <GroupIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={group.name}
                                secondary={group.role}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 100 }}
                              >
                                Ver Grupo
                              </Button>
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhum grupo encontrado" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {/* Tarefas do Ministério */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Tarefas do Ministério
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.ministry?.tasks?.length > 0 ? (
                          memberData.ministry.tasks.map((task: any) => (
                            <ListItem
                              key={task.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                                  <TaskIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={task.name}
                                secondary={format(new Date(task.date), "PPp", { locale: ptBR })}
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhuma tarefa encontrada" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Treinamentos */}
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                          Treinamentos
                        </Typography>
                        <IconButton color="primary">
                          <ArrowForward />
                        </IconButton>
                      </Box>
                      <List>
                        {memberData.ministry?.trainings?.length > 0 ? (
                          memberData.ministry.trainings.map((training: any) => (
                            <ListItem
                              key={training.id}
                              sx={{
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                mb: 1,
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                                  <TrainingIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={training.name}
                                secondary={training.status === 'completed' ? 'Concluído' : 'Disponível'}
                              />
                              {training.status === 'available' && (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<AddIcon />}
                                  sx={{ minWidth: 120 }}
                                >
                                  Inscrever-se
                                </Button>
                              )}
                              {training.status === 'completed' && getStatusIcon(training.status)}
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="Nenhum treinamento encontrado" />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {memberData.achievements?.length > 0 ? (
                  memberData.achievements.map((achievement: any, index: number) => (
                    <Grid item xs={12} md={6} key={achievement.id}>
                      <MotionCard
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        elevation={2}
                      >
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              sx={{
                                width: 60,
                                height: 60,
                                bgcolor: theme.palette.primary.main,
                              }}
                            >
                              <AchievementIcon sx={{ fontSize: 32 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {achievement.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {achievement.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Conquistado em {format(new Date(achievement.date), "PP", { locale: ptBR })}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </MotionCard>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" textAlign="center">
                      Nenhuma conquista encontrada
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </Box>
        </Box>
      </Container>
    </MemberLayout>
  );
};

const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}> = ({ icon, title, onClick }) => {
  return (
    <MotionCard
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: 3,
      }}>
        {icon}
        <Typography variant="h6" sx={{ mt: 2 }}>
          {title}
        </Typography>
      </CardContent>
    </MotionCard>
  );
};

export default MemberDashboard; 