import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WatchPlayerSectionProps {
  isLive: boolean;
  channelId?: string;
}

const YOUTUBE_CHANNEL_HANDLE = '@wordsoflifeph';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@wordsoflifeph';
const DEFAULT_CHANNEL_ID = 'UCP34NqLt4D8Zh3jPXDsdxRw';
// YouTube generates an uploads playlist by replacing "UC" with "UU" in the channel ID
const UPLOADS_PLAYLIST_ID = 'UUP34NqLt4D8Zh3jPXDsdxRw';

export const WatchPlayerSection: React.FC<WatchPlayerSectionProps> = ({
  isLive,
  channelId = DEFAULT_CHANNEL_ID,
}) => {
  const [shouldLoadPlayer, setShouldLoadPlayer] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy-load the iframe when user scrolls near it (250px margin)
  useEffect(() => {
    if (shouldLoadPlayer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setShouldLoadPlayer(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldLoadPlayer]);

  const handleManualPlay = () => {
    setShouldLoadPlayer(true);
    setHasInteracted(true);
  };

  // Determine the embed source URL based on live status
  const embedUrl = isLive
    ? `https://www.youtube-nocookie.com/embed/live_stream?channel=${channelId}&autoplay=${hasInteracted ? '1' : '0'}&rel=0`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${UPLOADS_PLAYLIST_ID}&autoplay=${hasInteracted ? '1' : '0'}&rel=0`;

  const playerTitle = isLive
    ? 'Words of Life Live Stream Broadcast'
    : 'Words of Life Latest Service Replay';

  // ── Social Platforms Configuration ──────────────────────────────────────────
  const socialPlatforms = [
    {
      platform: 'Facebook',
      name: 'Words of Life Christian Ministries Main',
      description: 'Live streams, community updates, and sermon replays.',
      url: 'https://www.facebook.com/WLCMMain/',
      badge: 'Facebook',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      platform: 'YouTube',
      name: 'Words of Life PH',
      description: 'Sunday messages and over 1,500 videos to browse.',
      url: 'https://www.youtube.com/@wordsoflifeph',
      badge: 'YouTube',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" />
        </svg>
      ),
    },
    {
      platform: 'Instagram',
      name: '@wordsoflife.ph',
      description: 'Daily inspiration, series announcements, and ministry highlights.',
      url: 'https://www.instagram.com/wordsoflife.ph/',
      badge: 'Instagram',
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full mt-4 md:mt-8">
      {/* ── PART 1: 16:9 VIDEO PLAYER SECTION ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Header Row: Status Tag & YouTube Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            {isLive ? (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-harvest-orange/15 border border-harvest-orange/30 text-harvest-orange text-[9px] uppercase tracking-widest font-bold font-sans">
                <span className="w-2 h-2 rounded-full bg-harvest-orange animate-pulse" />
                Live Now
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-soft-linen/15 text-soft-linen/70 text-[9px] uppercase tracking-widest font-bold font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange" />
                Latest service replay
              </span>
            )}
            <span className="text-soft-linen/30 text-xs hidden sm:inline">•</span>
            <span className="text-soft-linen/50 font-sans text-xs tracking-wide hidden sm:inline">
              YouTube: {YOUTUBE_CHANNEL_HANDLE}
            </span>
          </div>

          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-harvest-orange hover:text-[#d4581d] font-sans text-[11px] uppercase tracking-[0.2em] font-bold transition-colors w-fit focus-visible:outline-none focus-visible:underline"
          >
            <span>Open on YouTube</span>
            <svg
              className="w-3.5 h-3.5 stroke-[2]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* 16:9 Player Container */}
        <div
          ref={containerRef}
          className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden bg-black/40 border border-soft-linen/10 shadow-2xl shadow-black/40"
        >
          {embedFailed ? (
            /* Clean Fallback Card if embed cannot load */
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
              <div className="w-14 h-14 rounded-full bg-harvest-orange/10 border border-harvest-orange/20 flex items-center justify-center text-harvest-orange mb-4">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                  <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl text-soft-linen mb-2" style={{ fontFamily: 'Vogun, serif' }}>
                Watch on YouTube
              </h3>
              <p className="font-sans text-soft-linen/60 text-xs md:text-sm max-w-md mb-6 leading-relaxed">
                Stream Sunday messages, worship services, and community gatherings directly on our official YouTube channel.
              </p>
              <a
                href={YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#d4581d] transition-all duration-300 shadow-lg shadow-harvest-orange/20"
              >
                Open Channel ({YOUTUBE_CHANNEL_HANDLE})
              </a>
            </div>
          ) : shouldLoadPlayer ? (
            /* Embedded Player (Loaded lazily on scroll or tap) */
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={playerTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
              onError={() => setEmbedFailed(true)}
            />
          ) : (
            /* Fast-loading Facade / Tap-to-play Placeholder */
            <div
              onClick={handleManualPlay}
              className="w-full h-full cursor-pointer group relative flex flex-col justify-between p-6 md:p-8 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent select-none"
              role="button"
              tabIndex={0}
              aria-label={`Play ${playerTitle}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleManualPlay();
                }
              }}
            >
              {/* Corner reticle decorations */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-soft-linen/20 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-soft-linen/20 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-soft-linen/20 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-soft-linen/20 pointer-events-none" />

              {/* Top row */}
              <div className="flex items-center justify-between relative z-10">
                <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-harvest-orange font-bold">
                  Words of Life • Online Broadcast
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-soft-linen/40">
                  {isLive ? 'LIVE' : 'AUTO-UPDATING'}
                </span>
              </div>

              {/* Center Play Button */}
              <div className="self-center flex flex-col items-center gap-3 my-auto relative z-10">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-harvest-orange text-midnight-teal flex items-center justify-center shadow-xl shadow-harvest-orange/20 group-hover:bg-[#d4581d] transition-colors duration-300"
                >
                  <svg className="w-7 h-7 md:w-8 md:h-8 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-soft-linen/70 font-semibold group-hover:text-soft-linen transition-colors">
                  Tap to load player
                </span>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between relative z-10 text-soft-linen/40 text-[10px] font-sans">
                <span>{YOUTUBE_CHANNEL_HANDLE}</span>
                <span className="font-mono uppercase tracking-widest text-[9px]">16:9 HD</span>
              </div>
            </div>
          )}
        </div>

        {/* Caption below player */}
        <p className="text-soft-linen/60 font-sans text-xs md:text-sm leading-relaxed mt-3 max-w-2xl">
          {isLive
            ? 'Join our ongoing Sunday service stream. Sing, listen, and worship with our church family live online.'
            : 'Missed our latest gathering? Catch up on the latest Sunday message and worship replay from Words of Life.'}
        </p>
      </motion.div>

      {/* ── PART 2: SOCIAL LINKS ("Find us on") ─────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mt-16 md:mt-24 pt-12 border-t border-soft-linen/10"
        aria-labelledby="social-channels-heading"
      >
        <div className="mb-8">
          <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-harvest-orange font-bold block mb-2">
            Connect With Us
          </span>
          <h2
            id="social-channels-heading"
            className="font-serif text-3xl md:text-5xl text-soft-linen tracking-tight lowercase"
            style={{ fontFamily: 'Vogun, serif' }}
          >
            Find us on
          </h2>
        </div>

        {/* Responsive Grid: 1 col on mobile, 3 cols on desktop/tablet */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {socialPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${platform.platform}: ${platform.name} (opens in new tab)`}
              className="group relative flex flex-col justify-between p-6 md:p-7 rounded-2xl border border-soft-linen/10 bg-white/[0.025] hover:bg-white/[0.055] hover:border-harvest-orange/40 transition-all duration-300 min-h-[170px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harvest-orange/60"
            >
              <div>
                {/* Platform Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full border border-soft-linen/15 bg-white/[0.03] flex items-center justify-center text-soft-linen/70 group-hover:text-harvest-orange group-hover:border-harvest-orange/40 group-hover:bg-harvest-orange/10 transition-all duration-300">
                    {platform.icon}
                  </div>
                  <span className="text-soft-linen/30 group-hover:text-harvest-orange group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                    <svg
                      className="w-4 h-4 stroke-[2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </span>
                </div>

                {/* Platform Name */}
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-harvest-orange/90 font-bold block mb-1">
                  {platform.badge}
                </span>
                <h3
                  className="font-serif text-xl md:text-2xl text-soft-linen tracking-tight leading-snug mb-2 group-hover:text-soft-linen transition-colors"
                  style={{ fontFamily: 'Vogun, serif' }}
                >
                  {platform.name}
                </h3>

                {/* One-line Description */}
                <p className="font-sans text-soft-linen/60 text-xs md:text-sm leading-relaxed">
                  {platform.description}
                </p>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 mt-6 border-t border-soft-linen/10 flex items-center justify-between">
                <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-soft-linen/40 group-hover:text-harvest-orange font-semibold transition-colors">
                  Follow {platform.badge}
                </span>
                <span className="text-soft-linen/40 text-xs group-hover:text-harvest-orange transition-colors">
                  ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default WatchPlayerSection;
