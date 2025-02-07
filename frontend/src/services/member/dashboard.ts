import api from '../api';

export interface MemberDashboardData {
  profile: {
    role: string;
    joinDate: string;
    engagementScore: number;
  };
  events: Array<{
    id: number;
    name: string;
    date: string;
  }>;
  prayers: Array<{
    id: number;
    title: string;
    date: string;
    status: string;
  }>;
  donations: Array<{
    id: number;
    amount: number;
    date: string;
    status: string;
  }>;
  groups: Array<{
    id: number;
    name: string;
    role: string;
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
  achievements: Array<{
    id: number;
    name: string;
    description: string;
    date: string;
  }>;
}

const memberDashboardService = {
  getMemberDashboard: async (communityId: string, memberId: string): Promise<MemberDashboardData> => {
    const response = await api.get(`/communities/${communityId}/engagement/members/${memberId}/dashboard`);
    return response.data;
  },
};

export default memberDashboardService;