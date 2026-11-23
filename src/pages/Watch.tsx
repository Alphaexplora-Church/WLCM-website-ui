import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import WatchPlayerSection from '../features/Watch/WatchPlayerSection';

// ─────────────────────────────────────────────────────────────────────────────
// LIVE STREAM CONFIGURATION  ← single place to wire YouTube live status later
// Set `manualOverride` to true (and populate `liveEmbedUrl`) to go live.
// When time-based auto-detection fires, `autoLive` below will also set isLive.
// ─────────────────────────────────────────────────────────────────────────────
export const LIVE_CONFIG = {
    /** Flip to true to force the live state on (manual override). */
    manualOverride: false as boolean,
    /** YouTube embed URL used when the stream is active. */
    liveEmbedUrl:
        'https://www.youtube-nocookie.com/embed/live_stream?channel=UCP34NqLt4D8Zh3jPXDsdxRw&autoplay=1&rel=0',
};

// ── Service schedule ──────────────────────────────────────────────────────────
const SERVICES = [
    { time: '10:00 AM', lang: 'English', hour: 10, minute: 0 },
    { time: '2:00 PM',  lang: 'Tagalog', hour: 14, minute: 0 },
] as const;

const BUFFER_BEFORE_MIN = 10;
const BUFFER_AFTER_MIN  = 150;

// ── Helpers ───────────────────────────────────────────────────────────────────
function getNextStream() {
    const now = new Date();
    const daysUntilSunday = now.getDay() === 0 ? 0 : 7 - now.getDay();
    const thisSunday = new Date(now);
    thisSunday.setDate(now.getDate() + daysUntilSunday);

    for (const svc of SERVICES) {
        const t = new Date(thisSunday);
        t.setHours(svc.hour, svc.minute, 0, 0);
        if (now < t) return { label: `${svc.time} — ${svc.lang}`, target: t };
    }

    const nextSunday = new Date(thisSunday);
    nextSunday.setDate(thisSunday.getDate() + 7);
    nextSunday.setHours(SERVICES[0].hour, SERVICES[0].minute, 0, 0);
    return { label: `${SERVICES[0].time} — ${SERVICES[0].lang}`, target: nextSunday };
}

function useCountdown(target: Date) {
    const [diff, setDiff] = useState(target.getTime() - Date.now());
    useEffect(() => {
        const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1_000);
        return () => clearInterval(id);
    }, [target]);
    const total = Math.max(0, diff);
    const d = Math.floor(total / 86_400_000);
    const h = Math.floor((total % 86_400_000) / 3_600_000);
    const m = Math.floor((total % 3_600_000) / 60_000);
    const s = Math.floor((total % 60_000) / 1_000);
    return { d, h, m, s };
}

