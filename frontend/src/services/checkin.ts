import api from './api';
import { CheckIn, CheckInRequest, CheckInStats } from '../types/checkin';

const checkInService = {
  create: async (data: CheckInRequest) => {
    const response = await api.post(`/events/${data.event_id}/checkin`, data);
    return response.data;
  },

  getEventCheckIns: async (eventId: string): Promise<CheckIn[]> => {
    const response = await api.get(`/events/${eventId}/checkin/list`);
    return response.data;
  },

  getEventStats: async (eventId: string): Promise<CheckInStats> => {
    const response = await api.get(`/events/${eventId}/checkin/stats`);
    return response.data;
  }
};

export default checkInService; 