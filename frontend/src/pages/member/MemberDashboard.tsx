import React, { useEffect, useState } from 'react';
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
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada à API
      // Dados mockados para desenvolvimento
      setMemberData({
        profile: {
          name: "João Silva",
          role: "Membro",
          joinDate: "2020-01-01",
          photo: "",
          engagementScore: 75,
        },
        events: [
          { id: 1, name: "Culto de Celebração", date: "2024-03-24 18:00" },
          { id: 2, name: "Encontro de Jovens", date: "2024-03-30 19:30" },
        ],
        achievements: [
          { id: 1, name: "Participante Ativo", description: "Presente em 10 eventos consecutivos", date: "2024-03-01" },
          { id: 2, name: "Contribuidor Fiel", description: "3 meses de contribuições consecutivas", date: "2024-02-15" },
        ],
        groups: [
          { id: 1, name: "Ministério de Louvor", role: "Músico" },
          { id: 2, name: "Pequeno Grupo", role: "Participante" },
        ],
        donations: [
          { id: 1, amount: 100, date: "2024-03-01", status: "completed" },
          { id: 2, amount: 100, date: "2024-02-01", status: "completed" },
        ],
        ministry: {
          tasks: [
            { id: 1, name: "Ensaio do Louvor", date: "2024-03-25 19:00" },
            { id: 2, name: "Escala Domingo", date: "2024-03-31 18:00" },
          ],
          trainings: [
            { id: 1, name: "Curso de Liderança", status: "available" },
            { id: 2, name: "Workshop de Música", status: "completed" },
          ],
        },
        prayers: [
          { id: 1, title: "Oração pela família", date: "2024-03-20", status: "praying" },
          { id: 2, title: "Gratidão", date: "2024-03-15", status: "answered" },
        ],
      });
    } catch (error) {
      console.error('Erro ao carregar dados do membro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  return (
    <MemberLayout>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {/* Profile Section */}
        <MotionGrid
          container
          spacing={2}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                borderRadius: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={3}>
                <Avatar
                  src={memberData.profile.photo}
                  sx={{
                    width: 100,
                    height: 100,
                    border: '4px solid white',
                  }}
                />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {memberData.profile.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {memberData.profile.role}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    <Chip
                      label={`Membro desde ${format(new Date(memberData.profile.joinDate), 'PP', { locale: ptBR })}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                    <Chip
                      label={`Engajamento: ${memberData.profile.engagementScore}%`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </MotionGrid>

        {/* Quick Actions */}
        <Box mt={2}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Ações Rápidas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                icon={<EventIcon />}
                title="Participar de Evento"
                onClick={() => {/* TODO */}}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                icon={<PrayerIcon />}
                title="Pedido de Oração"
                onClick={() => {/* TODO */}}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                icon={<DonationIcon />}
                title="Nova Doação"
                onClick={() => {/* TODO */}}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <QuickActionCard
                icon={<MinistryIcon />}
                title="Voluntariar-se"
                onClick={() => {/* TODO */}}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Content Tabs */}
        <Box>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="member dashboard tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Atividades" />
            <Tab label="Ministério" />
            <Tab label="Conquistas" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Próximos Eventos
                      </Typography>
                      <List>
                        {memberData.events.map((event: any) => (
                          <ListItem key={event.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <EventIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={event.name}
                              secondary={format(new Date(event.date), 'PPp', { locale: ptBR })}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Pedidos de Oração
                      </Typography>
                      <List>
                        {memberData.prayers.map((prayer: any) => (
                          <ListItem key={prayer.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <PrayerIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={prayer.title}
                              secondary={format(new Date(prayer.date), 'PP', { locale: ptBR })}
                            />
                            <Chip
                              label={prayer.status === 'praying' ? 'Em oração' : 'Respondida'}
                              color={prayer.status === 'praying' ? 'primary' : 'success'}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Minhas Tarefas
                      </Typography>
                      <List>
                        {memberData.ministry.tasks.map((task: any) => (
                          <ListItem key={task.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <TaskIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={task.name}
                              secondary={format(new Date(task.date), 'PPp', { locale: ptBR })}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Treinamentos
                      </Typography>
                      <List>
                        {memberData.ministry.trainings.map((training: any) => (
                          <ListItem key={training.id}>
                            <ListItemAvatar>
                              <Avatar>
                                <TrainingIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={training.name}
                            />
                            <Chip
                              label={training.status === 'available' ? 'Disponível' : 'Concluído'}
                              color={training.status === 'available' ? 'primary' : 'success'}
                              size="small"
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={2}>
                {memberData.achievements.map((achievement: any) => (
                  <Grid item xs={12} md={6} key={achievement.id}>
                    <Card>
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <AchievementIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{achievement.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {achievement.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Conquistado em {format(new Date(achievement.date), 'PP', { locale: ptBR })}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Box>
        </Box>
      </Container>
    </MemberLayout>
  );
};

// QuickAction Card Component
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}> = ({ icon, title, onClick }) => {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: '0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          {icon}
          <Typography variant="subtitle1">{title}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MemberDashboard; 