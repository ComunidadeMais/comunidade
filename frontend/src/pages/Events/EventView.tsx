import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import api from '../../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

export const EventView: FC = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/events/${eventId}/public`);
        console.log('Resposta da API:', response.data);
        setEvent(response.data.event);
      } catch (err: any) {
        console.error('Erro ao carregar evento:', err);
        setError(err.response?.data?.message || 'Erro ao carregar o evento');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando evento...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">Evento não encontrado</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          {event.html_template ? (
            <div dangerouslySetInnerHTML={{ __html: event.html_template }} />
          ) : (
            <>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {event.community?.logo_url && (
                  <>
                    <img 
                      src={event.community.logo_url} 
                      alt="Logo da Comunidade" 
                      style={{ maxWidth: '200px', marginBottom: '10px' }}
                    />
                    {event.community?.name && (
                      <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
                        {event.community.name}
                      </Typography>
                    )}
                  </>
                )}
                <Typography variant="h4" component="h1" gutterBottom>
                  {event.title}
                </Typography>
                {event.image_url && (
                  <img 
                    src={event.image_url} 
                    alt="Imagem do Evento" 
                    style={{ maxWidth: '100%', height: 'auto', marginBottom: '20px' }}
                  />
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Data e Hora
              </Typography>
              <Typography paragraph>
                Início: {dayjs(event.start_date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
              </Typography>
              <Typography paragraph>
                Término: {dayjs(event.end_date).format('DD [de] MMMM [de] YYYY [às] HH:mm')}
              </Typography>

              {event.location && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Local
                  </Typography>
                  <Typography paragraph>{event.location}</Typography>
                </>
              )}

              {event.description && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Descrição
                  </Typography>
                  <Typography paragraph>{event.description}</Typography>
                </>
              )}

              {event.responsible && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Responsável
                  </Typography>
                  <Typography paragraph>
                    {event.responsible.name}
                    {event.responsible.email && (
                      <>
                        <br />
                        Email: {event.responsible.email}
                      </>
                    )}
                  </Typography>
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 