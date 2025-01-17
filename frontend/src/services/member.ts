import api from './api';
import publicApi from './publicApi';
import { Member } from '../types/member';

interface MemberResponse {
  members: Member[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface SingleMemberResponse {
  member: Member;
}

interface ListMembersParams {
  page?: number;
  per_page?: number;
  search?: string;
}

interface FamilyResponse {
  family_members: Member[];
}

export const MemberService = {
  async listMembers(communityId: string, params?: ListMembersParams) {
    const response = await api.get<MemberResponse>(`/communities/${communityId}/members`, {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 10,
        search: params?.search || ''
      }
    });
    return response.data;
  },

  async getMember(communityId: string, memberId: string) {
    const response = await api.get<SingleMemberResponse>(`/communities/${communityId}/members/${memberId}`);
    return response.data.member;
  },

  getFamilyMember: async (communityId: string, memberId: string) => {
    try {
      const response = await api.get(`/communities/${communityId}/members/${memberId}/family`);
      console.log('Resposta do getFamilyMember:', response.data);
      return response.data;
    } catch (err) {
      console.log('Membro não pertence a nenhuma família:', err);
      return null;
    }
  },

  async createMember(communityId: string, data: Partial<Member>) {
    const response = await api.post(`/communities/${communityId}/members`, data);
    return response.data;
  },

  async updateMember(communityId: string, memberId: string, data: Partial<Member>) {
    const response = await api.put(`/communities/${communityId}/members/${memberId}`, data);
    return response.data;
  },

  async deleteMember(communityId: string, memberId: string) {
    await api.delete(`/communities/${communityId}/members/${memberId}`);
  },

  uploadPhoto: async (communityId: string, memberId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<{ message: string; photo: string }>(
      `/communities/${communityId}/members/${memberId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.photo;
  },

  findByEmailOrPhone: async (eventId: string, searchTerm: string): Promise<SingleMemberResponse> => {
    const response = await publicApi.get<SingleMemberResponse>(`/events/${eventId}/members/search`, {
      params: { search: searchTerm }
    });
    return response.data;
  },

  getMemberFamily: async (eventId: string, memberId: string): Promise<FamilyResponse> => {
    const response = await publicApi.get<FamilyResponse>(`/events/${eventId}/members/${memberId}/family`);
    return response.data;
  }
}; 