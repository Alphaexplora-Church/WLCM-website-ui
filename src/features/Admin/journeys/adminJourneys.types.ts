// ─── Admin Journeys: Types (Model) ──────────────────────────────────────────

export type JourneyStatus = 'draft' | 'published' | 'archived';
export type PartStatus = 'active' | 'archived';

export interface JourneyPart {
    id: string;
    title: string;
    textContent: string;
    videoUrl: string;
    status: PartStatus;
    order: number;
}

export interface Journey {
    id: string;
    title: string;
    description: string;
    status: JourneyStatus;
    parts: JourneyPart[];
    createdAt: string; // ISO
    updatedAt: string; // ISO
}

export interface JourneyFormData {
    title: string;
    description: string;
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
