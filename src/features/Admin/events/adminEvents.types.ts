// ─── Admin Events: Types (Model) ────────────────────────────────────────────

export type ContentTab = 'event' | 'announcement';

export type RecurrenceFrequencyOption = '' | 'weekly' | 'monthly';

export interface EventFormData {
    title: string;
    description: string;
    location: string;
    category_content: string;
    start_date_date: string;
    start_date_time: string;
    end_date_date: string;
    end_date_time: string;
    google_form_url: string;
    recurrence_frequency: RecurrenceFrequencyOption;
    recurrence_interval: number;
    recurrence_until: string;
    image?: File | null;
}

export const EMPTY_FORM: EventFormData = {
    title: '',
    description: '',
    location: '',
    category_content: '',
    start_date_date: '',
    start_date_time: '',
    end_date_date: '',
    end_date_time: '',
    google_form_url: '',
    recurrence_frequency: '',
    recurrence_interval: 1,
    recurrence_until: '',
    image: null,
};
