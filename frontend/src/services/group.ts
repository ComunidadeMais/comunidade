import { api } from './api';
import { Group } from '../types/group';
import { Member } from '../types/member';

interface GroupMembersResponse {
  members: Member[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

interface ListGroupsParams {
  page?: number;
  per_page?: number;
}

interface GroupsResponse {
  groups: Group[];
  pagination: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export const GroupService = {
  async listGroups(communityId: string, params?: ListGroupsParams) {
    const response = await api.get<GroupsResponse>(`/communities/${communityId}/groups`, {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 10
      }
    });
    return response.data;
  },

  async getGroup(communityId: string, groupId: string) {
    const response = await api.get(`/communities/${communityId}/groups/${groupId}`);
    return response.data;
  },

  async createGroup(communityId: string, data: Partial<Group>) {
    const formattedData = {
      ...data,
      leader_id: data.leader_id || null,
      co_leader_id: data.co_leader_id || null,
      allow_guests: Boolean(data.allow_guests),
      require_approval: Boolean(data.require_approval),
      track_attendance: Boolean(data.track_attendance),
      allow_self_join: Boolean(data.allow_self_join),
      notify_on_join_request: Boolean(data.notify_on_join_request),
      notify_on_new_member: Boolean(data.notify_on_new_member),
      max_members: Number(data.max_members || 0),
      min_age: Number(data.min_age || 0),
      max_age: Number(data.max_age || 0),
      member_count: Number(data.member_count || 0),
      attendance_count: Number(data.attendance_count || 0),
      average_attendance: Number(data.average_attendance || 0),
      meeting_count: Number(data.meeting_count || 0),
    };

    const { type, ...rest } = formattedData;

    const finalData = {
      ...rest,
      type: data.type || 'small_group',
    };

    console.log('Dados formatados para envio:', finalData);

    const response = await api.post(`/communities/${communityId}/groups`, finalData);
    return response.data;
  },

  async updateGroup(communityId: string, groupId: string, data: Partial<Group>) {
    const formattedData = {
      ...data,
      leader_id: data.leader_id || null,
      co_leader_id: data.co_leader_id || null,
      allow_guests: Boolean(data.allow_guests),
      require_approval: Boolean(data.require_approval),
      track_attendance: Boolean(data.track_attendance),
      allow_self_join: Boolean(data.allow_self_join),
      notify_on_join_request: Boolean(data.notify_on_join_request),
      notify_on_new_member: Boolean(data.notify_on_new_member),
      max_members: Number(data.max_members || 0),
      min_age: Number(data.min_age || 0),
      max_age: Number(data.max_age || 0),
      member_count: Number(data.member_count || 0),
      attendance_count: Number(data.attendance_count || 0),
      average_attendance: Number(data.average_attendance || 0),
      meeting_count: Number(data.meeting_count || 0),
    };

    const { type, ...rest } = formattedData;

    const finalData = {
      ...rest,
      type: data.type || 'small_group',
    };

    console.log('Dados formatados para envio:', finalData);

    const response = await api.put(`/communities/${communityId}/groups/${groupId}`, finalData);
    return response.data;
  },

  async deleteGroup(communityId: string, groupId: string) {
    await api.delete(`/communities/${communityId}/groups/${groupId}`);
  },

  async listMembers(communityId: string, groupId: string, params?: ListGroupsParams) {
    console.log('Chamando API para listar membros:', { communityId, groupId, params });
    const response = await api.get<GroupMembersResponse>(`/communities/${communityId}/groups/${groupId}/members`, {
      params: {
        page: params?.page || 1,
        per_page: params?.per_page || 10
      }
    });
    console.log('Resposta da API:', response.data);
    return response.data;
  },

  async addMember(communityId: string, groupId: string, memberId: string) {
    const response = await api.post(`/communities/${communityId}/groups/${groupId}/members/${memberId}`);
    return response.data;
  },

  async removeMember(communityId: string, groupId: string, memberId: string) {
    await api.delete(`/communities/${communityId}/groups/${groupId}/members/${memberId}`);
  }
}; 