// ── Component ─────────────────────────────────────────────────────────────────
const Watch = () => {
    const [serviceState, setServiceState] = useState<{ withinEng: boolean; withinTag: boolean }>({
        withinEng: false,
        withinTag: false,
    });
    const [autoLive, setAutoLive] = useState(false);

    /** Single isLive truth — wire LIVE_CONFIG.manualOverride or the YouTube
     *  API response here when ready. */
    const isLive = LIVE_CONFIG.manualOverride || autoLive;

    const next = getNextStream();
    const { d, h, m, s } = useCountdown(next.target);

    useEffect(() => {
        const check = () => {
            const now = new Date();
            if (now.getDay() !== 0) {
                setServiceState({ withinEng: false, withinTag: false });
                setAutoLive(false);
                return;
            }
            const cur = now.getHours() * 60 + now.getMinutes();
            const withinEng =
                cur >= SERVICES[0].hour * 60 + SERVICES[0].minute - BUFFER_BEFORE_MIN &&
                cur <= SERVICES[0].hour * 60 + SERVICES[0].minute + BUFFER_AFTER_MIN;
            const withinTag =
                cur >= SERVICES[1].hour * 60 + SERVICES[1].minute - BUFFER_BEFORE_MIN &&
                cur <= SERVICES[1].hour * 60 + SERVICES[1].minute + BUFFER_AFTER_MIN;
            setServiceState({ withinEng, withinTag });
            setAutoLive(withinEng || withinTag);
        };
        check();
        const interval = setInterval(check, 60_000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-midnight-teal min-h-screen text-soft-linen selection:bg-harvest-orange selection:text-midnight-teal">
            <Navigation lightMode={false} />

            <section className="pt-36 md:pt-44 pb-24 md:pb-36 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">

                    {/* ── TITLE ──────────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <span className="text-harvest-orange uppercase tracking-[0.4em] text-[10px] font-bold font-sans block mb-3">
                            Live Stream
                        </span>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1
                                className="font-serif text-5xl md:text-7xl tracking-tighter lowercase"
                                style={{ fontFamily: 'Vogun, serif' }}
                            >
                                Watch Live
                            </h1>

                            {/* Red "LIVE NOW" badge — only when live */}
                            <AnimatePresence>
                                {isLive && (
                                    <motion.div
                                        key="live-badge"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.3 }}
                                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 font-sans text-[10px] uppercase tracking-widest font-bold text-red-400 self-center"
                                    >
                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                        Live Now
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* ── SERVICE CARDS ───────────────────────────────────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {[
                            { time: '10:00 AM', lang: 'English', isActive: serviceState.withinEng },
                            { time: '2:00 PM',  lang: 'Tagalog', isActive: serviceState.withinTag },
                        ].map((svc) => {
                            const otherIsLive = isLive && !svc.isActive;
                            return (
                                <div
                                    key={svc.lang}
                                    className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-300 ${
                                        svc.isActive
                                            ? 'border-harvest-orange bg-harvest-orange/[0.06]'
                                            : 'border-soft-linen/10 bg-soft-linen/[0.03]'
                                    }`}
                                >
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-harvest-orange font-bold block">
                                            {svc.lang}
                                        </span>
                                        <span className="font-serif text-2xl">{svc.time} Service</span>
                                    </div>

                                    {svc.isActive ? (
                                        /* Solid orange "Live now" tag for the active card */
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-widest font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-midnight-teal/60 animate-pulse" />
                                            Live now
                                        </div>
                                    ) : otherIsLive ? (
                                        /* Another service is live; this one is "Later today" */
                                        <div className="px-4 py-1.5 rounded-full border border-soft-linen/20 font-sans text-[10px] uppercase tracking-widest text-soft-linen/50">
                                            Later today
                                        </div>
                                    ) : (
                                        <div className="px-4 py-1.5 rounded-full border border-soft-linen/20 font-sans text-[10px] uppercase tracking-widest text-soft-linen/50">
                                            Upcoming
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* ── STATE 1: Countdown + disabled button (not live) ─────── */}
                    <AnimatePresence>
                        {!isLive && (
                            <motion.div
                                key="pre-live"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center gap-8 mb-12"
                            >
                                {/* Next stream label + countdown */}
                                <div className="text-center">
                                    <p className="font-sans text-soft-linen/50 text-[11px] uppercase tracking-widest mb-5">
                                        Next stream:{' '}
                                        <span className="text-harvest-orange">{next.label}</span>
                                    </p>
                                    <div className="flex items-center justify-center gap-4 md:gap-8">
                                        {[
                                            { val: d, label: 'Days' },
                                            { val: h, label: 'Hours' },
                                            { val: m, label: 'Min' },
                                            { val: s, label: 'Sec' },
                                        ].map(({ val, label }) => (
                                            <div key={label} className="flex flex-col items-center">
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={val}
                                                        initial={{ y: -10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 10, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="font-serif text-4xl md:text-6xl"
                                                    >
                                                        {String(val).padStart(2, '0')}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-soft-linen/40 mt-1">
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Disabled "Stream Starts Soon" button */}
                                <button
                                    disabled
                                    className="px-12 py-4 rounded-full border border-soft-linen/20 text-soft-linen/40 font-sans text-[11px] uppercase tracking-[0.3em] font-bold cursor-not-allowed"
                                >
                                    Stream Starts Soon
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── PLAYER SECTION (handles both states) ────────────────── */}
                    <div id="player-section" className="scroll-mt-28">
                        <WatchPlayerSection isLive={isLive} />
                    </div>

                </div>
            </section>
        </div>
    );
};

export default Watch;
