export enum EventType {
  CULTO = 'culto',
  SERVICE = 'service',
  CLASS = 'class',
  MEETING = 'meeting',
  VISIT = 'visit',
  OTHER = 'other'
}

export type Event = {
  id: string;
  community_id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  type: EventType;
  recurrence: string;
  created_at: string;
  updated_at: string;
};

export type CreateEventRequest = {
  community_id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  type: EventType;
  recurrence: string;
};

export type UpdateEventRequest = {
  community_id: string;
  title: string;
  description?: string;
  location: string;
  start_date: string;
  end_date: string;
  type: EventType;
  recurrence: string;
}; 