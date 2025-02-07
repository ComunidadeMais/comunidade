import api from '../api';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  capacity: number;
  registered: number;
  status: 'upcoming' | 'ongoing' | 'past';
}

interface EventsResponse {
  events: Event[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export const memberEventService = {
  listEvents: async (communityId: string, params?: { status?: string; page?: number; per_page?: number }) => {
    const response = await api.get<EventsResponse>(`/communities/${communityId}/member/events`, {
      params: {
        status: params?.status || 'upcoming',
        page: params?.page || 1,
        per_page: params?.per_page || 10
      }
    });
    return response.data;
  },

  getEvent: async (communityId: string, eventId: string) => {
    const response = await api.get<{ event: Event }>(`/communities/${communityId}/member/events/${eventId}`);
    return response.data.event;
  },

  registerForEvent: async (communityId: string, eventId: string) => {
    const response = await api.post(`/communities/${communityId}/member/events/${eventId}/register`);
    return response.data;
  },

  cancelRegistration: async (communityId: string, eventId: string) => {
    const response = await api.delete(`/communities/${communityId}/member/events/${eventId}/register`);
    return response.data;
  },

  getRegisteredEvents: async (communityId: string) => {
    const response = await api.get<EventsResponse>(`/communities/${communityId}/member/events/registered`);
    return response.data;
  },

  getPastEvents: async (communityId: string) => {
    const response = await api.get<EventsResponse>(`/communities/${communityId}/member/events`, {
      params: {
        status: 'past'
      }
    });
    return response.data;
  }
}; 