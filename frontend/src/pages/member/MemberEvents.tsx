import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useTheme } from '@mui/material/styles';

interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  status: string;
}

const MemberEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCommunity } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentCommunity?.id) {
          throw new Error('ID da comunidade não encontrado');
        }

        const response = await api.get(`/communities/${currentCommunity.id}/events`);
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentCommunity]);

  if (loading) {
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Eventos
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {events.length > 0 ? (
            events.map((event) => (
              <Grid item xs={12} md={6} key={event.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <EventIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{event.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(event.date), "PPp", { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {event.description}
                    </Typography>

                    <Box display="flex" gap={1} mb={2}>
                      <Chip 
                        label={event.location}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={event.status}
                        size="small"
                        color={event.status === 'open' ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Ver Detalhes
                    </Button>
                    {event.status === 'open' && (
                      <Button size="small" color="primary" variant="contained">
                        Participar
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum evento encontrado
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </MemberLayout>
  );
};

export default MemberEvents; 