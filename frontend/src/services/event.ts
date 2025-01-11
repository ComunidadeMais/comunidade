import { api } from './api';
import { CreateEventRequest, Event, UpdateEventRequest } from '../types/event';

export const EventService = {
  async listEvents(communityId: string): Promise<Event[]> {
    console.log('Listando eventos para a comunidade:', communityId);
    const response = await api.get(`/communities/${communityId}/events`);
    console.log('Resposta da API:', response.data);
    return response.data.events;
  },

  async getEvent(communityId: string, eventId: string): Promise<Event> {
    console.log('Buscando evento:', { communityId, eventId });
    const response = await api.get(`/communities/${communityId}/events/${eventId}`);
    console.log('Resposta da API:', response.data);
    if (!response.data.event) {
      throw new Error('Evento não encontrado');
    }
    return response.data.event;
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    const response = await api.post(`/communities/${data.community_id}/events`, data);
    return response.data;
  },

  async updateEvent(communityId: string, eventId: string, data: UpdateEventRequest): Promise<Event> {
    const response = await api.put(`/communities/${communityId}/events/${eventId}`, data);
    return response.data;
  },

  async deleteEvent(communityId: string, eventId: string): Promise<void> {
    await api.delete(`/communities/${communityId}/events/${eventId}`);
  },
}; 