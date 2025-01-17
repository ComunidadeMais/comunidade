import api from './api';
import { CheckIn, CheckInRequest, CheckInStats } from '../types/checkin';

const checkInService = {
  create: async (data: CheckInRequest): Promise<CheckIn> => {
    console.log('Enviando dados para check-in:', data);
    const response = await api.post(`/events/${data.event_id}/checkin`, data);
    return response.data;
  },

  getEventCheckIns: async (eventId: string): Promise<CheckIn[]> => {
    console.log('Buscando check-ins do evento:', eventId);
    const response = await api.get(`/events/${eventId}/checkin`);
    return response.data;
  },

  getEventStats: async (eventId: string): Promise<CheckInStats> => {
    console.log('Buscando estatísticas do evento:', eventId);
    const response = await api.get(`/events/${eventId}/checkin/stats`);
    return response.data;
  },
};

export default checkInService; 