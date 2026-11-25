export interface ContentMedia {
  id: number;
  content_id: number;
  media_type: string;
  file_url: string;
  created_at: string;
}

export interface EventDate {
  date: string;
  time: string;
  day: string;
}

export type RecurrenceFrequency = 'weekly' | 'monthly';

export interface EventRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  until: EventDate | null;
}

export interface EventOccurrence {
  start_date: EventDate | null;
  end_date: EventDate | null;
}

export interface ChurchEvent {
  id: number;
  type_content: string;
  title: string;
  category_content: string;
  description: string;
  location: string;
  start_date: EventDate | null;
  end_date: EventDate | null;
  google_form_url?: string | null;
  recurrence?: EventRecurrence | null;
  next_occurrence?: EventOccurrence | null;
  media: ContentMedia[];
}

export interface Announcement {
  id: number;
  type_content: string;
  title: string;
  category_content: string;
  status: string;
  description: string;
  start_date: EventDate | null;
  media: ContentMedia[];
}
