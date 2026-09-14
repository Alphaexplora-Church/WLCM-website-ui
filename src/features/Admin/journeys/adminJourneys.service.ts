// ─── Admin Journeys: Service (Model) ────────────────────────────────────────
// Reading the list is live against /api/journeys/admin. The write paths below
// are still localStorage and are replaced by SCRUM-200, 202 and 203.

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
        await delay();
        const journeys = readAll();
        const idx = journeys.findIndex(j => j.id === id);
        if (idx === -1) throw new Error('Journey not found');
        const updated: Journey = {
            ...journeys[idx],
            title: form.title,
            description: form.description,
            status: form.status,
            parts: partsFromForm(parts),
            updatedAt: nowIso(),
        };
        journeys[idx] = updated;
        writeAll(journeys);
        return updated;
    },

    deleteJourney: async (id: string): Promise<void> => {
        await delay();
        writeAll(readAll().filter(j => j.id !== id));
    },

    setJourneyStatus: async (id: string, status: JourneyStatus): Promise<Journey> => {
        await delay();
        const journeys = readAll();
        const idx = journeys.findIndex(j => j.id === id);
        if (idx === -1) throw new Error('Journey not found');
        journeys[idx] = { ...journeys[idx], status, updatedAt: nowIso() };
        writeAll(journeys);
        return journeys[idx];
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
