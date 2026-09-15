import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PlanVisitModal from './PlanVisitModal';

interface NavigationProps {
  lightMode?: boolean;
}

// ── Dropdown nav structure ────────────────────────────────────────────────
const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'About',
    path: '/about',
    dropdown: [
      { label: 'Who We Are', path: '/about#manifesto', desc: 'Our story & why we exist' },
      { label: 'Leadership', path: '/about#leaders', desc: 'National team & pastors' },
      // { label: 'Our Beliefs', path: '/about#beliefs', desc: 'What we stand for' },
      { label: 'Churches', path: '/about#churches', desc: '21 churches across the Philippines' },
      { label: 'Contact Us', path: '/about#contact', desc: 'Reach out to us' },
    ],
  },
  {
    label: 'Connect',
    path: '/experience',
    dropdown: [
      // { label: 'Watch', path: '/watch', desc: 'Live & past Sunday messages' },
      { label: 'Events', path: '/experience#events', desc: 'Feasts & national gatherings' },
      { label: 'Ministries', path: '/experience#ministries', desc: 'Life & service ministries' },
      { label: 'Find Freedom', path: '/find-freedom', desc: 'Pre-Encounter & Encounter Journey' },
      { label: 'Discover Purpose', path: '/discover-purpose', desc: 'Foundation Class & Equip' },
    ],
  },
  { label: 'Give', path: '/give' },
  { label: 'Sermons', path: '/sermons' },
  { label: 'Contact', path: '/engage#contact' },

  // {
  //   label: 'Next Steps',
  //   path: '/engage',
  //   dropdown: [
  //     { label: 'Find a Mentor', path: '/engage#sermons', desc: 'Caregroups & discipleship' },
  //     { label: 'Give', path: '/engage#give', desc: 'Support the mission' },
  //     { label: 'Prayer Wall', path: '/prayer', desc: 'Share your prayer requests' },
  //     { label: 'Contact', path: '/engage#contact', desc: 'We\'d love to hear from you' },
  //   ],
  // },
];

// ── helpers ───────────────────────────────────────────────────────────────
function isActivePath(path: string, pathname: string): boolean {
  if (path.includes('#')) return false;
  if (path === '/') return pathname === '/';
  return pathname.startsWith(path);
}

