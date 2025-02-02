import { Community } from './community';
import { User } from './user';
import { Family } from './family';

export interface Member {
  id: string;
  communityId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: string;
  type: string;
  status: string;
  joinDate: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  notes?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photo?: string;

  // Campos de ministério
  ministry?: string;
  ministryRole?: string;
  ministryStartDate?: string;
  isVolunteer?: boolean;
  skills?: string[];
  interests?: string[];

  // Campos de família
  familyId?: string;
  familyRole?: string;
  family?: Family;

  // Campos de batismo e membresia
  baptismDate?: string;
  baptismLocation?: string;
  membershipDate?: string;
  membershipType?: string;
  previousChurch?: string;
  transferredFrom?: string;
  transferredTo?: string;
  transferDate?: string;

  // Campos de comunicação
  notifyByEmail?: boolean;
  notifyByPhone?: boolean;
  notifyByWhatsApp?: boolean;
  allowPhotos?: boolean;
  isSubscribedToNewsletter?: boolean;

  // Campos de participação
  lastAttendanceAt?: string;
  attendanceCount?: number;
  lastContributionAt?: string;
  contributionCount?: number;
  totalContributions?: number;

  // Relacionamentos
  community?: Community;
  user?: User;

  createdAt?: string;
  updatedAt?: string;
} 