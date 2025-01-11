export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  timezone: string;
  language: string;
  status: 'active' | 'inactive' | 'archived';
  type: 'church' | 'ministry' | 'organization' | 'other';
  
  // Configurações
  allow_public_events: boolean;
  allow_public_groups: boolean;
  allow_member_registration: boolean;
  require_approval: boolean;
  allow_guest_attendance: boolean;
  enable_contributions: boolean;
  enable_events: boolean;
  enable_groups: boolean;
  enable_attendance: boolean;

  // Estatísticas
  member_count: number;
  event_count: number;
  group_count: number;
  attendance_count: number;

  // Datas
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}