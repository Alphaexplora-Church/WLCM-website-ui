// ─── Video embed URL helper ──────────────────────────────────────────────────
// Converts common YouTube/Vimeo share links into embeddable iframe URLs so
// the Series Manager can show a live preview as the admin types.

export function toEmbedUrl(raw: string): string | null {
    const url = raw.trim();
    if (!url) return null;

    try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace('www.', '');

        if (host === 'youtube.com' || host === 'm.youtube.com') {
            const id = parsed.searchParams.get('v');
            if (id) return `https://www.youtube.com/embed/${id}`;
            if (parsed.pathname.startsWith('/embed/')) return url;
        }
        if (host === 'youtu.be') {
            const id = parsed.pathname.slice(1);
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
        if (host === 'vimeo.com') {
            const id = parsed.pathname.split('/').filter(Boolean)[0];
            if (id) return `https://player.vimeo.com/video/${id}`;
        }
        // Fallback: assume it's already an embeddable/direct URL.
        return url;
    } catch {
        return null;
    }
}
