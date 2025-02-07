import api from '../api';

export interface MemberDashboardData {
  profile: {
    name: string;
    role: string;
    joinDate: string;
    photo: string;
    engagementScore: number;
  };
  events: Array<{
    id: number;
    name: string;
    date: string;
  }>;
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    date: string;
  }>;
  groups: Array<{
    id: number;
    name: string;
    role: string;
  }>;
  donations: Array<{
    id: number;
    amount: number;
    date: string;
    status: string;
  }>;
  ministry: {
    tasks: Array<{
      id: number;
      name: string;
      date: string;
    }>;
    trainings: Array<{
      id: number;
      name: string;
      status: string;
    }>;
  };
  prayers: Array<{
    id: number;
    title: string;
    date: string;
    status: string;
  }>;
}

export const memberDashboardService = {
  getMemberDashboard: async (communityId: string): Promise<MemberDashboardData> => {
    const response = await api.get<MemberDashboardData>(`/communities/${communityId}/engagement/members/dashboard`);
    return response.data;
  },

  getEvents: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/events`);
    return response.data;
  },

  getAchievements: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/achievements`);
    return response.data;
  },

  getGroups: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/groups`);
    return response.data;
  },

  getDonations: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/donations`);
    return response.data;
  },

  getMinistryTasks: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/ministry/tasks`);
    return response.data;
  },

  getMinistryTrainings: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/ministry/trainings`);
    return response.data;
  },

  getPrayers: async (communityId: string) => {
    const response = await api.get(`/communities/${communityId}/engagement/members/prayers`);
    return response.data;
  },

  createPrayer: async (communityId: string, data: { title: string; content: string; isPrivate: boolean }) => {
    const response = await api.post(`/communities/${communityId}/engagement/members/prayers`, data);
    return response.data;
  },

  updatePrayer: async (communityId: string, prayerId: number, data: { status: string }) => {
    const response = await api.put(`/communities/${communityId}/engagement/members/prayers/${prayerId}`, data);
    return response.data;
  },

  enrollTraining: async (communityId: string, trainingId: number) => {
    const response = await api.post(`/communities/${communityId}/engagement/members/trainings/${trainingId}/enroll`);
    return response.data;
  },
}; 