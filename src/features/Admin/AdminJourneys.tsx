// ─── Admin Journeys: View ────────────────────────────────────────────────────
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';
import { useAdminJourneysViewModel } from './journeys/useAdminJourneysViewModel';
import type { StatusFilter, DateSort } from './journeys/useAdminJourneysViewModel';
import { JourneyBuilderModal } from './journeys/JourneyBuilderModal';
import { ConfirmDeleteJourneyModal } from './journeys/ConfirmDeleteJourneyModal';
import type { Journey, JourneyStatus } from './journeys/adminJourneys.types';

const STATUS_STYLES: Record<JourneyStatus, string> = {
    draft: 'bg-gray-100 text-gray-500',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-amber-100 text-amber-700',
};

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminJourneys() {
    const vm = useAdminJourneysViewModel();

    return (
        <div className="flex min-h-screen bg-soft-linen">
            <AdminSidebar />

            <div className="flex-1 flex flex-col">
                <AdminHeader userName="Admin" />

                <main className="p-6 flex-1 space-y-6">

                    {/* ── Page Title ─────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-serif text-midnight-teal">Journeys</h1>
                            <p className="text-sm text-gray-400 mt-0.5">Build and manage discipleship journeys and their series parts.</p>
                        </div>
                        <button
                            onClick={vm.openCreateBuilder}
                            className="flex items-center gap-2 bg-midnight-teal text-soft-linen px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-midnight-teal/90 transition-colors shadow"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Journey
                        </button>
                    </div>

                    {/* ── KPI chips ──────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {([
                            { label: 'Total', value: vm.counts.all },
                            { label: 'Draft', value: vm.counts.draft },
                            { label: 'Published', value: vm.counts.published },
                            { label: 'Archived', value: vm.counts.archived },
                        ] as const).map(kpi => (
                            <div key={kpi.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
                                <p className="text-3xl font-serif text-midnight-teal">{kpi.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Search + Filters ───────────────────────────── */}
                    <div className="space-y-3">
                        <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z" />
                            </svg>
                            <input
                                value={vm.search}
                                onChange={e => vm.setSearch(e.target.value)}
                                placeholder="Search by title or description…"
                                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-midnight-teal/30 shadow-sm"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* Status filter chips */}
                            <div className="flex items-center gap-2">
                                {([
                                    { value: 'all', label: 'All' },
                                    { value: 'draft', label: 'Draft' },
                                    { value: 'published', label: 'Published' },
                                    { value: 'archived', label: 'Archived' },
                                ] as { value: StatusFilter; label: string }[]).map(chip => (
                                    <button
                                        key={chip.value}
                                        onClick={() => vm.setStatusFilter(chip.value)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border transition-all duration-200
                                            ${vm.statusFilter === chip.value
                                                ? 'bg-midnight-teal text-soft-linen border-midnight-teal shadow-sm'
                                                : 'bg-white text-gray-400 border-gray-200 hover:border-midnight-teal/40 hover:text-midnight-teal'}`}
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>

                            {/* Date sort/filter */}
                            <select
                                value={vm.dateSort}
                                onChange={e => vm.setDateSort(e.target.value as DateSort)}
                                className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-500 focus:outline-none focus:ring-2 focus:ring-midnight-teal/30 shadow-sm"
                            >
                                <option value="updated_desc">Recently Updated</option>
                                <option value="updated_asc">Oldest Updated</option>
                                <option value="created_desc">Recently Created</option>
                                <option value="created_asc">Oldest Created</option>
                            </select>
                        </div>
                    </div>

                    {/* ── List ───────────────────────────────────────── */}
                    {vm.isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
                            ))}
                        </div>
                    ) : vm.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <p className="text-red-500 text-sm font-semibold">{vm.error}</p>
                            <button onClick={vm.retry} className="mt-3 text-xs font-bold text-midnight-teal underline">Retry</button>
                        </div>
                    ) : vm.filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                            <div className="w-14 h-14 rounded-full bg-soft-linen flex items-center justify-center mx-auto mb-4">
                                <svg className="w-7 h-7 text-midnight-teal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s4.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <p className="font-serif text-lg text-midnight-teal">No journeys found</p>
                            <p className="text-sm text-gray-400 mt-1">Try a different search or filter, or create a new journey.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Table header */}
                            <div className="hidden md:grid grid-cols-[1fr_100px_90px_120px_120px_150px] gap-3 px-5 py-3 bg-gray-50 text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <span>Journey</span>
                                <span>Status</span>
                                <span>Parts</span>
                                <span>Created</span>
                                <span>Updated</span>
                                <span className="text-right">Actions</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {vm.filtered.map(journey => (
                                    <JourneyRow
                                        key={journey.id}
                                        journey={journey}
                                        onEdit={() => vm.openEditBuilder(journey)}
                                        onTogglePublish={() => vm.togglePublish(journey)}
                                        onArchive={() => vm.archiveJourney(journey)}
                                        onRestore={() => vm.restoreJourney(journey)}
                                        onDelete={() => vm.openDeleteModal(journey)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* ── Toast ──────────────────────────────────────── */}
            {vm.toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all
                    ${vm.toast.type === 'success' ? 'bg-midnight-teal text-soft-linen' : 'bg-red-500 text-white'}`}>
                    {vm.toast.msg}
                </div>
            )}

            <JourneyBuilderModal
                open={vm.showBuilder}
                journey={vm.editTarget}
                onClose={vm.closeBuilder}
                onSave={vm.handleSave}
            />

            <ConfirmDeleteJourneyModal
                open={!!vm.deleteTarget}
                journeyTitle={vm.deleteTarget?.title ?? ''}
                onCancel={vm.closeDeleteModal}
                onConfirm={vm.handleDelete}
            />
        </div>
    );
}

// ─── Row sub-component ────────────────────────────────────────────────────────

interface JourneyRowProps {
    journey: Journey;
    onEdit: () => void;
    onTogglePublish: () => void;
    onArchive: () => void;
    onRestore: () => void;
    onDelete: () => void;
}

function JourneyRow({ journey, onEdit, onTogglePublish, onArchive, onRestore, onDelete }: JourneyRowProps) {
    const isArchived = journey.status === 'archived';
    const activeParts = journey.parts.filter(p => p.status === 'active').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_90px_120px_120px_150px] gap-3 px-5 py-4 items-center hover:bg-soft-linen/40 transition-colors">
            {/* Journey */}
            <div className="min-w-0">
                <p className="font-serif text-midnight-teal font-semibold truncate">{journey.title}</p>
                {journey.description && (
                    <p className="text-xs text-gray-400 truncate">{journey.description}</p>
                )}
            </div>

            {/* Status */}
            <span className={`w-fit px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${STATUS_STYLES[journey.status]}`}>
                {journey.status}
            </span>

            {/* Parts */}
            <span className="text-sm text-gray-500">{activeParts}/{journey.parts.length}</span>

            {/* Created */}
            <span className="text-xs text-gray-400">{formatDate(journey.createdAt)}</span>

            {/* Updated */}
            <span className="text-xs text-gray-400">{formatDate(journey.updatedAt)}</span>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                <button
                    onClick={onEdit}
                    title="Edit"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>

                {!isArchived && (
                    <button
                        onClick={onTogglePublish}
                        title={journey.status === 'published' ? 'Unpublish' : 'Publish'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            ${journey.status === 'published'
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-green-500 hover:bg-green-50'}`}
                    >
                        {journey.status === 'published' ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </button>
                )}

                {isArchived ? (
                    <button
                        onClick={onRestore}
                        title="Restore"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-midnight-teal/60 hover:bg-midnight-teal/10 hover:text-midnight-teal transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.5 9a7 7 0 0113 0M18.5 15a7 7 0 01-13 0" />
                        </svg>
                    </button>
                ) : (
                    <button
                        onClick={onArchive}
                        title="Archive"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-harvest-orange/70 hover:bg-harvest-orange/10 hover:text-harvest-orange transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 01-2-2V5a1 1 0 011-1h16a1 1 0 011 1v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4" />
                        </svg>
                    </button>
                )}

                <button
                    onClick={onDelete}
                    title="Delete"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/70 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
