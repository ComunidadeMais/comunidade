import { Community } from './community';

export enum EventType {
  CULTO = 'culto',
  SERVICE = 'service',
  CLASS = 'class',
  MEETING = 'meeting',
  VISIT = 'visit',
  OTHER = 'other'
}

export interface Event {
  id: string;
  community_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  type: EventType;
  recurrence: string;
  responsible_id: string;
  responsible?: {
    id: string;
    name: string;
    email: string;
  };
  community?: Community;
  image_url?: string;
  html_template?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  community_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  type: EventType;
  recurrence: string;
  responsible_id: string;
  image_url?: string;
  html_template?: string;
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  type: EventType;
  recurrence: string;
  responsible_id: string;
  image_url?: string;
  html_template?: string;
} 