import { Member } from './member';

export interface Family {
  id: string;
  community_id: string;
  name: string;
  description?: string;
  head_of_family?: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  member_id: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export enum FamilyRoles {
  SPOUSE = 'Cônjuge',
  CHILD = 'Filho(a)',
  SIBLING = 'Irmão(ã)',
  PARENT = 'Pai/Mãe',
  GRANDPARENT = 'Avô/Avó',
  GRANDCHILD = 'Neto(a)',
  UNCLE_AUNT = 'Tio(a)',
  NEPHEW_NIECE = 'Sobrinho(a)',
  COUSIN = 'Primo(a)',
  OTHER = 'Outro'
}

export const FamilyRoleValues = {
  SPOUSE: 'spouse',
  CHILD: 'child',
  SIBLING: 'sibling',
  PARENT: 'parent',
  GRANDPARENT: 'grandparent',
  GRANDCHILD: 'grandchild',
  UNCLE_AUNT: 'uncle_aunt',
  NEPHEW_NIECE: 'nephew_niece',
  COUSIN: 'cousin',
  OTHER: 'other'
} as const; 