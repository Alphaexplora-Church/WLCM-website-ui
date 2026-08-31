// ─── Journey Builder: PartRow (View) ────────────────────────────────────────
// Compact by default (title + quick actions). "Edit" expands an accordion
// panel with the full fields. The drag handle uses Framer Motion's
// Reorder.Item so the dragged card follows the pointer and the rest of the
// list smoothly slides up/down via its built-in layout animation.
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion';
import type { PartFormData } from './adminJourneys.types';
import { toEmbedUrl } from './videoEmbed';

interface PartRowProps {
    part: PartFormData;
    index: number;
    total: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onChange: (field: keyof PartFormData, value: string) => void;
    onRemove: () => void;
    onToggleArchive: () => void;
    onMove: (direction: -1 | 1) => void;
}

export function PartRow({
    part, index, total, isExpanded, onToggleExpand,
    onChange, onRemove, onToggleArchive, onMove,
}: PartRowProps) {
    const dragControls = useDragControls();
    const embedUrl = toEmbedUrl(part.videoUrl);
    const isArchived = part.status === 'archived';

    return (
        <Reorder.Item
            value={part}
            dragListener={false}
            dragControls={dragControls}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ layout: { duration: 0.2 } }}
            className={`list-none rounded-xl border bg-white overflow-hidden
                ${isArchived ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}
        >
            {/* ── Compact header — always visible ─────────────────────── */}
            <div className="flex items-center gap-2 px-3 py-2.5">
                <span
                    onPointerDown={e => dragControls.start(e)}
                    title="Drag to reorder"
                    className="touch-none cursor-grab active:cursor-grabbing text-gray-300 hover:text-midnight-teal flex-shrink-0 px-0.5"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 4a1 1 0 11-2 0 1 1 0 012 0zM7 10a1 1 0 11-2 0 1 1 0 012 0zM7 16a1 1 0 11-2 0 1 1 0 012 0zM15 4a1 1 0 11-2 0 1 1 0 012 0zM15 10a1 1 0 11-2 0 1 1 0 012 0zM15 16a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                </span>

                <span className="w-5 h-5 rounded-full bg-midnight-teal/10 text-midnight-teal text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                </span>

                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className={`text-sm font-semibold truncate ${part.title ? 'text-midnight-teal' : 'text-gray-400 italic'}`}>
                        {part.title || 'Untitled part'}
                    </span>
                    {embedUrl && (
                        <span title="Has video" className="flex-shrink-0">
                            <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </span>
                    )}
                    {isArchived && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            Archived
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button type="button" onClick={() => onMove(-1)} disabled={index === 0}
                        title="Move up"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-midnight-teal disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}
                        title="Move down"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-midnight-teal disabled:opacity-30 disabled:cursor-not-allowed">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <button type="button" onClick={onToggleExpand}
                        title={isExpanded ? 'Collapse' : 'Edit part'}
                        className={`flex items-center gap-1 px-2.5 h-7 rounded-lg text-xs font-bold transition-colors
                            ${isExpanded
                                ? 'bg-midnight-teal text-soft-linen'
                                : 'text-midnight-teal/70 hover:bg-midnight-teal/10'}`}
                    >
                        {isExpanded ? (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Done
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </>
                        )}
                    </button>

                    <button type="button" onClick={onToggleArchive}
                        title={isArchived ? 'Restore part' : 'Archive part'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-harvest-orange">
                        {isArchived ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.5 9a7 7 0 0113 0M18.5 15a7 7 0 01-13 0" />
                            </svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 01-2-2V5a1 1 0 011-1h16a1 1 0 011 1v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M10 12h4" />
                            </svg>
                        )}
                    </button>
                    <button type="button" onClick={onRemove} title="Remove part"
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/70 hover:bg-red-50 hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Expanded panel — full fields, animated open/close ───── */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-midnight-teal mb-1">Part Title</label>
                                <input
                                    value={part.title}
                                    onChange={e => onChange('title', e.target.value)}
                                    placeholder="e.g. Session 1: Getting Started"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-midnight-teal mb-1">Text Content</label>
                                <textarea
                                    value={part.textContent}
                                    onChange={e => onChange('textContent', e.target.value)}
                                    rows={3}
                                    placeholder="Notes, transcript, or supporting text for this part..."
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-midnight-teal mb-1">Video Embed URL</label>
                                    <input
                                        value={part.videoUrl}
                                        onChange={e => onChange('videoUrl', e.target.value)}
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-midnight-teal/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-midnight-teal mb-1">Live Preview</label>
                                    <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                                        {embedUrl ? (
                                            <iframe
                                                src={embedUrl}
                                                className="w-full h-full"
                                                title={`${part.title || 'part'}-preview`}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">No video URL yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Reorder.Item>
    );
}
