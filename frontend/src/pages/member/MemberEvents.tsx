import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Event as EventIcon,
  CalendarMonth,
  AccessTime,
  LocationOn,
  Group,
} from '@mui/icons-material';
import MemberLayout from '../../layouts/MemberLayout';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { memberEventService, Event } from '../../services/member/events';

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
      id={`event-tabpanel-${index}`}
      aria-labelledby={`event-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MemberEvents: React.FC = () => {
  const { communityId } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (communityId) {
      loadEvents();
    }
  }, [communityId, tabValue]);

  const loadEvents = async () => {
    if (!communityId) return;
    
    try {
      setLoading(true);
      let response;
      
      switch (tabValue) {
        case 0: // Próximos eventos
          response = await memberEventService.listEvents(communityId, { status: 'upcoming' });
          break;
        case 1: // Eventos passados
          response = await memberEventService.getPastEvents(communityId);
          break;
        case 2: // Eventos inscritos
          response = await memberEventService.getRegisteredEvents(communityId);
          break;
        default:
          response = await memberEventService.listEvents(communityId);
      }
      
      setEvents(response.events || []);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRegister = async (eventId: string) => {
    if (!communityId) return;
    
    try {
      await memberEventService.registerForEvent(communityId, eventId);
      loadEvents(); // Recarrega os eventos após a inscrição
    } catch (err) {
      console.error('Erro ao se inscrever no evento:', err);
      // TODO: Adicionar feedback visual do erro
    }
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!communityId) return;
    
    try {
      await memberEventService.cancelRegistration(communityId, eventId);
      loadEvents(); // Recarrega os eventos após cancelar a inscrição
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      // TODO: Adicionar feedback visual do erro
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme.palette.success.main;
      case 'ongoing':
        return theme.palette.warning.main;
      case 'past':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Eventos
          </Typography>
          <Button
            variant="outlined"
            startIcon={<CalendarMonth />}
            onClick={() => {/* Implementar visualização de calendário */}}
          >
            Ver Calendário
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Próximos" />
            <Tab label="Passados" />
            <Tab label="Inscritos" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {events.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Não há eventos próximos disponíveis.
                </Typography>
              </Grid>
            ) : (
              events.map((event) => (
                <Grid item xs={12} md={6} key={event.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6" component="h2">
                          {event.name}
                        </Typography>
                        <Chip
                          label={event.type}
                          size="small"
                          color="primary"
                          sx={{ bgcolor: getStatusColor(event.status) }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {event.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">
                          {format(new Date(event.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} às {event.time}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <LocationOn sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">{event.location}</Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Group sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography variant="body2">
                          {event.registered} / {event.capacity} participantes
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleRegister(event.id)}
                        >
                          Inscrever-se
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {events.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Não há eventos passados.
                </Typography>
              </Grid>
            ) : (
              events.map((event) => (
                <Grid item xs={12} md={6} key={event.id}>
                  {/* Renderizar eventos passados */}
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {events.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Você não está inscrito em nenhum evento.
                </Typography>
              </Grid>
            ) : (
              events.map((event) => (
                <Grid item xs={12} md={6} key={event.id}>
                  {/* Renderizar eventos inscritos com opção de cancelar inscrição */}
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
      </>
    );
  };

  return (
    <MemberLayout>
      <Container>
        {renderContent()}
      </Container>
    </MemberLayout>
  );
};

export default MemberEvents; 