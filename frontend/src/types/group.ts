import { Community } from './community';
import { Member } from './member';

export interface Group {
  id: string;
  community_id: string;
  name: string;
  description: string;
  type: GroupType;
  category?: string;
  status: GroupStatus;
  visibility: GroupVisibility;
  leader_id?: string;
  co_leader_id?: string;
  location?: string;
  meeting_day?: string;
  meeting_time?: string;
  frequency?: string;
  max_members?: number;
  min_age?: number;
  max_age?: number;
  gender?: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;

  // Configurações
  allow_guests?: boolean;
  require_approval?: boolean;
  track_attendance?: boolean;
  allow_self_join?: boolean;
  notify_on_join_request?: boolean;
  notify_on_new_member?: boolean;

  // Estatísticas
  member_count?: number;
  attendance_count?: number;
  average_attendance?: number;
  meeting_count?: number;

  // Relacionamentos
  community?: Community;
  leader?: Member;
  co_leader?: Member;
  members?: Member[];
}

export enum GroupType {
  CELL = 'cell',
  SMALL_GROUP = 'small_group',
  MINISTRY = 'ministry',
  DEPARTMENT = 'department',
  COMMITTEE = 'committee',
  OTHER = 'other'
}

export enum GroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum GroupVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  HIDDEN = 'hidden'
}

export const GroupTypeLabels = {
  [GroupType.CELL]: 'Célula',
  [GroupType.SMALL_GROUP]: 'Pequeno Grupo',
  [GroupType.MINISTRY]: 'Ministério',
  [GroupType.DEPARTMENT]: 'Departamento',
  [GroupType.COMMITTEE]: 'Comitê',
  [GroupType.OTHER]: 'Outro'
};

export const GroupStatusLabels = {
  [GroupStatus.ACTIVE]: 'Ativo',
  [GroupStatus.INACTIVE]: 'Inativo',
  [GroupStatus.ARCHIVED]: 'Arquivado'
};

export const GroupVisibilityLabels = {
  [GroupVisibility.PUBLIC]: 'Público',
  [GroupVisibility.PRIVATE]: 'Privado',
  [GroupVisibility.HIDDEN]: 'Oculto'
}; 