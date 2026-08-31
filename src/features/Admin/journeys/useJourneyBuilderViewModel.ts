// ─── Journey Builder: ViewModel ──────────────────────────────────────────────
import { useEffect, useState } from 'react';
import type { Journey, JourneyFormData, PartFormData } from './adminJourneys.types';
import { EMPTY_JOURNEY_FORM, EMPTY_PART_FORM } from './adminJourneys.types';

function journeyToForm(journey: Journey | null): JourneyFormData {
    if (!journey) return EMPTY_JOURNEY_FORM;
    return { title: journey.title, description: journey.description, status: journey.status };
}

function journeyToParts(journey: Journey | null): PartFormData[] {
    if (!journey) return [];
    return journey.parts
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(p => ({ id: p.id, title: p.title, textContent: p.textContent, videoUrl: p.videoUrl, status: p.status }));
}

export function useJourneyBuilderViewModel(journey: Journey | null, open: boolean) {
    const [form, setForm] = useState<JourneyFormData>(journeyToForm(journey));
    const [parts, setParts] = useState<PartFormData[]>(journeyToParts(journey));
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    // Accordion: which part card is expanded for editing (compact by default).
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        setForm(journeyToForm(journey));
        setParts(journeyToParts(journey));
        setSaveError(null);
        setIsSaving(false);
        setExpandedId(null);
    }, [journey, open]);

    const setField = (field: keyof JourneyFormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // ── Parts CRUD ────────────────────────────────────────────────────────
    const addPart = () => {
        const part = EMPTY_PART_FORM();
        setParts(prev => [...prev, part]);
        setExpandedId(part.id);
    };

    const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

    const updatePart = (id: string, field: keyof PartFormData, value: string) => {
        setParts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const removePart = (id: string) => setParts(prev => prev.filter(p => p.id !== id));

    const togglePartArchive = (id: string) => {
        setParts(prev => prev.map(p => p.id === id
            ? { ...p, status: p.status === 'archived' ? 'active' : 'archived' }
            : p));
    };

    // ── Reordering: UP/DOWN buttons ──────────────────────────────────────
    const movePart = (index: number, direction: -1 | 1) => {
        setParts(prev => {
            const target = index + direction;
            if (target < 0 || target >= prev.length) return prev;
            const next = prev.slice();
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    // ── Reordering: Framer Motion Reorder.Group drag-and-drop ────────────
    // The dragged card follows the pointer; Reorder.Item's built-in layout
    // animation slides the other cards out of the way in real time.
    const reorderParts = (next: PartFormData[]) => setParts(next);

    // ── Validation ────────────────────────────────────────────────────────
    const isValid = form.title.trim().length > 0 && parts.every(p => p.title.trim().length > 0);

    const submit = async (onSave: (form: JourneyFormData, parts: PartFormData[]) => Promise<void>) => {
        if (isSaving) return;
        if (!isValid) {
            setSaveError('Journey title and every part title are required.');
            return;
        }
        setSaveError(null);
        setIsSaving(true);
        try {
            await onSave(form, parts);
        } catch (err: any) {
            setSaveError(err?.message ?? 'An unexpected error occurred.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        form, setField, parts, isSaving, saveError, isValid,
        expandedId, toggleExpand,
        addPart, updatePart, removePart, togglePartArchive, movePart, reorderParts,
        submit,
    };
}
