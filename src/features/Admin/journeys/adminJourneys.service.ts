// ─── Admin Journeys: Service (Model) ────────────────────────────────────────
// Persists to localStorage so the Journey Builder works standalone against
// this UI-only project. Swap the body of each method for `fetch(...)` calls
// against a real `/api/journeys` endpoint when the backend is ready — the
// method signatures below already match the shape that would require.

import type { Journey, JourneyFormData, JourneyStatus, JourneyPart, PartFormData, PartStatus } from './adminJourneys.types';
import { makePartId } from './adminJourneys.types';

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
    fetchJourneys: async (): Promise<Journey[]> => {
        await delay();
        return readAll().slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
