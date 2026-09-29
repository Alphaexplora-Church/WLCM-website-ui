export type JourneyContentType = 'sunday_service' | 'devotional' | 'bible_study' | 'general';

export const CONTENT_TYPE_LABELS: Record<JourneyContentType, string> = {
  sunday_service: 'Sermon Series',
  bible_study: 'Bible Study',
  devotional: 'Devotional',
  general: 'Discipleship Course',
};

export interface JourneySummary {
  journeyId: string;
  title: string;
  description: string | null;
  summary: string | null;
  contentType: JourneyContentType | null;
  thumbnailUrl: string | null;
  categories: string[];
  totalPublishedParts: number;
  createdAt: string;
  updatedAt: string;
}

export interface JourneyPart {
  partId: string;
  partOrder: number;
  title: string;
  mediaUrl: string | null;
  mediaType: string | null;
  mediaDurationSeconds: number | null;
  readingText: string | null;
  estimatedReadTimeMinutes: number | null;
  createdAt: string;
}

export interface JourneyDetail {
  journey: JourneySummary;
  parts: JourneyPart[];
}

export interface JourneyCategory {
  categoryId: string;
  name: string;
  sortOrder: number;
}

export interface JourneyCategoryCount {
  name: string;
  count: number;
}

export interface JourneyPage {
  journeys: JourneySummary[];
  page: number;
  totalPages: number;
  total: number;
}

export interface JourneyListQuery {
  page?: number;
  limit?: number;
  category?: string | null;
}

export type MediaEmbedKind = 'iframe' | 'audio' | 'image' | 'link';

export interface MediaEmbed {
  kind: MediaEmbedKind;
  src: string;
}

export interface NowPlaying {
  journey: JourneySummary;
  part: JourneyPart;
}
