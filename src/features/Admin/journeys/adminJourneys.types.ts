// ─── Admin Journeys: Types (Model) ──────────────────────────────────────────

export type JourneyStatus = 'draft' | 'published' | 'archived';
export type JourneyContentType = 'sunday_service' | 'devotional' | 'bible_study' | 'general';

export const CONTENT_TYPE_OPTIONS: { value: JourneyContentType; label: string }[] = [
    { value: 'sunday_service', label: 'Sermon Series' },
    { value: 'bible_study', label: 'Bible Study' },
    { value: 'devotional', label: 'Devotional' },
    { value: 'general', label: 'Discipleship Course' },
];

export interface CategoryOption {
    categoryId: string;
    name: string;
    sortOrder: number;
}
export type PartStatus = 'active' | 'archived';

export interface JourneyPart {
    id: string;
    title: string;
    textContent: string;
    videoUrl: string;
    status: PartStatus;
    apiStatus?: 'draft' | 'published' | 'archived';
    order: number;
}

export interface Journey {
    id: string;
    title: string;
    description: string;
    summary: string;
    contentType: JourneyContentType;
    categories: string[];
    status: JourneyStatus;
    parts: JourneyPart[];
    publishedParts: number;
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface JourneyQuery {
    search?: string;
    status?: JourneyStatus;
}

export interface JourneyFormData {
    title: string;
    description: string;
    summary: string;
    contentType: JourneyContentType;
    categories: string[];
    status: JourneyStatus;
}

export interface PartFormData {
    id: string;
    title: string;
    textContent: string;
    videoUrl: string;
    status: PartStatus;
}

export const EMPTY_JOURNEY_FORM: JourneyFormData = {
    title: '',
    description: '',
    summary: '',
    contentType: 'general',
    categories: [],
    status: 'draft',
};

export const makePartId = (): string =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID()
        : `part_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const EMPTY_PART_FORM = (): PartFormData => ({
    id: makePartId(),
    title: '',
    textContent: '',
    videoUrl: '',
    status: 'active',
});
