// ─── Admin Journeys: Service (Model) ────────────────────────────────────────
// Reading, editing and lifecycle changes run against /api/journeys/admin.
// Creating a journey and persisting Parts are still local and land in
// SCRUM-200 and SCRUM-202.

import type { Journey, JourneyFormData, JourneyQuery, JourneyStatus, JourneyPart, PartFormData, PartStatus } from './adminJourneys.types';
import { makePartId } from './adminJourneys.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found. Please log in.');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

interface ApiJourneyRow {
    journeyId: string;
    title: string;
    description: string | null;
    status: JourneyStatus;
    totalPublishedParts: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiPartRow {
    partId: string;
    partOrder: number;
    title: string;
    mediaUrl: string | null;
    readingText: string | null;
    status: 'draft' | 'published' | 'archived';
}

const toPart = (row: ApiPartRow): JourneyPart => ({
    id: row.partId,
    title: row.title,
    textContent: row.readingText ?? '',
    videoUrl: row.mediaUrl ?? '',
    status: row.status === 'archived' ? 'archived' : 'active',
    order: row.partOrder,
});

const toJourney = (row: ApiJourneyRow): Journey => ({
    id: row.journeyId,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    parts: [],
    publishedParts: row.totalPublishedParts ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

const STORAGE_KEY = 'wlcm_admin_journeys';

const nowIso = () => new Date().toISOString();

const seedJourneys = (): Journey[] => {
    const t = nowIso();
    return [
        {
            id: makePartId(),
            title: 'Foundations of Faith',
            description: 'A four-part journey for new believers to build a solid foundation.',
            status: 'published',
            publishedParts: 2,
            createdAt: t,
            updatedAt: t,
            parts: [
                { id: makePartId(), title: 'Who Is God?', textContent: 'An introduction to the character of God.', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', status: 'active', order: 0 },
                { id: makePartId(), title: 'The Gift of Grace', textContent: 'Understanding salvation by grace through faith.', videoUrl: '', status: 'active', order: 1 },
            ],
        },
        {
            id: makePartId(),
            title: 'Purpose Driven Life',
            description: 'A short series exploring calling and purpose.',
            status: 'draft',
            publishedParts: 0,
            createdAt: t,
            updatedAt: t,
            parts: [
                { id: makePartId(), title: 'Made on Purpose', textContent: '', videoUrl: '', status: 'active', order: 0 },
            ],
        },
    ];
};

const readAll = (): Journey[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            const seeded = seedJourneys();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
            return seeded;
        }
        return JSON.parse(raw) as Journey[];
    } catch {
        return [];
    }
};

const writeAll = (journeys: Journey[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journeys));
};

const partsFromForm = (parts: PartFormData[]): JourneyPart[] =>
    parts.map((p, index) => ({
        id: p.id,
        title: p.title,
        textContent: p.textContent,
        videoUrl: p.videoUrl,
        status: p.status,
        order: index,
    }));

// Simulated network latency so loading states are visible in the UI.
const delay = (ms = 250) => new Promise(res => setTimeout(res, ms));

export const AdminJourneysService = {
    fetchJourneys: async (query: JourneyQuery = {}): Promise<Journey[]> => {
        const params = new URLSearchParams({ limit: '50' });
        if (query.search) params.set('search', query.search);
        if (query.status) params.set('status', query.status);

        const response = await fetch(`${API_BASE}/api/journeys/admin?${params.toString()}`, {
            headers: authHeaders(),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error ?? `Failed to load journeys (${response.status})`);
        }

        const body = await response.json() as { journeys: ApiJourneyRow[] };
        return (body.journeys ?? []).map(toJourney);
    },

    fetchJourneyDetail: async (id: string): Promise<Journey> => {
        const response = await fetch(`${API_BASE}/api/journeys/admin/${id}`, {
            headers: authHeaders(),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error ?? `Failed to load journey (${response.status})`);
        }

        const body = await response.json() as { journey: ApiJourneyRow; parts: ApiPartRow[] };

        return {
            ...toJourney(body.journey),
            parts: (body.parts ?? []).map(toPart).sort((a, b) => a.order - b.order),
        };
    },

    createJourney: async (form: JourneyFormData, parts: PartFormData[]): Promise<Journey> => {
        await delay();
        const journeys = readAll();
        const journey: Journey = {
            id: makePartId(),
            title: form.title,
            description: form.description,
            status: form.status,
            parts: partsFromForm(parts),
            publishedParts: 0,
            createdAt: nowIso(),
            updatedAt: nowIso(),
        };
        writeAll([journey, ...journeys]);
        return journey;
    },

    updateJourney: async (id: string, form: JourneyFormData, parts: PartFormData[]): Promise<Journey> => {
        void parts;

        const response = await fetch(`${API_BASE}/api/journeys/admin/${id}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({
                title: form.title.trim(),
                description: form.description.trim(),
            }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error ?? `Failed to save journey (${response.status})`);
        }

        return AdminJourneysService.fetchJourneyDetail(id);
    },

    setJourneyStatus: async (id: string, status: JourneyStatus): Promise<Journey> => {
        if (status === 'draft') {
            throw new Error('A journey cannot be moved back to draft. Archive it instead.');
        }

        const path = status === 'archived' ? 'archive' : 'publish';
        const response = await fetch(`${API_BASE}/api/journeys/admin/${id}/${path}`, {
            method: 'PATCH',
            headers: authHeaders(),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error ?? `Failed to update status (${response.status})`);
        }

        return AdminJourneysService.fetchJourneyDetail(id);
    },

    setPartStatus: async (journeyId: string, partId: string, status: PartStatus): Promise<Journey> => {
        await delay();
        const journeys = readAll();
        const idx = journeys.findIndex(j => j.id === journeyId);
        if (idx === -1) throw new Error('Journey not found');
        const parts = journeys[idx].parts.map(p => p.id === partId ? { ...p, status } : p);
        journeys[idx] = { ...journeys[idx], parts, updatedAt: nowIso() };
        writeAll(journeys);
        return journeys[idx];
    },
};
