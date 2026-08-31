// ─── Journey Builder: Modal (View) ──────────────────────────────────────────
import { Reorder } from 'framer-motion';
import type { Journey, JourneyFormData, JourneyStatus, PartFormData } from './adminJourneys.types';
import { useJourneyBuilderViewModel } from './useJourneyBuilderViewModel';
import { PartRow } from './PartRow';

interface JourneyBuilderModalProps {
    open: boolean;
    journey: Journey | null;
    onClose: () => void;
    onSave: (form: JourneyFormData, parts: PartFormData[]) => Promise<void>;
}

const STATUS_OPTIONS: { value: JourneyStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

export function JourneyBuilderModal({ open, journey, onClose, onSave }: JourneyBuilderModalProps) {
    const vm = useJourneyBuilderViewModel(journey, open);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col">

                {/* Header */}
                <div className="bg-midnight-teal px-6 py-5 flex items-center justify-between flex-shrink-0">
                    <h2 className="font-serif text-xl text-soft-linen">
                        {journey ? 'Edit Journey' : 'New Journey'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={vm.isSaving}
                        className="text-soft-linen/60 hover:text-soft-linen text-2xl leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ×
                    </button>
                </div>

                {/* Body — scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                    {/* Journey fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Title</label>
                            <input
                                value={vm.form.title}
                                onChange={e => vm.setField('title', e.target.value)}
                                placeholder="e.g. Foundations of Faith"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Description</label>
                            <textarea
                                value={vm.form.description}
                                onChange={e => vm.setField('description', e.target.value)}
                                rows={3}
                                placeholder="What is this journey about?"
                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-midnight-teal mb-1">Status</label>
                            <div className="flex gap-2">
                                {STATUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => vm.setField('status', opt.value)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors
                                            ${vm.form.status === opt.value
                                                ? 'bg-midnight-teal text-soft-linen border-midnight-teal'
                                                : 'bg-white text-gray-400 border-gray-200 hover:border-midnight-teal/40 hover:text-midnight-teal'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Series / Parts manager */}
                    <div className="space-y-3 border-t border-gray-100 pt-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-serif text-lg text-midnight-teal">Series Parts</h3>
                                <p className="text-xs text-gray-400">Drag to reorder, or use the arrows.</p>
                            </div>
                            <button
                                type="button"
                                onClick={vm.addPart}
                                className="flex items-center gap-1.5 bg-harvest-orange text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-harvest-orange/90 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Part
                            </button>
                        </div>

                        {vm.parts.length === 0 ? (
                            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
                                No parts yet. Add the first part of this series.
                            </div>
                        ) : (
                            <Reorder.Group
                                as="div"
                                axis="y"
                                values={vm.parts}
                                onReorder={vm.reorderParts}
                                className="space-y-2"
                            >
                                {vm.parts.map((part, index) => (
                                    <PartRow
                                        key={part.id}
                                        part={part}
                                        index={index}
                                        total={vm.parts.length}
                                        isExpanded={vm.expandedId === part.id}
                                        onToggleExpand={() => vm.toggleExpand(part.id)}
                                        onChange={(field, value) => vm.updatePart(part.id, field, value)}
                                        onRemove={() => vm.removePart(part.id)}
                                        onToggleArchive={() => vm.togglePartArchive(part.id)}
                                        onMove={dir => vm.movePart(index, dir)}
                                    />
                                ))}
                            </Reorder.Group>
                        )}
                    </div>

                    {vm.saveError && (
                        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-600">{vm.saveError}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 flex-shrink-0">
                    <button
                        onClick={onClose}
                        disabled={vm.isSaving}
                        className="px-5 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => vm.submit(onSave)}
                        disabled={vm.isSaving}
                        className="px-5 py-2 rounded-lg text-sm font-bold bg-midnight-teal text-soft-linen hover:bg-midnight-teal/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[130px] justify-center"
                    >
                        {vm.isSaving ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-soft-linen" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                <span>Saving…</span>
                            </>
                        ) : (
                            <span>{journey ? 'Save Changes' : 'Create Journey'}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
