import type { JourneyCategory, JourneyDetail, JourneyListQuery, JourneyPage, JourneyPart, JourneySummary } from './journeys.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const CHURCH_ID = import.meta.env.VITE_CHURCH_ID;

interface PaginationBody {
  page: number;
  totalPages: number;
  total: number;
}

const getJson = async <T>(path: string, fallback: string): Promise<T> => {
  const response = await fetch(`${API_BASE}/api/journeys/public${path}`);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? body?.error ?? `${fallback} (${response.status})`);
  }
  return response.json() as Promise<T>;
};

const normalizeJourney = (row: JourneySummary): JourneySummary => ({
  ...row,
  categories: row.categories ?? [],
  totalPublishedParts: Number(row.totalPublishedParts ?? 0),
});

export const JourneysService = {
  fetchCategories: async (): Promise<JourneyCategory[]> => {
    const body = await getJson<{ categories?: JourneyCategory[] }>('/categories', 'Failed to load categories');
    return [...(body.categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  fetchJourneys: async ({ page = 1, limit = 6, category }: JourneyListQuery = {}): Promise<JourneyPage> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    const body = await getJson<{ journeys?: JourneySummary[]; pagination?: PaginationBody }>(
      `/${CHURCH_ID}?${params.toString()}`,
      'Failed to load sermons',
    );
    return {
      journeys: (body.journeys ?? []).map(normalizeJourney),
      page: body.pagination?.page ?? page,
      totalPages: Math.max(1, body.pagination?.totalPages ?? 1),
      total: body.pagination?.total ?? 0,
    };
  },

  searchJourneys: async (query: string): Promise<JourneySummary[]> => {
    const params = new URLSearchParams({ q: query });
    const body = await getJson<{ journeys?: JourneySummary[] }>(
      `/${CHURCH_ID}/search?${params.toString()}`,
      'Failed to search sermons',
    );
    return (body.journeys ?? []).map(normalizeJourney);
  },

  fetchJourneyDetail: async (journeyId: string): Promise<JourneyDetail> => {
    const body = await getJson<{ journey: JourneySummary; parts?: JourneyPart[] }>(
      `/${CHURCH_ID}/${journeyId}`,
      'Failed to load this series',
    );
    return {
      journey: normalizeJourney(body.journey),
      parts: [...(body.parts ?? [])].sort((a, b) => a.partOrder - b.partOrder),
    };
  },
};
