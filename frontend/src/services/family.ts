import { api } from './api';

export const FamilyService = {
  getLastName(fullName: string): string {
    const names = fullName.trim().split(' ');
    return names.length > 1 ? names[names.length - 1] : names[0];
  },

  async listFamilies(communityId: string) {
    try {
      const response = await api.get(`/communities/${communityId}/families`);
      return response.data.families || response.data || [];
    } catch (error) {
      console.error('Erro ao listar famílias:', error);
      throw error;
    }
  },

  async getFamily(communityId: string, familyId: string) {
    const response = await api.get(`/communities/${communityId}/families/${familyId}`);
    return response.data;
  },

  async createFamily(communityId: string, data: any) {
    const response = await api.post(`/communities/${communityId}/families`, data);
    return response.data;
  },

  async updateFamily(communityId: string, familyId: string, data: any) {
    const response = await api.put(`/communities/${communityId}/families/${familyId}`, data);
    return response.data;
  },

  async deleteFamily(communityId: string, familyId: string) {
    await api.delete(`/communities/${communityId}/families/${familyId}`);
  },

  async addMember(communityId: string, familyId: string, memberId: string, role: string) {
    const response = await api.post(`/communities/${communityId}/families/${familyId}/members`, {
      member_id: memberId,
      role
    });
    return response.data;
  },

  async removeMember(communityId: string, familyId: string, memberId: string) {
    await api.delete(`/communities/${communityId}/families/${familyId}/members/${memberId}`);
  },

  async updateMemberRole(communityId: string, familyId: string, memberId: string, role: string): Promise<void> {
    await api.put(`/communities/${communityId}/families/${familyId}/members/${memberId}/role`, { role });
  }
}; 