// ── Dropdown panel ────────────────────────────────────────────────────────
interface DropdownItem { label: string; path: string; desc: string; }
function Dropdown({ items, onClose }: { items: DropdownItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-midnight-teal/95 backdrop-blur-xl border border-soft-linen/10 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      <div className="py-2">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            onClick={onClose}
            className="flex flex-col px-4 py-3 hover:bg-soft-linen/5 transition-colors group"
          >
            <span className="font-sans text-[11px] text-soft-linen font-bold group-hover:text-harvest-orange transition-colors">
              {item.label}
            </span>
            <span className="font-sans text-[10px] text-soft-linen/35 mt-0.5 leading-snug">
              {item.desc}
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function Navigation({ lightMode = false }: NavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  useEffect(() => { setMenuOpen(false); setActiveDropdown(null); }, [location]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openDropdown = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };
  const closeDropdown = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const textBase = lightMode ? 'text-midnight-teal' : 'text-soft-linen';
  const pillBg = scrolled
    ? (lightMode ? 'bg-white/95 shadow-lg border-midnight-teal/10' : 'bg-midnight-teal/95 shadow-lg border-soft-linen/10')
    : (lightMode ? 'bg-white/20 border-white/20' : 'bg-midnight-teal/20 border-white/10');

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 md:py-4">
        <div className={`max-w-7xl mx-auto flex justify-between items-center h-14 md:h-16 px-5 md:px-8 rounded-full transition-all duration-500 backdrop-blur-md border ${pillBg}`}>

          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className={`font-serif text-base md:text-xl tracking-tighter lowercase ${textBase} hover:opacity-70 transition-opacity shrink-0 cursor-pointer py-2 pr-2`}
          >
            words of life
          </Link>

          {/* Desktop nav — dropdowns */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isActivePath(item.path, location.pathname);
              const hasDropdown = !!item.dropdown;
              const isOpen = activeDropdown === item.label;

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasDropdown && openDropdown(item.label)}
                  onMouseLeave={() => hasDropdown && closeDropdown()}
                >
                  <Link
                    to={item.path}
                    className={`relative flex items-center gap-1 px-3 py-2 rounded-full font-sans text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 ${active
                      ? 'text-harvest-orange'
                      : `${textBase} hover:text-harvest-orange`
                      } ${isOpen ? 'bg-soft-linen/5' : ''}`}
                  >
                    {item.label}
                    {hasDropdown && (
                      <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-2.5 h-2.5 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    )}
                    {active && !hasDropdown && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute -bottom-0.5 left-3 right-3 h-[2px] bg-harvest-orange rounded-full"
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {isOpen && hasDropdown && (
                      <Dropdown
                        items={item.dropdown!}
                        onClose={() => setActiveDropdown(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right-side CTAs + Hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsPlanVisitOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-harvest-orange/85 active:scale-95 transition-all"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Plan a Visit</span>
            </button>

            <Link
              to="/watch"
              className={`hidden md:inline-flex items-center gap-1.5 px-4 md:px-5 py-2 rounded-full border font-sans text-[10px] uppercase tracking-[0.2em] font-bold transition-all active:scale-95 ${lightMode
                ? 'border-midnight-teal/30 text-midnight-teal hover:bg-midnight-teal hover:text-soft-linen'
                : 'border-soft-linen/30 text-soft-linen hover:bg-soft-linen/10'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse shrink-0" />
              <span>Watch Live</span>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="group flex lg:hidden items-center gap-2 cursor-pointer ml-1 py-1 px-1"
            >
              <span className={`hidden md:block font-sans text-[10px] uppercase tracking-[0.25em] font-bold ${textBase} group-hover:text-harvest-orange transition-colors`}>
                Menu
              </span>
              <div className="flex flex-col gap-[5px] w-5 items-end">
                <span className={`w-full h-[1.5px] rounded-full transition-all duration-300 group-hover:bg-harvest-orange ${lightMode ? 'bg-midnight-teal' : 'bg-soft-linen'}`} />
                <span className={`w-3 h-[1.5px] rounded-full transition-all duration-300 group-hover:bg-harvest-orange group-hover:w-5 ${lightMode ? 'bg-midnight-teal' : 'bg-soft-linen'}`} />
                <span className={`w-full h-[1.5px] rounded-full transition-all duration-300 group-hover:bg-harvest-orange ${lightMode ? 'bg-midnight-teal' : 'bg-soft-linen'}`} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-SCREEN MENU (mobile + hamburger) ──────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: 'circle(0% at calc(100% - 60px) 36px)' }}
            animate={{ clipPath: 'circle(200% at calc(100% - 60px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 60px) 36px)' }}
            transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-[60] bg-midnight-teal text-soft-linen flex flex-col overflow-hidden"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 md:px-14 py-6 md:py-8 shrink-0">
              <Link
                to="/"
                onClick={(e) => { setMenuOpen(false); handleLogoClick(e); }}
                className="font-serif text-lg md:text-2xl tracking-tighter lowercase text-soft-linen hover:text-harvest-orange transition-colors cursor-pointer"
              >
                words of life
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu"
                className="group flex items-center gap-3 cursor-pointer">
                <span className="font-sans text-[11px] uppercase tracking-[0.25em] font-bold text-soft-linen/60 group-hover:text-harvest-orange transition-colors">Close</span>
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <span className="absolute w-full h-[1.5px] bg-soft-linen group-hover:bg-harvest-orange rotate-45 transition-colors rounded-full" />
                  <span className="absolute w-full h-[1.5px] bg-soft-linen group-hover:bg-harvest-orange -rotate-45 transition-colors rounded-full" />
                </div>
              </button>
            </div>

            {/* Service quickline */}
            <div className="px-6 md:px-14 mb-6 shrink-0">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-soft-linen/10 bg-soft-linen/5">
                <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse" />
                <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-soft-linen/60 font-bold">
                  Sunday • 10:00 AM & 2:00 PM • Greenhills, San Juan
                </span>
              </div>
            </div>

            {/* Menu body */}
            <div className="flex-1 overflow-y-auto px-6 md:px-14 pb-8">
              <div className="max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
                {navItems.filter(n => n.dropdown).map((group, gi) => (
                  <motion.div
                    key={gi}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + gi * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col"
                  >
                    {/* Section heading = links to page */}
                    <Link
                      to={group.path}
                      onClick={() => setMenuOpen(false)}
                      className="text-harvest-orange uppercase tracking-[0.35em] text-[9px] font-bold mb-5 block border-b border-soft-linen/10 pb-2 hover:text-harvest-orange/70 transition-colors"
                    >
                      {group.label}
                    </Link>
                    <div className="flex flex-col gap-1">
                      {group.dropdown!.map((item, ii) => (
                        <Link
                          key={ii}
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className="group flex flex-col py-3 border-b border-soft-linen/5 last:border-b-0"
                        >
                          <span className="font-serif text-2xl md:text-3xl text-soft-linen group-hover:text-harvest-orange transition-colors duration-200 leading-tight">
                            {item.label}
                          </span>
                          <span className="font-sans text-[10px] text-soft-linen/35 mt-0.5 tracking-wide">
                            {item.desc}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Flat nav items (Give, Contact, etc.) */}
                {navItems.filter(n => !n.dropdown && n.path !== '/').length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + navItems.filter(n => n.dropdown).length * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="flex flex-col"
                  >
                    <span className="text-harvest-orange uppercase tracking-[0.35em] text-[9px] font-bold mb-5 block border-b border-soft-linen/10 pb-2">
                      More
                    </span>
                    <div className="flex flex-col gap-1">
                      {navItems.filter(n => !n.dropdown && n.path !== '/').map((item, ii) => (
                        <Link
                          key={ii}
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className="group flex flex-col py-3 border-b border-soft-linen/5 last:border-b-0"
                        >
                          <span className="font-serif text-2xl md:text-3xl text-soft-linen group-hover:text-harvest-orange transition-colors duration-200 leading-tight">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer CTAs */}
              <div className="max-w-5xl border-t border-soft-linen/10 mt-10 md:mt-14 pt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    onClick={() => { setMenuOpen(false); setTimeout(() => setIsPlanVisitOpen(true), 300); }}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-harvest-orange/90 active:scale-95 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Plan a Visit
                  </motion.button>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}>
                    <Link
                      to="/watch"
                      onClick={() => setMenuOpen(false)}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-soft-linen/25 text-soft-linen font-sans text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-soft-linen/10 active:scale-95 transition-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse" />
                      Watch Live
                    </Link>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
                    className="font-sans text-[10px] text-soft-linen/30 uppercase tracking-widest ml-auto hidden md:block"
                  >
                    Estd. 2002 · Greenhills, San Juan
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlanVisitModal isOpen={isPlanVisitOpen} onClose={() => setIsPlanVisitOpen(false)} />

      {/* ── MOBILE BOTTOM CTA BAR ──────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden px-3 pb-4 pt-2 bg-gradient-to-t from-midnight-teal/95 to-midnight-teal/0 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => setIsPlanVisitOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[9px] uppercase tracking-[0.15em] font-bold active:scale-95 transition-all shadow-lg shadow-harvest-orange/30"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Plan a Visit
          </button>
          <Link
            to="/experience#schedule"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-soft-linen/30 bg-midnight-teal/80 backdrop-blur-sm text-soft-linen font-sans text-[9px] uppercase tracking-[0.15em] font-bold active:scale-95 transition-all"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            See Schedule
          </Link>
          <Link
            to="/watch"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-full border border-soft-linen/30 bg-midnight-teal/80 backdrop-blur-sm text-soft-linen font-sans text-[9px] uppercase tracking-[0.15em] font-bold active:scale-95 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse shrink-0" />
            Watch Live
          </Link>
        </div>
      </div>
    </>
  );
}