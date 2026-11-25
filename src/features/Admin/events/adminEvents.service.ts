// ─── Admin Events: Service (Model) ──────────────────────────────────────────
import type { ChurchEvent, Announcement } from '../../Experience/events/events.types';
import type { EventFormData } from './adminEvents.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** Retrieves the stored JWT and builds the Authorization header. */
const getAuthHeaders = (isFormData: boolean = false): HeadersInit => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found. Please log in.');

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};

const buildFormData = (data: EventFormData, type: string, isUpdate: boolean = false): FormData => {
    const formData = new FormData();
    if (!isUpdate) {
        formData.append('type_content', type);
    }
    formData.append('title', data.title);

    if (data.description || isUpdate) formData.append('description', data.description ?? '');
    if (data.location || isUpdate) formData.append('location', data.location ?? '');
    if (data.category_content || isUpdate) formData.append('category_content', data.category_content ?? '');

    if (data.start_date_date) {
        const time = data.start_date_time || '00:00';
        formData.append('start_date', `${data.start_date_date}T${time}:00`);
    }

    if (data.end_date_date) {
        const time = data.end_date_time || '00:00';
        formData.append('end_date', `${data.end_date_date}T${time}:00`);
    }

    if (type === 'event') {
        const trimmedFormUrl = (data.google_form_url ?? '').trim();
        if (trimmedFormUrl || isUpdate) {
            formData.append('google_form_url', trimmedFormUrl);
        }

        if (data.recurrence_frequency === 'weekly' || data.recurrence_frequency === 'monthly') {
            formData.append('recurrence_frequency', data.recurrence_frequency);
            formData.append('recurrence_interval', String(data.recurrence_interval || 1));
            if (data.recurrence_until) {
                formData.append('recurrence_until', data.recurrence_until);
            } else if (isUpdate) {
                formData.append('recurrence_until', '');
            }
        } else if (isUpdate) {
            // Clearing recurrence back to a one-off event: events-api.md specifies
            // sending recurrence_frequency='' without recurrence_interval or recurrence_until.
            formData.append('recurrence_frequency', '');
        }
    }

    if (data.image && !isUpdate) {
        formData.append('image', data.image);
    }

    return formData;
};

const parseTotalFromResponse = <T>(json: any): { items: T[]; total: number } => {
    const items = (json.data ?? []) as T[];
    const total = json.total ?? json.meta?.total ?? json.pagination?.total ?? json.meta?.pagination?.total ?? items.length;
    return { items, total };
};

export const AdminEventsService = {
    /**
     * Fetches all events from the admin endpoint (requires authentication).
     */
    fetchEvents: async (page: number = 1, limit: number = 10): Promise<{ items: ChurchEvent[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/events?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch events');
        const json = await response.json();
        return parseTotalFromResponse<ChurchEvent>(json);
    },

    /**
     * Fetches all announcements from the admin endpoint (requires authentication).
     */
    fetchAnnouncements: async (page: number = 1, limit: number = 10): Promise<{ items: Announcement[]; total: number }> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/announcements?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch announcements');
        const json = await response.json();
        return parseTotalFromResponse<Announcement>(json);
    },

    /**
     * Creates a new event (requires authentication).
     */
    createEvent: async (data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type);
        const response = await fetch(`${API_BASE}/api/contents/admin`, {
            method: 'POST',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to create event: ${errorBody}`);
        }
    },

    /**
     * Updates an existing event by ID (requires authentication).
     */
    updateEvent: async (id: number, data: EventFormData, type: string = 'event'): Promise<void> => {
        const formData = buildFormData(data, type, true);
        const response = await fetch(`${API_BASE}/api/contents/admin/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(true),
            body: formData,
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to update event: ${errorBody}`);
        }
    },

    /**
     * Deletes an event by ID (requires authentication).
     */
    deleteEvent: async (id: number): Promise<void> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete event');
    },

    /**
     * Fetches DB-level KPI counts for both Events and Announcements dashboards.
     * Returns accurate totals regardless of the current pagination page.
     */
    fetchStats: async (): Promise<{
        events: { upcomingMonth: number; thisWeek: number; completedMonth: number };
        announcements: { activeLive: number; postedThisMonth: number; activeCategories: number };
    }> => {
        const response = await fetch(`${API_BASE}/api/contents/admin/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        const json = await response.json();
        return json.data;
    },
};
