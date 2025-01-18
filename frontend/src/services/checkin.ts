import api from './api';
import publicApi from './publicApi';
import { CheckIn, CheckInRequest, CheckInStats } from '../types/checkin';

interface CheckInResponse {
  check_ins: CheckIn[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

const checkInService = {
  create: async (data: CheckInRequest) => {
    try {
      const response = await publicApi.post<{ message: string }>(`/events/${data.event_id}/checkin`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar check-in:', error);
      throw error;
    }
  },

  getEventCheckIns: async (eventId: string, page: number = 1, perPage: number = 10) => {
    try {
      console.log(`Buscando check-ins do evento ${eventId} - página ${page}`);
      const response = await api.get<CheckIn[]>(`/events/${eventId}/checkin/list`, {
        params: {
          page,
          per_page: perPage
        }
      });
      console.log('Resposta da API:', response.data);
      
      const totalItems = response.data.length;
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const paginatedItems = response.data.slice(startIndex, endIndex);
      
      return {
        check_ins: paginatedItems,
        pagination: {
          total: totalItems,
          page: page,
          per_page: perPage,
          total_pages: Math.ceil(totalItems / perPage)
        }
      };
    } catch (error: any) {
      console.error('Erro ao buscar check-ins:', error);
      throw error;
    }
  },

  getEventStats: async (eventId: string) => {
    try {
      console.log(`Buscando estatísticas do evento ${eventId}`);
      const response = await api.get<CheckInStats>(`/events/${eventId}/checkin/stats`);
      console.log('Estatísticas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

export default checkInService; 