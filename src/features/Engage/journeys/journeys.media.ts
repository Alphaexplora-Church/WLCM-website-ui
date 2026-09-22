import type { JourneyContentType, JourneyPart, JourneySummary, MediaEmbed } from './journeys.types';
import { CONTENT_TYPE_LABELS } from './journeys.types';

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/i;
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/i;

export const toMediaEmbed = (mediaUrl: string | null, mediaType: string | null): MediaEmbed | null => {
  if (!mediaUrl) return null;
  if (mediaType === 'image') return { kind: 'image', src: mediaUrl };

  const youtube = mediaUrl.match(YOUTUBE_ID);
  if (youtube) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };

  const vimeo = mediaUrl.match(VIMEO_ID);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };

  if (/\.(mp3|m4a|aac|wav|ogg)(\?|$)/i.test(mediaUrl)) return { kind: 'audio', src: mediaUrl };

  return { kind: 'link', src: mediaUrl };
};

export const partThumbnail = (part: JourneyPart, journey: JourneySummary | null): string | null => {
  if (part.mediaUrl && part.mediaType === 'image') return part.mediaUrl;
  const youtube = part.mediaUrl?.match(YOUTUBE_ID);
  if (youtube) return `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg`;
  return journey?.thumbnailUrl ?? null;
};

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDuration = (seconds: number | null): string => {
  if (!seconds || seconds <= 0) return '';
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
};

export const partLength = (part: JourneyPart): string => {
  const duration = formatDuration(part.mediaDurationSeconds);
  if (duration) return duration;
  return part.estimatedReadTimeMinutes ? `${part.estimatedReadTimeMinutes} min read` : '';
};

export const episodeCount = (count: number): string => `${count} ${count === 1 ? 'episode' : 'episodes'}`;

export const journeyLabel = (journey: JourneySummary): string =>
  journey.categories[0] ?? (journey.contentType ? CONTENT_TYPE_LABELS[journey.contentType as JourneyContentType] : 'Series');
