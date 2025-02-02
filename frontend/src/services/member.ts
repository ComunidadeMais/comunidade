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

interface ApiMember {
  user_id: string;
  join_date: string;
  birth_date: string;
  ministry_start_date: string;
  baptism_date: string;
  membership_date: string;
  transfer_date: string;
  marital_status: string;
  zip_code: string;
  emergency_contact: string;
  emergency_phone: string;
  ministry_role: string;
  is_volunteer: boolean;
  baptism_location: string;
  membership_type: string;
  previous_church: string;
  transferred_from: string;
  transferred_to: string;
  notify_by_email: boolean;
  notify_by_phone: boolean;
  notify_by_whatsapp: boolean;
  allow_photos: boolean;
  is_subscribed_to_newsletter: boolean;
  [key: string]: any; // para outros campos que mantêm o mesmo nome
}

interface ApiResponse {
  member: ApiMember;
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

  getMember: async (communityId: string, memberId: string): Promise<ApiResponse> => {
    const response = await api.get(`/communities/${communityId}/members/${memberId}`);
    return response.data;
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