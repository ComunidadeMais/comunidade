import api from './api';
import { Community } from '../types/community';

interface Pagination {
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

interface ListCommunitiesResponse {
  communities: Community[];
  pagination: Pagination;
}

interface CommunityResponse {
  community: Community;
  message: string;
}

interface UploadResponse {
  message: string;
  logo?: string;
  banner?: string;
}

export const CommunityService = {
  async listCommunities(): Promise<Community[]> {
    try {
      const response = await api.get<ListCommunitiesResponse>('/communities');
      console.log('Resposta completa da API de comunidades:', response);
      console.log('Dados das comunidades:', response.data);
      return response.data.communities || [];
    } catch (error) {
      console.error('Erro ao listar comunidades:', error);
      throw error;
    }
  },

  async getCommunity(id: string): Promise<Community> {
    try {
      const response = await api.get<CommunityResponse>(`/communities/${id}`);
      return response.data.community;
    } catch (error) {
      throw error;
    }
  },

  async createCommunity(data: Partial<Community>): Promise<Community> {
    try {
      console.log('Enviando dados para criar comunidade:', data);
      const response = await api.post<CommunityResponse>('/communities', data);
      console.log('Resposta da criação de comunidade:', response.data);
      return response.data.community;
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      throw error;
    }
  },

  async updateCommunity(id: string, data: Partial<Community>): Promise<Community> {
    try {
      console.log('Enviando dados para atualizar comunidade:', data);
      const response = await api.put<CommunityResponse>(`/communities/${id}`, data);
      console.log('Resposta da atualização de comunidade:', response.data);
      return response.data.community;
    } catch (error) {
      console.error('Erro ao atualizar comunidade:', error);
      throw error;
    }
  },

  async deleteCommunity(id: string): Promise<void> {
    try {
      await api.delete(`/communities/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async uploadLogo(communityId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.post<UploadResponse>(
        `/communities/${communityId}/logo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Resposta do upload do logo:', response.data);
      return response.data.logo || '';
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      throw error;
    }
  },

  async uploadBanner(communityId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await api.post<UploadResponse>(
        `/communities/${communityId}/banner`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Resposta do upload do banner:', response.data);
      return response.data.banner || '';
    } catch (error) {
      console.error('Erro ao fazer upload do banner:', error);
      throw error;
    }
  }
}; 