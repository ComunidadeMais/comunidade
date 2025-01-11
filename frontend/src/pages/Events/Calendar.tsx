import React, { useState, useEffect } from 'react';
import { Box, Container, Paper, Typography, Button, CircularProgress, Alert } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { useNavigate } from 'react-router-dom';
import { EventService } from '../../services/event';
import { useCommunity } from '../../contexts/CommunityContext';
import { Event, EventType } from '../../types/event';
import { getEventTypeColor } from '../../utils/eventUtils';
import AddIcon from '@mui/icons-material/Add';
import { EventClickArg } from '@fullcalendar/core';
import dayjs from 'dayjs';

const generateRecurringEvents = (event: Event): any[] => {
  const startDate = dayjs(event.start_date);
  const endDate = dayjs(event.end_date);
  const duration = endDate.diff(startDate); // Duração do evento em milissegundos
  const events = [];
  
  // Adiciona o evento original
  events.push({
    id: event.id,
    title: event.title,
    start: event.start_date,
    end: event.end_date,
    backgroundColor: getEventTypeColor(event.type as EventType),
    extendedProps: {
      description: event.description,
      type: event.type,
      location: event.location,
      isRecurring: true,
      originalEventId: event.id
    }
  });

  // Se não houver recorrência, retorna apenas o evento original
  if (!event.recurrence || event.recurrence === 'none') {
    return events;
  }

  // Gera eventos para os próximos 6 meses
  const sixMonthsFromNow = dayjs().add(6, 'month');
  let currentDate = startDate;

  while (currentDate.isBefore(sixMonthsFromNow)) {
    let nextDate;

    switch (event.recurrence) {
      case 'daily':
        nextDate = currentDate.add(1, 'day');
        break;
      case 'weekly':
        nextDate = currentDate.add(1, 'week');
        break;
      case 'monthly':
        nextDate = currentDate.add(1, 'month');
        break;
      default:
        return events;
    }

    // Adiciona o evento recorrente
    events.push({
      id: `${event.id}_${nextDate.format('YYYY-MM-DD')}`,
      title: event.title,
      start: nextDate.format('YYYY-MM-DDTHH:mm:ss'),
      end: nextDate.add(duration, 'millisecond').format('YYYY-MM-DDTHH:mm:ss'),
      backgroundColor: getEventTypeColor(event.type as EventType),
      extendedProps: {
        description: event.description,
        type: event.type,
        location: event.location,
        isRecurring: true,
        originalEventId: event.id
      }
    });

    currentDate = nextDate;
  }

  return events;
};

const Calendar = () => {
  const navigate = useNavigate();
  const { activeCommunity } = useCommunity();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeCommunity) {
      loadEvents();
    }
  }, [activeCommunity]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!activeCommunity) return;
      
      const events = await EventService.listEvents(activeCommunity.id);
      console.log('Eventos carregados:', events);
      
      // Gera todos os eventos recorrentes
      const allEvents = events.flatMap((event: Event) => generateRecurringEvents(event));
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setError('Não foi possível carregar os eventos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg: DateClickArg) => {
    const selectedDate = arg.dateStr;
    
    const startDate = `${selectedDate}T08:00:00`;
    const endDate = `${selectedDate}T18:00:00`;
    
    navigate('/events/new', {
      state: { 
        defaultStartDate: startDate,
        defaultEndDate: endDate
      }
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    // Se for um evento recorrente, usa o ID do evento original
    const eventId = arg.event.extendedProps.originalEventId || arg.event.id;
    navigate(`/events/${eventId}/edit`);
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Alert severity="warning">
            Selecione uma comunidade para visualizar os eventos.
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Calendário de Eventos
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 2, position: 'relative', minHeight: '500px' }}>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          ) : null}
          
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            locale={ptBrLocale}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            editable={false}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
              hour12: false
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Calendar; 