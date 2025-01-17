export interface CheckIn {
  id: number;
  event_id: number;
  member_id?: number;
  is_visitor: boolean;
  name: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  source?: string;
  consent: boolean;
  check_in_at: string;
  created_at: string;
  updated_at: string;
}

export interface CheckInStats {
  total_check_ins: number;
  members_check_ins: number;
  visitors_check_ins: number;
}

export interface CheckInData {
  name: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  source?: string;
  consent: boolean;
  isVisitor: boolean;
  memberId?: number;
  familyIds?: number[];
}

export interface CheckInRequest {
  event_id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  source?: string;
  consent: boolean;
  is_visitor: boolean;
  member_id?: string;
  family_ids?: string[];
} 