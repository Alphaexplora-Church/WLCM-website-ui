// ─── Admin Journeys: Service (Model) ────────────────────────────────────────
// Reading, editing and lifecycle changes run against /api/journeys/admin.
// Creating a journey and persisting Parts are still local and land in
// SCRUM-200 and SCRUM-202.

import type { CategoryOption, Journey, JourneyContentType, JourneyFormData, JourneyQuery, JourneyStatus, JourneyPart, PartFormData } from './adminJourneys.types';

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
    summary: string | null;
    contentType: JourneyContentType | null;
    categories: string[] | null;
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
    apiStatus: row.status,
    order: row.partOrder,
});

let categoryCatalog: CategoryOption[] | null = null;

const fetchCategoryCatalog = async (): Promise<CategoryOption[]> => {
    if (categoryCatalog) return categoryCatalog;

    const response = await fetch(`${API_BASE}/api/journeys/public/categories`);
    if (!response.ok) throw new Error(`Failed to load categories (${response.status})`);

    const body = await response.json() as { categories: CategoryOption[] };
    categoryCatalog = [...(body.categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder);
    return categoryCatalog;
};

const getCachedCategories = (): CategoryOption[] => categoryCatalog ?? [];

const toCategoryIds = async (names: string[]): Promise<string[]> => {
    const catalog = await fetchCategoryCatalog();
    const idByName = new Map(catalog.map(option => [option.name.toLowerCase(), option.categoryId]));

    return names.map(name => {
        const id = idByName.get(name.toLowerCase());
        if (!id) throw new Error(`"${name}" is not a category in the catalog.`);
        return id;
    });
};

const journeyMetadataBody = async (form: JourneyFormData) => ({
    title: form.title.trim(),
    description: form.description.trim(),
    summary: form.summary.trim() || null,
    content_type: form.contentType,
    category_ids: await toCategoryIds(form.categories),
});

const mediaTypeFor = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/youtube\.com|youtu\.be/i.test(trimmed)) return 'youtube';
    if (/vimeo\.com/i.test(trimmed)) return 'vimeo';
    return null;
};

const partContentBody = (part: PartFormData) => ({
    title: part.title.trim(),
    media_url: part.videoUrl.trim() || null,
    media_type: mediaTypeFor(part.videoUrl),
    reading_text: part.textContent.trim() || null,
});

const hasContent = (part: PartFormData) =>
    Boolean(part.videoUrl.trim() || part.textContent.trim());

const sameContent = (staged: PartFormData, server: JourneyPart) =>
    staged.title.trim() === server.title
    && staged.videoUrl.trim() === server.videoUrl
    && staged.textContent.trim() === server.textContent;

const send = async (url: string, init: RequestInit, fallback: string) => {
    const response = await fetch(url, { ...init, headers: authHeaders() });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `${fallback} (${response.status})`);
    }
    return response;
};

const syncParts = async (
    journeyId: string,
    staged: PartFormData[],
    serverParts: JourneyPart[],
): Promise<string[]> => {
    const serverById = new Map(serverParts.map(part => [part.id, part]));
    const orderedIds: string[] = [];

    for (const part of staged) {
        const before = serverById.get(part.id);

        if (!before) {
            const created = await send(
                `${API_BASE}/api/journeys/admin/${journeyId}/parts`,
                { method: 'POST', body: JSON.stringify({ title: part.title.trim() }) },
                `Failed to add "${part.title}"`,
            );
            const { partId } = await created.json() as { partId: string };
            orderedIds.push(partId);

            if (hasContent(part)) {
                await send(
                    `${API_BASE}/api/journeys/admin/${journeyId}/parts/${partId}`,
                    { method: 'PUT', body: JSON.stringify(partContentBody(part)) },
                    `Failed to save "${part.title}"`,
                );
            }

            if (part.status === 'archived') {
                await send(
                    `${API_BASE}/api/journeys/admin/${journeyId}/parts/${partId}/archive`,
                    { method: 'PATCH' },
                    `Failed to archive "${part.title}"`,
                );
            } else if (hasContent(part)) {
                await send(
                    `${API_BASE}/api/journeys/admin/${journeyId}/parts/${partId}/publish`,
                    { method: 'PATCH', body: JSON.stringify({ status: 'published' }) },
                    `Failed to publish "${part.title}"`,
                );
            }

            continue;
        }

        orderedIds.push(part.id);

        if (!sameContent(part, before)) {
            await send(
                `${API_BASE}/api/journeys/admin/${journeyId}/parts/${part.id}`,
                { method: 'PUT', body: JSON.stringify(partContentBody(part)) },
                `Failed to save "${part.title}"`,
            );
        }

        const wantArchived = part.status === 'archived';
        const isArchived = before.apiStatus === 'archived';

        if (wantArchived && !isArchived) {
            await send(
                `${API_BASE}/api/journeys/admin/${journeyId}/parts/${part.id}/archive`,
                { method: 'PATCH' },
                `Failed to archive "${part.title}"`,
            );
        } else if (!wantArchived && before.apiStatus !== 'published' && hasContent(part)) {
            await send(
                `${API_BASE}/api/journeys/admin/${journeyId}/parts/${part.id}/publish`,
                { method: 'PATCH', body: JSON.stringify({ status: 'published' }) },
                `Failed to publish "${part.title}"`,
            );
        }
    }

    return orderedIds;
};

const toJourney = (row: ApiJourneyRow): Journey => ({
    id: row.journeyId,
    title: row.title,
    description: row.description ?? '',
    summary: row.summary ?? '',
    contentType: row.contentType ?? 'general',
    categories: row.categories ?? [],
    status: row.status,
    parts: [],
    publishedParts: row.totalPublishedParts ?? 0,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
});

export const AdminJourneysService = {
    fetchCategories: fetchCategoryCatalog,
    getCachedCategories,

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
        const created = await send(`${API_BASE}/api/journeys/admin`, {
            method: 'POST',
            body: JSON.stringify(await journeyMetadataBody(form)),
        }, 'Failed to create the journey');

        const { journeyId } = await created.json() as { journeyId: string };

        const orderedIds = await syncParts(journeyId, parts, []);

        if (orderedIds.length > 1) {
            await send(`${API_BASE}/api/journeys/admin/${journeyId}/parts/reorder`, {
                method: 'PATCH',
                body: JSON.stringify({ orderedPartIds: orderedIds }),
            }, 'Failed to save the part order');
        }

        if (form.status === 'published') {
            await send(`${API_BASE}/api/journeys/admin/${journeyId}/publish`, { method: 'PATCH' },
                'Failed to publish the journey');
        }

        return AdminJourneysService.fetchJourneyDetail(journeyId);
    },

    updateJourney: async (id: string, form: JourneyFormData, parts: PartFormData[]): Promise<Journey> => {
        await send(`${API_BASE}/api/journeys/admin/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(await journeyMetadataBody(form)),
        }, 'Failed to save the journey');

        const before = await AdminJourneysService.fetchJourneyDetail(id);
        const orderedIds = await syncParts(id, parts, before.parts);

        const serverOrder = before.parts.map(part => part.id).join(',');
        if (orderedIds.join(',') !== serverOrder && orderedIds.length >= before.parts.length) {
            await send(`${API_BASE}/api/journeys/admin/${id}/parts/reorder`, {
                method: 'PATCH',
                body: JSON.stringify({ orderedPartIds: orderedIds }),
            }, 'Failed to save the new part order');
        }

        if (form.status === 'published' && before.status !== 'published') {
            await send(`${API_BASE}/api/journeys/admin/${id}/publish`, { method: 'PATCH' },
                'Failed to publish the journey');
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
};
