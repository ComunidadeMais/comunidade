import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { EventService } from '../../services/event';
import { useCommunity } from '../../contexts/CommunityContext';
import { EventType } from '../../types/event';
import dayjs from 'dayjs';

interface LocationState {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const locationState = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    community_id: '',
    title: '',
    description: '',
    location: '',
    start_date: locationState?.defaultStartDate ? dayjs(locationState.defaultStartDate).format('YYYY-MM-DDTHH:mm') : '',
    end_date: locationState?.defaultEndDate ? dayjs(locationState.defaultEndDate).format('YYYY-MM-DDTHH:mm') : '',
    type: EventType.SERVICE,
    recurrence: 'none',
  });

  useEffect(() => {
    if (activeCommunity) {
      setFormData(prev => ({
        ...prev,
        community_id: activeCommunity.id
      }));
      if (eventId) {
        console.log('Editando evento:', eventId);
        loadEvent();
      }
    }
  }, [activeCommunity, eventId]);

  const loadEvent = async () => {
    if (!activeCommunity || !eventId) return;

    try {
      setLoading(true);
      const event = await EventService.getEvent(activeCommunity.id, eventId);
      console.log('Evento carregado:', event);
      
      if (event) {
        setFormData({
          community_id: event.community_id,
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          start_date: dayjs(event.start_date).format('YYYY-MM-DDTHH:mm'),
          end_date: dayjs(event.end_date).format('YYYY-MM-DDTHH:mm'),
          type: event.type || EventType.SERVICE,
          recurrence: event.recurrence || 'none',
        });
      }
    } catch (err: any) {
      console.error('Erro ao carregar evento:', err);
      setError('Erro ao carregar dados do evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    if (!formData.description.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        community_id: activeCommunity.id,
        start_date: dayjs(formData.start_date).format('YYYY-MM-DDTHH:mm:00Z'),
        end_date: dayjs(formData.end_date).format('YYYY-MM-DDTHH:mm:00Z'),
        description: formData.description.trim()
      };

      if (eventId) {
        await EventService.updateEvent(activeCommunity.id, eventId, payload);
        setSuccess('Evento atualizado com sucesso!');
      } else {
        await EventService.createEvent(payload);
        setSuccess('Evento criado com sucesso!');
      }
      navigate('/events');
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.details || err.response?.data?.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar eventos
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/events')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {eventId ? 'Editar Evento' : 'Novo Evento'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Local"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Data de Início"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Data de Término"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="type-label">Tipo</InputLabel>
                    <Select
                      labelId="type-label"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Tipo"
                      required
                    >
                      <MenuItem value={EventType.CULTO}>Culto</MenuItem>
                      <MenuItem value={EventType.SERVICE}>Serviço</MenuItem>
                      <MenuItem value={EventType.CLASS}>Aula</MenuItem>
                      <MenuItem value={EventType.MEETING}>Reunião</MenuItem>
                      <MenuItem value={EventType.VISIT}>Visita</MenuItem>
                      <MenuItem value={EventType.OTHER}>Outros</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="recurrence-label">Recorrência</InputLabel>
                    <Select
                      labelId="recurrence-label"
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleChange}
                      label="Recorrência"
                      required
                    >
                      <MenuItem value="none">Nenhuma</MenuItem>
                      <MenuItem value="daily">Diária</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 