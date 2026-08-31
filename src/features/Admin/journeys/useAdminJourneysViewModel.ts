// ─── Admin Journeys: List ViewModel ─────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Journey, JourneyStatus, JourneyFormData, PartFormData } from './adminJourneys.types';
import { AdminJourneysService } from './adminJourneys.service';

export type StatusFilter = 'all' | JourneyStatus;
export type DateSort = 'updated_desc' | 'updated_asc' | 'created_desc' | 'created_asc';

export function useAdminJourneysViewModel() {
    const navigate = useNavigate();

    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dateSort, setDateSort] = useState<DateSort>('updated_desc');

    const [showBuilder, setShowBuilder] = useState(false);
    const [editTarget, setEditTarget] = useState<Journey | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Journey | null>(null);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await AdminJourneysService.fetchJourneys();
            setJourneys(items);
        } catch {
            setError('Could not load journeys.');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Derived: filtered + sorted list ─────────────────────────────────────
    const q = search.toLowerCase();
    const filtered = journeys
        .filter(j => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q))
        .filter(j => statusFilter === 'all' || j.status === statusFilter)
        .slice()
        .sort((a, b) => {
            switch (dateSort) {
                case 'updated_asc': return a.updatedAt.localeCompare(b.updatedAt);
                case 'created_desc': return b.createdAt.localeCompare(a.createdAt);
                case 'created_asc': return a.createdAt.localeCompare(b.createdAt);
                default: return b.updatedAt.localeCompare(a.updatedAt);
            }
        });

    const counts = {
        all: journeys.length,
        draft: journeys.filter(j => j.status === 'draft').length,
        published: journeys.filter(j => j.status === 'published').length,
        archived: journeys.filter(j => j.status === 'archived').length,
    };

    // ── Builder handlers ─────────────────────────────────────────────────────
    const openCreateBuilder = () => { setEditTarget(null); setShowBuilder(true); };
    const openEditBuilder = (journey: Journey) => { setEditTarget(journey); setShowBuilder(true); };
    const closeBuilder = () => { setShowBuilder(false); setEditTarget(null); };

    const handleSave = async (form: JourneyFormData, parts: PartFormData[]) => {
        if (editTarget) {
            await AdminJourneysService.updateJourney(editTarget.id, form, parts);
            showToast(`"${form.title}" updated.`);
        } else {
            await AdminJourneysService.createJourney(form, parts);
            showToast(`"${form.title}" created.`);
        }
        closeBuilder();
        await load();
    };

    // ── Lifecycle handlers ───────────────────────────────────────────────────
    const togglePublish = async (journey: Journey) => {
        const next: JourneyStatus = journey.status === 'published' ? 'draft' : 'published';
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, next);
            showToast(next === 'published' ? `"${journey.title}" published.` : `"${journey.title}" unpublished.`);
            await load();
        } catch {
            showToast('Failed to update status.', 'error');
        }
    };

    const archiveJourney = async (journey: Journey) => {
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, 'archived');
            showToast(`"${journey.title}" archived.`);
            await load();
        } catch {
            showToast('Failed to archive.', 'error');
        }
    };

    const restoreJourney = async (journey: Journey) => {
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, 'draft');
            showToast(`"${journey.title}" restored to draft.`);
            await load();
        } catch {
            showToast('Failed to restore.', 'error');
        }
    };

    const openDeleteModal = (journey: Journey) => setDeleteTarget(journey);
    const closeDeleteModal = () => setDeleteTarget(null);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await AdminJourneysService.deleteJourney(deleteTarget.id);
            showToast(`"${deleteTarget.title}" deleted.`);
            closeDeleteModal();
            await load();
        } catch {
            showToast('Failed to delete.', 'error');
        }
    };

    return {
        journeys, filtered, counts, isLoading, error, retry: load,
        search, setSearch, statusFilter, setStatusFilter, dateSort, setDateSort,
        showBuilder, editTarget, openCreateBuilder, openEditBuilder, closeBuilder, handleSave,
        deleteTarget, openDeleteModal, closeDeleteModal, handleDelete,
        togglePublish, archiveJourney, restoreJourney,
        toast,
    };
}
