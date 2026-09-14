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
    const [allJourneys, setAllJourneys] = useState<Journey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dateSort, setDateSort] = useState<DateSort>('updated_desc');

    const [showBuilder, setShowBuilder] = useState(false);
    const [editTarget, setEditTarget] = useState<Journey | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const load = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const items = await AdminJourneysService.fetchJourneys({
                search: debouncedSearch || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            setJourneys(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not load journeys.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAll = async () => {
        try {
            setAllJourneys(await AdminJourneysService.fetchJourneys());
        } catch {
        }
    };

    useEffect(() => {
        loadAll();
        AdminJourneysService.fetchCategories().catch(() => undefined);
    }, []);

    useEffect(() => { load(); }, [debouncedSearch, statusFilter]);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── Derived: filtered + sorted list ─────────────────────────────────────
    const filtered = journeys
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
        all: allJourneys.length,
        draft: allJourneys.filter(j => j.status === 'draft').length,
        published: allJourneys.filter(j => j.status === 'published').length,
        archived: allJourneys.filter(j => j.status === 'archived').length,
    };

    // ── Builder handlers ─────────────────────────────────────────────────────
    const openCreateBuilder = () => { setEditTarget(null); setShowBuilder(true); };

    const openEditBuilder = async (journey: Journey) => {
        setEditTarget(journey);
        setShowBuilder(true);
        setIsLoadingDetail(true);
        try {
            setEditTarget(await AdminJourneysService.fetchJourneyDetail(journey.id));
        } catch {
            showToast('Could not load this journey.', 'error');
        } finally {
            setIsLoadingDetail(false);
        }
    };

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
    const publishJourney = async (journey: Journey) => {
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, 'published');
            showToast(`"${journey.title}" published.`);
            await load();
            await loadAll();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to publish.', 'error');
        }
    };

    const archiveJourney = async (journey: Journey) => {
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, 'archived');
            showToast(`"${journey.title}" archived.`);
            await load();
            await loadAll();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to archive.', 'error');
        }
    };

    const restoreJourney = async (journey: Journey) => {
        try {
            await AdminJourneysService.setJourneyStatus(journey.id, 'published');
            showToast(`"${journey.title}" is live again.`);
            await load();
            await loadAll();
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to restore.', 'error');
        }
    };

    return {
        journeys, filtered, counts, isLoading, error, retry: load,
        search, setSearch, statusFilter, setStatusFilter, dateSort, setDateSort,
        showBuilder, editTarget, isLoadingDetail, openCreateBuilder, openEditBuilder, closeBuilder, handleSave,
        publishJourney, archiveJourney, restoreJourney,
        toast,
    };
}
