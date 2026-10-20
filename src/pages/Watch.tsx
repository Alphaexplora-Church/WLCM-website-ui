import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Navigation';
import WatchPlayerSection from '../features/Watch/WatchPlayerSection';

// ── Helpers ──────────────────────────────────────────────────────────────────
function getNextStream() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const thisSunday = new Date(now);
    thisSunday.setDate(now.getDate() + daysUntilSunday);

    const eng = new Date(thisSunday);
    eng.setHours(10, 0, 0, 0);
    const tag = new Date(thisSunday);
    tag.setHours(14, 0, 0, 0);

    if (now < eng) return { label: '10:00 AM — English', target: eng };
    if (now < tag) return { label: '2:00 PM — Tagalog', target: tag };

    // Both passed — next Sunday English
    const nextSunday = new Date(thisSunday);
    nextSunday.setDate(thisSunday.getDate() + 7);
    nextSunday.setHours(10, 0, 0, 0);
    return { label: '10:00 AM — English', target: nextSunday };
}

function useCountdown(target: Date) {
    const [diff, setDiff] = useState(target.getTime() - Date.now());
    useEffect(() => {
        const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [target]);
    const total = Math.max(0, diff);
    const d = Math.floor(total / 86400000);
    const h = Math.floor((total % 86400000) / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    return { d, h, m, s };
}

// ── Component ────────────────────────────────────────────────────────────────
const Watch = () => {
    const [isLive, setIsLive] = useState(false);
    const [serviceState, setServiceState] = useState<{ withinEng: boolean; withinTag: boolean }>({
        withinEng: false,
        withinTag: false,
    });

    const next = getNextStream();
    const { d, h, m, s } = useCountdown(next.target);

    // ── Check if currently within service hours ────────────────────────────
    useEffect(() => {
        const checkServiceTime = () => {
            const now = new Date();
            const dayOfWeek = now.getDay(); // 0=Sun
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentTime = hours * 60 + minutes; // Convert to minutes

            // Service times (in minutes from midnight):
            // 10:00 AM = 600 minutes
            // 2:00 PM = 840 minutes
            // Buffer: 10 minutes before and 150 minutes after each service
            const eng10am = 600; // 10:00 AM
            const tag2pm = 840; // 2:00 PM
            const buffer_before = 10;
            const buffer_after = 150;

            // Check if it's Sunday and within service hours (with buffer)
            const withinEng = dayOfWeek === 0 && currentTime >= (eng10am - buffer_before) && currentTime <= (eng10am + buffer_after);
            const withinTag = dayOfWeek === 0 && currentTime >= (tag2pm - buffer_before) && currentTime <= (tag2pm + buffer_after);

            setServiceState({ withinEng, withinTag });
            setIsLive(withinEng || withinTag);
        };

        // Check immediately
        checkServiceTime();

        // Check every minute for time changes
        const interval = setInterval(checkServiceTime, 60000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-midnight-teal min-h-screen text-soft-linen selection:bg-harvest-orange selection:text-midnight-teal">
            <Navigation lightMode={false} />

            {/* ── WATCH LIVE ────────────────────────────────────────────────────── */}
            <section className="pt-36 md:pt-44 pb-20 md:pb-32 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-12"
                    >
                        <span className="text-harvest-orange uppercase tracking-[0.4em] text-[10px] font-bold block mb-3">Live Stream</span>
                        <h1 className="font-serif text-5xl md:text-7xl tracking-tighter lowercase"
                            style={{ fontFamily: 'Vogun, serif' }}>
                            Watch Live
                        </h1>
                    </motion.div>

                    {/* Two service buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                        {[
                            { time: '10:00 AM', lang: 'English', isLive: serviceState.withinEng },
                            { time: '2:00 PM', lang: 'Tagalog', isLive: serviceState.withinTag }
                        ].map((svc) => (
                            <div
                                key={svc.lang}
                                className={`flex items-center justify-between px-6 py-4 rounded-2xl border transition-colors ${
                                    svc.isLive
                                        ? 'border-harvest-orange/40 bg-harvest-orange/[0.04]'
                                        : 'border-soft-linen/10 bg-soft-linen/[0.03]'
                                }`}
                            >
                                <div>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-harvest-orange font-bold block">{svc.lang}</span>
                                    <span className="font-serif text-2xl">{svc.time} Service</span>
                                </div>
                                {svc.isLive ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-harvest-orange/15 border border-harvest-orange/30 font-sans text-[10px] uppercase tracking-widest text-harvest-orange font-bold">
                                        <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse" />
                                        Live Now
                                    </div>
                                ) : (
                                    <div className="px-4 py-1.5 rounded-full border border-soft-linen/20 font-sans text-[10px] uppercase tracking-widest text-soft-linen/50">
                                        Upcoming
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Countdown */}
                    <div className="text-center mb-10">
                        <p className="font-sans text-soft-linen/50 text-sm uppercase tracking-widest mb-4">
                            Next stream: <span className="text-harvest-orange">{next.label}</span>
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
                                    <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-soft-linen/40 mt-1">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Watch Live button (inactive until live) */}
                    <div className="flex justify-center mb-12">
                        {isLive ? (
                            <a
                                href="#player-section"
                                className="px-12 py-4 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-[#d4581d] transition-all duration-300 shadow-lg shadow-harvest-orange/20"
                            >
                                Watch Stream Below
                            </a>
                        ) : (
                            <button
                                disabled
                                className="px-12 py-4 rounded-full border border-soft-linen/20 text-soft-linen/40 font-sans text-[11px] uppercase tracking-[0.3em] font-bold cursor-not-allowed"
                            >
                                Stream Starts Soon
                            </button>
                        )}
                    </div>

                    {/* ── NEW COMPONENT: 16:9 Video Player & Social Links ── */}
                    <div id="player-section" className="scroll-mt-28">
                        <WatchPlayerSection isLive={isLive} />
                    </div>
                </div>
            </section>

            {/* ── PREVIOUS MESSAGES ─────────────────────────────────────────────── */}

        </div>
    );
};

export default Watch;
