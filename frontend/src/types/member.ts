import { Community } from './community';
import { User } from './user';
import { Family } from './family';

export interface Member {
  id: string;
  communityId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  type: string;
  status: string;
  joinDate: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  occupation?: string;
  address?: string;
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

  // Relacionamentos
  community?: Community;
  user?: User;

  createdAt?: string;
  updatedAt?: string;
} 