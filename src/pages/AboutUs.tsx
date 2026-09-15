import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import { useInView, motion } from 'framer-motion';

// IMPORTS
import Navigation from '../components/Navigation';
import Manifesto from '../features/About/Manifesto';
import LeadershipSection from '../features/About/LeadershipSection';
import DaughterChurchesSection from '../features/About/DaughterChurchesSection'; // <-- NEW

export default function AboutUs() {
  const location = useLocation();
  const beliefsRef = useRef(null);

  const isDarkSectionVisible = useInView(beliefsRef, { margin: "-10% 0px -90% 0px" });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          lenis.scrollTo(target as HTMLElement, { offset: -80 });
        }
      }
    };

    handleHashScroll();

    return () => {
      lenis.destroy();
    };
  }, [location.hash]);

  return (
    <div className="bg-soft-linen min-h-screen w-full selection:bg-midnight-teal selection:text-soft-linen overflow-x-hidden">

      <Navigation lightMode={!isDarkSectionVisible} />

      <main className="flex flex-col">
        <div id="manifesto">
          <Manifesto />
        </div>

        <div id="history">
          {/* <HistorySection /> */}
        </div>

        <div id="leaders">
          <LeadershipSection />
        </div>

        <div id="churches">
          <DaughterChurchesSection />
        </div>

        <div id="beliefs" ref={beliefsRef} className="bg-deep-teal">
          {/* <BeliefsSection /> */}
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────── */}
        <footer id="contact" className="bg-midnight-teal text-soft-linen overflow-hidden pb-20 lg:pb-0">

          {/* Main footer body */}
          <div className="max-w-lg mx-auto px-6 md:px-10 pt-6 md:pt-8 pb-5 md:pb-6 flex flex-col gap-4">

            {/* 1 — Connect With Us label */}
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-sans text-xs uppercase tracking-[0.4em] text-harvest-orange font-bold block"
            >
              Connect With Us
            </motion.span>

            {/* 2 — Email Directory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
            >
              <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-soft-linen/30 font-bold block mb-4 text-center">
                Email Directory
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Management", email: "management@wordsoflife.ph" },
                  { label: "Membership", email: "membership@wordsoflife.ph" },
                  { label: "Ministries", email: "ministries@wordsoflife.ph" },
                ].map((c, i) => (
                  <motion.a
                    key={c.email}
                    href={`mailto:${c.email}`}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-soft-linen/10 hover:border-harvest-orange/40 hover:bg-harvest-orange/8 transition-all duration-300"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-soft-linen/6 flex items-center justify-center group-hover:bg-harvest-orange/15 transition-colors duration-300">
                      <svg className="w-3.5 h-3.5 text-soft-linen/40 group-hover:text-harvest-orange transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="3" />
                        <polyline points="2,4 12,13 22,4" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-soft-linen/35 font-bold">{c.label}</span>
                      <span className="font-serif text-sm md:text-base text-soft-linen group-hover:text-harvest-orange transition-colors duration-300 truncate">{c.email}</span>
                    </div>
                    <svg className="w-4 h-4 text-soft-linen/20 group-hover:text-harvest-orange group-hover:translate-x-1 transition-all duration-300 ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* 3 — Branding: words of life + body text (centered) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-3 text-center pt-2"
            >
              <h2
                className="font-serif text-4xl md:text-5xl text-soft-linen lowercase tracking-tighter leading-none"
                style={{ fontFamily: 'Vogun, serif' }}
              >
                words of life.
              </h2>
              <p className="font-sans text-soft-linen/40 text-xs leading-relaxed">
                Christian Ministries Inc. · Estd. 2002<br />
                Greenhills, San Juan, Metro Manila
              </p>

              {/* 4 — Social icons (centered) */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {[
                  {
                    label: "Facebook",
                    url: "https://www.facebook.com/WLCMMain",
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Instagram",
                    url: "https://www.instagram.com/wordsoflife.ph/",
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                      </svg>
                    ),
                  },
                  {
                    label: "YouTube",
                    url: "https://www.youtube.com/@wordsoflifeph",
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white" />
                      </svg>
                    ),
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-full border border-soft-linen/15 flex items-center justify-center text-soft-linen/50 hover:border-harvest-orange hover:text-harvest-orange hover:bg-harvest-orange/10 transition-all duration-300"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Bottom bar */}
          <div>
            <div className="max-w-lg mx-auto px-6 md:px-10 py-2 flex flex-col items-center gap-0.5">
              <p className="font-sans text-[10px] text-soft-linen/30 tracking-wide">
                © {new Date().getFullYear()} Words of Life Christian Ministries Inc. All rights reserved.
              </p>
              <a
                href="https://www.alphaexplora.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-sans text-[10px] text-soft-linen/25 hover:text-harvest-orange transition-colors duration-300 tracking-wide"
              >
                Powered by Alphaexplora Information Technology Services
              </a>
            </div>
          </div>

        </footer>
      </main>

    </div>
  );
}