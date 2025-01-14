import api from './api';
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

  async getPublicEvent(eventId: string): Promise<Event> {
    const response = await api.get(`/events/${eventId}/public`);
    return response.data.event;
  },

  async uploadImage(communityId: string, eventId: string | null, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(
        `/communities/${communityId}/events/${eventId || 'new'}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.filepath;
    } catch (error: any) {
      console.error('Erro ao fazer upload da imagem:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer upload da imagem');
    }
  }
}; 