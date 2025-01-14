import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../../services/event';
import { Event, EventWithResponsible } from '../../types/event';
import { useCommunity } from '../../contexts/CommunityContext';
import { useUsers } from '../../contexts/UsersContext';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

export function Events() {
  const navigate = useNavigate();
  const { activeCommunity } = useCommunity();
  const { users } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventWithResponsible[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventWithResponsible[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (activeCommunity) {
      loadEvents();
    }
  }, [activeCommunity]);

  useEffect(() => {
    filterEvents();
  }, [search, events]);

  useEffect(() => {
    if (events.length > 0 && users?.length > 0) {
      const updatedEvents: EventWithResponsible[] = events.map(event => {
        const responsible = users.find(user => user.id === event.responsible_id);
        return {
          ...event,
          responsible: responsible ? {
            id: responsible.id,
            name: responsible.name,
            email: responsible.email
          } : undefined
        };
      });

      const hasChanges = JSON.stringify(events) !== JSON.stringify(updatedEvents);
      if (hasChanges) {
        setEvents(updatedEvents);
      }
    }
  }, [users]);

  const loadEvents = async () => {
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);
    try {
      const data = await EventService.listEvents(activeCommunity.id);
      
      if (users?.length > 0) {
        const eventsWithResponsibles: EventWithResponsible[] = data.map(event => {
          const responsible = users.find(user => user.id === event.responsible_id);
          return {
            ...event,
            responsible: responsible ? {
              id: responsible.id,
              name: responsible.name,
              email: responsible.email
            } : undefined
          };
        });
        setEvents(Array.isArray(eventsWithResponsibles) ? eventsWithResponsibles : []);
      } else {
        setEvents(Array.isArray(data) ? data.map(event => ({
          ...event,
          responsible: undefined
        })) : []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase()) ||
      event.location?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredEvents(filtered);
    setPage(0);
  };

  const handleDelete = async (eventId: string) => {
    if (!activeCommunity) return;

    if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      await EventService.deleteEvent(activeCommunity.id, eventId);
      await loadEvents();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao excluir evento');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'culto':
        return 'secondary';
      case 'service':
        return 'primary';
      case 'class':
        return 'success';
      case 'meeting':
        return 'warning';
      case 'visit':
        return 'info';
      case 'other':
        return 'default';
      default:
        return 'default';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'culto':
        return 'Culto';
      case 'service':
        return 'Serviço';
      case 'class':
        return 'Aula';
      case 'meeting':
        return 'Reunião';
      case 'visit':
        return 'Visita';
      case 'other':
        return 'Outros';
      default:
        return 'Outro';
    }
  };

  const getRecurrenceLabel = (recurrence: string) => {
    switch (recurrence) {
      case 'none':
        return 'Nenhuma';
      case 'daily':
        return 'Diária';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      default:
        return recurrence;
    }
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
          <Typography variant="h4" component="h1">
            Eventos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/events/new')}
          >
            Novo Evento
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Imagem</TableCell>
                    <TableCell>Título</TableCell>
                    <TableCell>Local</TableCell>
                    <TableCell>Data de Início</TableCell>
                    <TableCell>Data de Término</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Recorrência</TableCell>
                    <TableCell>Responsável</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        Nenhum evento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>
                            {event.image_url ? (
                              <Avatar
                                src={`http://localhost:8080/uploads/${event.image_url}`}
                                alt={event.title}
                                variant="rounded"
                                sx={{ width: 56, height: 56 }}
                              />
                            ) : (
                              <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>
                                <PersonIcon />
                              </Avatar>
                            )}
                          </TableCell>
                          <TableCell>{event.title}</TableCell>
                          <TableCell>{event.location}</TableCell>
                          <TableCell>
                            {dayjs(event.start_date).locale('pt-br').format("DD [de] MMMM [de] YYYY [às] HH:mm")}
                          </TableCell>
                          <TableCell>
                            {dayjs(event.end_date).locale('pt-br').format("DD [de] MMMM [de] YYYY [às] HH:mm")}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getEventTypeLabel(event.type)}
                              color={getEventTypeColor(event.type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getRecurrenceLabel(event.recurrence)}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {event.responsible_id ? (
                              <Tooltip title={event.responsible?.email || ''}>
                                <Chip
                                  avatar={<Avatar>{event.responsible?.name?.[0] || '?'}</Avatar>}
                                  label={event.responsible?.name || 'Responsável não encontrado'}
                                  variant="outlined"
                                  size="small"
                                />
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Visualizar">
                                <IconButton
                                  size="small"
                                  onClick={() => window.open(`/events/${event.id}/view`, '_blank')}
                                  color="info"
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/events/${event.id}/edit`)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(event.id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredEvents.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 