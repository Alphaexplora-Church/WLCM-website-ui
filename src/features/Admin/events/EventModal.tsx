// ─── Admin Events: EventModal (View) ────────────────────────────────────────
import { useEffect, useState } from 'react';
import type { EventFormData, RecurrenceFrequencyOption } from './adminEvents.types';
import { EMPTY_FORM } from './adminEvents.types';

interface EventModalProps {
    open: boolean;
    title: string;
    isAnnouncement?: boolean;
    initial?: EventFormData;
    onClose: () => void;
    onSave: (data: EventFormData) => Promise<void>;
}

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

function getOrdinal(n: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

function parseLocalDate(yyyyMmDd: string): Date | null {
    if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null;
    const [y, m, d] = yyyyMmDd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatLocalDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatReadableDate(yyyyMmDd: string): string {
    const d = parseLocalDate(yyyyMmDd);
    if (!d) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatReadableTime(hhMm: string): string {
    if (!hhMm || !/^\d{1,2}:\d{2}$/.test(hhMm)) return '';
    const [hStr, mStr] = hhMm.split(':');
    let hours = parseInt(hStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${mStr} ${ampm}`;
}

/**
 * Finds the soonest calendar date (starting today) that falls on `targetWeekday` (0 = Sun .. 6 = Sat).
 */
function getNextDateForWeekday(targetWeekday: number): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = (targetWeekday - today.getDay() + 7) % 7;
    const next = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    return formatLocalDate(next);
}

/**
 * Finds the soonest valid calendar date (starting this month or next) whose day-of-month === `targetDay` (1..31).
 * Months without that day (e.g. Feb 30/31) are skipped, matching backend recurrence.js.
 */
function getNextDateForMonthDay(targetDay: number): string {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    if (targetDay < now.getDate()) {
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
    }

    for (let i = 0; i < 24; i += 1) {
        const candidate = new Date(year, month, targetDay);
        if (candidate.getDate() === targetDay) {
            return formatLocalDate(candidate);
        }
        month += 1;
        if (month > 11) {
            month = 0;
            year += 1;
        }
    }

    return formatLocalDate(now);
}

/**
 * Validates a Google Forms link according to events-api.md:
 * - Optional (empty is allowed)
 * - Must use https://
 * - Host must be docs.google.com with path starting /forms/ OR forms.gle
 * - Max 2048 chars
 */
function validateGoogleFormUrl(raw: string): { valid: boolean; empty: boolean; message: string } {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { valid: true, empty: true, message: '' };
    }
    if (trimmed.length > 2048) {
        return { valid: false, empty: false, message: 'Google Form link must be at most 2048 characters.' };
    }
    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'https:') {
            return { valid: false, empty: false, message: 'Google Form link must start with https://' };
        }
        const isDocsForm = url.hostname === 'docs.google.com' && url.pathname.startsWith('/forms/');
        const isShortForm = url.hostname === 'forms.gle' && url.pathname.length > 1;
        if (!isDocsForm && !isShortForm) {
            return {
                valid: false,
                empty: false,
                message: 'Must be a Google Forms link (docs.google.com/forms/... or forms.gle/...)',
            };
        }
        return { valid: true, empty: false, message: 'Valid Google Forms link' };
    } catch {
        return { valid: false, empty: false, message: 'Please enter a valid https:// Google Forms URL.' };
    }
}

export function EventModal({ open, title, isAnnouncement, initial, onClose, onSave }: EventModalProps) {
    const [form, setForm] = useState<EventFormData>(initial ?? EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        setForm(initial ?? EMPTY_FORM);
        setSaveError(null);
        setIsSaving(false);
    }, [initial, open]);

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: value };
            if (prev.recurrence_frequency && name === 'start_date_date') {
                next.end_date_date = value;
            }
            return next;
        });
    };

    const handleScheduleModeChange = (frequency: RecurrenceFrequencyOption) => {
        setForm(prev => {
            if (frequency === '') {
                return {
                    ...prev,
                    recurrence_frequency: '',
                    recurrence_interval: 1,
                    recurrence_until: '',
                };
            }

            const existingDate = parseLocalDate(prev.start_date_date);
            let anchorDate = prev.start_date_date;

            if (frequency === 'weekly') {
                const targetWeekday = existingDate ? existingDate.getDay() : 1; // Default Monday
                if (!existingDate) {
                    anchorDate = getNextDateForWeekday(targetWeekday);
                }
            } else if (frequency === 'monthly') {
                const targetDay = existingDate ? existingDate.getDate() : new Date().getDate();
                if (!existingDate) {
                    anchorDate = getNextDateForMonthDay(targetDay);
                }
            }

            return {
                ...prev,
                recurrence_frequency: frequency,
                recurrence_interval: prev.recurrence_interval || 1,
                start_date_date: anchorDate,
                end_date_date: anchorDate,
                start_date_time: prev.start_date_time || '09:00',
                end_date_time: prev.end_date_time || '11:00',
            };
        });
    };

    const handleWeekdaySelect = (weekdayIndex: number) => {
        const nextDate = getNextDateForWeekday(weekdayIndex);
        setForm(prev => ({
            ...prev,
            start_date_date: nextDate,
            end_date_date: nextDate,
        }));
    };

    const handleMonthDaySelect = (dayOfMonth: number) => {
        const nextDate = getNextDateForMonthDay(dayOfMonth);
        setForm(prev => ({
            ...prev,
            start_date_date: nextDate,
            end_date_date: nextDate,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setForm(prev => ({ ...prev, image: e.target.files![0] }));
        }
    };

    const formUrlCheck = validateGoogleFormUrl(form.google_form_url);

    const handleSubmit = async () => {
        if (isSaving) return;
        setSaveError(null);

        if (!isAnnouncement && !formUrlCheck.valid) {
            setSaveError(formUrlCheck.message);
            return;
        }

        setIsSaving(true);
        try {
            await onSave(form);
        } catch (err: any) {
            const raw = err?.message ?? 'An unexpected error occurred.';
            let message = raw;
            try {
                const parsed = JSON.parse(raw.replace(/^Failed to (create|update) event: /, ''));
                if (parsed?.error) {
                    if (parsed.error.details && Array.isArray(parsed.error.details)) {
                        message = parsed.error.details.map((d: any) => d.message).join(', ');
                    } else if (typeof parsed.error.message === 'string') {
                        message = parsed.error.message;
                    } else if (typeof parsed.error === 'string') {
                        message = parsed.error;
                    } else {
                        message = raw;
                    }
                } else if (typeof parsed?.message === 'string') {
                    message = parsed.message;
                }
            } catch {
                message = raw.replace(/^Failed to (create|update) event: /, '');
            }
            setSaveError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const parsedStart = parseLocalDate(form.start_date_date);
    const activeWeekday = parsedStart ? parsedStart.getDay() : 1;
    const activeMonthDay = parsedStart ? parsedStart.getDate() : 1;

    const timeRangeLabel = (() => {
        const st = formatReadableTime(form.start_date_time);
        const et = formatReadableTime(form.end_date_time);
        if (st && et) return `${st} – ${et}`;
        return st || et || '';
    })();

    const scheduleSummary = (() => {
        if (form.recurrence_frequency === 'weekly') {
            const dayName = WEEKDAYS_FULL[activeWeekday];
            const untilStr = formatReadableDate(form.recurrence_until);
            return `Repeats every ${dayName}${timeRangeLabel ? ` · ${timeRangeLabel}` : ''}${untilStr ? ` (until ${untilStr})` : ''}`;
        }
        if (form.recurrence_frequency === 'monthly') {
            const ordDay = getOrdinal(activeMonthDay);
            const untilStr = formatReadableDate(form.recurrence_until);
            return `Repeats on the ${ordDay} of every month${timeRangeLabel ? ` · ${timeRangeLabel}` : ''}${untilStr ? ` (until ${untilStr})` : ''}`;
        }
        const startStr = formatReadableDate(form.start_date_date);
        const endStr = formatReadableDate(form.end_date_date);
        if (!startStr) return 'Select the start and end date & time for this one-time event.';
        if (endStr && endStr !== startStr) {
            return `One-time event · ${startStr} → ${endStr}${timeRangeLabel ? ` (${timeRangeLabel})` : ''}`;
        }
        return `One-time event · ${startStr}${timeRangeLabel ? ` (${timeRangeLabel})` : ''}`;
    })();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4">
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full ${
                    isAnnouncement ? 'max-w-lg' : 'max-w-2xl'
                } overflow-hidden max-h-[94vh] flex flex-col`}
            >
                {/* Header */}
                <div className="bg-midnight-teal px-5 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <h2 className="font-serif text-xl text-soft-linen">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        aria-label="Close modal"
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-soft-linen/60 hover:text-soft-linen hover:bg-soft-linen/10 text-2xl leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ×
                    </button>
                </div>

                {/* Body — Option 1B Paired Horizontal Rows on Desktop (No Scroll), Stacked on Mobile */}
                <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
                    {isAnnouncement ? (
                        <>
                            {/* Announcement Layout */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Title</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Church-Wide Fasting Week"
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Brief description of the announcement..."
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Category</label>
                                <input
                                    name="category_content"
                                    value={form.category_content}
                                    onChange={handleChange}
                                    placeholder="e.g. Worship, Youth, Prayer"
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-midnight-teal/10 file:text-midnight-teal hover:file:bg-midnight-teal/20"
                                />
                                {form.image && (
                                    <p className="mt-1 text-xs text-gray-400 truncate">Selected: {form.image.name}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Row 1: Title + Location + Category */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-6">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Title</label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Sunday Worship Service"
                                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 sm:col-span-6 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Location</label>
                                        <input
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Main Sanctuary"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Category</label>
                                        <input
                                            name="category_content"
                                            value={form.category_content}
                                            onChange={handleChange}
                                            placeholder="e.g. Worship, Youth"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Brief description of the event..."
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 resize-none"
                                />
                            </div>

                            {/* Row 3: Unified Event Schedule (One-Time | Weekly | Monthly) */}
                            <div className="rounded-xl border border-gray-200 bg-soft-linen/35 p-3.5 space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal">
                                        Event Schedule
                                    </label>
                                    <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                        {(
                                            [
                                                { value: '', label: 'One-Time' },
                                                { value: 'weekly', label: 'Weekly' },
                                                { value: 'monthly', label: 'Monthly' },
                                            ] as { value: RecurrenceFrequencyOption; label: string }[]
                                        ).map(option => {
                                            const isActive = form.recurrence_frequency === option.value;
                                            return (
                                                <button
                                                    key={option.label}
                                                    type="button"
                                                    onClick={() => handleScheduleModeChange(option.value)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-midnight-teal text-soft-linen shadow-sm'
                                                            : 'text-gray-400 hover:text-midnight-teal'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Mode A: One-Time Event (Start & End paired side-by-side on desktop) */}
                                {form.recurrence_frequency === '' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                Start Date &amp; Time
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="date"
                                                    name="start_date_date"
                                                    value={form.start_date_date}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                                <input
                                                    type="time"
                                                    name="start_date_time"
                                                    value={form.start_date_time}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                End Date &amp; Time
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="date"
                                                    name="end_date_date"
                                                    value={form.end_date_date}
                                                    onChange={handleChange}
                                                    min={form.start_date_date || undefined}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                                <input
                                                    type="time"
                                                    name="end_date_time"
                                                    value={form.end_date_time}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mode B: Weekly Recurring (e.g. Every Monday) */}
                                {form.recurrence_frequency === 'weekly' && (
                                    <div className="space-y-2.5">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                Day of the Week
                                            </label>
                                            <div className="grid grid-cols-7 gap-1.5">
                                                {WEEKDAYS_SHORT.map((dayLabel, idx) => {
                                                    const isSelected = activeWeekday === idx;
                                                    return (
                                                        <button
                                                            key={dayLabel}
                                                            type="button"
                                                            onClick={() => handleWeekdaySelect(idx)}
                                                            className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                                                                isSelected
                                                                    ? 'bg-midnight-teal text-soft-linen shadow-sm'
                                                                    : 'bg-white text-midnight-teal/70 border border-gray-200 hover:border-midnight-teal/40 hover:text-midnight-teal'
                                                            }`}
                                                        >
                                                            {dayLabel}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                    Start Time
                                                </label>
                                                <input
                                                    type="time"
                                                    name="start_date_time"
                                                    value={form.start_date_time}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                    End Time
                                                </label>
                                                <input
                                                    type="time"
                                                    name="end_date_time"
                                                    value={form.end_date_time}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                    Ends On <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="recurrence_until"
                                                    value={form.recurrence_until}
                                                    onChange={handleChange}
                                                    min={form.start_date_date || undefined}
                                                    className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Mode C: Monthly Recurring (Day of Month options: "1st".."31st" without "Every") */}
                                {form.recurrence_frequency === 'monthly' && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                Day of Month
                                            </label>
                                            <select
                                                value={activeMonthDay}
                                                onChange={e => handleMonthDaySelect(Number(e.target.value))}
                                                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm font-semibold text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                            >
                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => (
                                                    <option key={dayNum} value={dayNum}>
                                                        {getOrdinal(dayNum)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                Start Time
                                            </label>
                                            <input
                                                type="time"
                                                name="start_date_time"
                                                value={form.start_date_time}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                End Time
                                            </label>
                                            <input
                                                type="time"
                                                name="end_date_time"
                                                value={form.end_date_time}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal/80 mb-1">
                                                Ends On <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                            </label>
                                            <input
                                                type="date"
                                                name="recurrence_until"
                                                value={form.recurrence_until}
                                                onChange={handleChange}
                                                min={form.start_date_date || undefined}
                                                className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Live Summary Pill */}
                                <div className="flex items-center gap-2 bg-white border border-midnight-teal/15 rounded-lg px-3 py-1.5 text-xs font-semibold text-midnight-teal">
                                    <span className="w-2 h-2 rounded-full bg-harvest-orange flex-shrink-0" />
                                    <span>{scheduleSummary}</span>
                                </div>
                            </div>

                            {/* Row 4: Google Forms Link + Image Side-by-Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal">
                                            Google Forms Link <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                                        </label>
                                        {!formUrlCheck.empty && (
                                            <span className={`text-xs font-bold ${formUrlCheck.valid ? 'text-deep-teal' : 'text-harvest-orange'}`}>
                                                {formUrlCheck.valid ? 'Valid' : 'Invalid'}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="url"
                                        name="google_form_url"
                                        value={form.google_form_url}
                                        onChange={handleChange}
                                        placeholder="https://forms.gle/... or https://docs.google.com/forms/..."
                                        className={`w-full border rounded-lg px-3.5 py-2 text-sm text-black focus:outline-none focus:ring-2 ${
                                            !formUrlCheck.empty && !formUrlCheck.valid
                                                ? 'border-harvest-orange focus:ring-harvest-orange/40'
                                                : 'border-gray-200 focus:ring-midnight-teal/40'
                                        }`}
                                    />
                                    {!formUrlCheck.empty && !formUrlCheck.valid && (
                                        <p className="mt-1 text-xs text-harvest-orange font-medium">
                                            {formUrlCheck.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 file:mr-3 file:py-1 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-midnight-teal/10 file:text-midnight-teal hover:file:bg-midnight-teal/20"
                                    />
                                    {form.image && (
                                        <p className="mt-1 text-xs text-gray-400 truncate">Selected: {form.image.name}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Error block */}
                    {saveError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-600">{saveError}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-3.5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="px-5 py-2 rounded-lg text-sm font-bold bg-midnight-teal text-soft-linen hover:bg-midnight-teal/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                    >
                        {isSaving ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4 text-soft-linen"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                <span>Saving…</span>
                            </>
                        ) : (
                            <span>{initial ? 'Save Changes' : 'Create Event'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
