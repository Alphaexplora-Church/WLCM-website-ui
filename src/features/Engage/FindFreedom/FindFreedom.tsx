import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../../../components/Navigation';
import { useFindFreedomViewModel } from './viewmodels/useFindFreedomViewModel';

const FindFreedom = () => {
  const { form, isSubmitted, isLoading, error, programs, handleChange, handleSubmit, handleReset } =
    useFindFreedomViewModel();
  const [activeStage, setActiveStage] = useState<number>(0);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const toggleCard = (index: number) => {
    setExpandedCard((prev) => (prev === index ? null : index));
  };

  const activeProgram = programs[activeStage] || programs[0];

  const scrollToSignup = () => {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-midnight-teal selection:bg-harvest-orange selection:text-soft-linen relative min-h-screen">
      <Navigation lightMode={false} />

      <main>
        {/* ── Hero Header ──────────────────────────────────────── */}
        <section className="pt-36 pb-20 md:pt-48 md:pb-28 bg-midnight-teal">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <span className="text-harvest-orange uppercase tracking-[0.4em] text-[10px] font-bold mb-6 block">
                Your Journey Awaits
              </span>
              <h1
                className="text-5xl md:text-8xl text-soft-linen lowercase tracking-tighter mb-6"
                style={{ fontFamily: 'Vogun, serif' }}
              >
                find freedom
              </h1>
              <p className="text-soft-linen/60 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                Step into a transformative spiritual journey designed to help you
                encounter God's purpose and grow deeper in your faith.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Programs ─────────────────────────────────────────── */}
        <section className="pb-0 bg-midnight-teal">
          <div className="max-w-6xl mx-auto px-6 md:px-12">

            {/* ── DESKTOP: Balanced Split Showcase Layout (Option 1 with Equal Height Parity) ── */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_1.35fr] gap-8 items-stretch">

              {/* Left Column: Stage Selection Timeline (3 Equal-Height flex-1 Cards) */}
              <div className="flex flex-col gap-4 h-full">
                {programs.map((program, index) => {
                  const isActive = activeStage === index;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setActiveStage(index)}
                      className={`flex-1 flex flex-col justify-between p-6 xl:p-8 rounded-2xl border transition-all duration-300 cursor-pointer select-none relative group ${
                        isActive
                          ? 'border-harvest-orange/50 bg-white/[0.06] shadow-xl shadow-black/20'
                          : 'border-soft-linen/10 bg-white/[0.025] hover:border-harvest-orange/30 hover:bg-white/[0.045]'
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-harvest-orange rounded-r-full" />
                      )}

                      {/* Top content */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-harvest-orange text-[9px] uppercase tracking-[0.35em] font-bold block">
                            {program.number}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold border transition-colors ${
                              isActive
                                ? 'bg-harvest-orange/15 text-harvest-orange border-harvest-orange/30'
                                : 'bg-white/[0.04] text-soft-linen/50 border-soft-linen/10'
                            }`}
                          >
                            {program.tag}
                          </span>
                        </div>

                        <h2
                          className="text-2xl xl:text-3xl text-soft-linen tracking-tight leading-tight mb-2"
                          style={{ fontFamily: 'Vogun, serif' }}
                        >
                          {program.title}
                        </h2>

                        <p className="text-harvest-orange/80 text-xs xl:text-sm font-medium tracking-tight line-clamp-2">
                          {program.subtitle}
                        </p>
                      </div>

                      {/* Bottom status row */}
                      <div className="flex items-center justify-between pt-4 border-t border-soft-linen/10 mt-3">
                        <span className="text-soft-linen/40 text-[10px] uppercase tracking-widest font-semibold font-mono">
                          {program.duration}
                        </span>
                        <span
                          className={`text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-1.5 transition-colors ${
                            isActive ? 'text-harvest-orange' : 'text-soft-linen/40 group-hover:text-soft-linen/80'
                          }`}
                        >
                          <span>{isActive ? 'Current View' : 'Explore Stage'}</span>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Column: Prominent Visual Spotlight Stage (Equal Height) */}
              <div className="bg-white/[0.03] border border-soft-linen/10 rounded-2xl p-8 xl:p-10 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl shadow-black/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col justify-between h-full gap-6"
                  >
                    <div>
                      {/* ── High-Impact Media Slot (550px+ wide, zero-CLS) ── */}
                      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-soft-linen/10 bg-white/[0.03] select-none mb-6">
                        {activeProgram.image ? (
                          <img
                            src={activeProgram.image}
                            alt={activeProgram.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          /* Architectural Decluttered Preview Frame */
                          <div className="w-full h-full relative flex flex-col justify-between p-5 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
                            {/* Minimal corner reticles */}
                            <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-soft-linen/25 pointer-events-none" />
                            <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-soft-linen/25 pointer-events-none" />
                            <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-soft-linen/25 pointer-events-none" />
                            <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-soft-linen/25 pointer-events-none" />

                            {/* Top clean status */}
                            <div className="flex items-center justify-between relative z-10">
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-midnight-teal/90 border border-soft-linen/15 text-[8px] uppercase tracking-widest text-soft-linen/90 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse" />
                                Preview • {activeProgram.title}
                              </span>
                              <span className="text-soft-linen/35 font-mono text-[9px] uppercase tracking-widest">
                                {activeProgram.tag}
                              </span>
                            </div>

                            {/* Center subtle camera glyph */}
                            <div className="self-center flex flex-col items-center gap-2 my-auto relative z-10">
                              <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-soft-linen/10 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-soft-linen/30 stroke-[1.2]"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                              </div>
                            </div>

                            {/* Bottom clean watermark */}
                            <div className="flex items-center justify-between relative z-10 text-soft-linen/40 text-[10px] tracking-wide font-sans">
                              <span>Words of Life • Encounter Series</span>
                              <span className="uppercase tracking-widest text-[9px] font-mono">{activeProgram.duration}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Narrative & Details */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-harvest-orange text-[9px] uppercase tracking-[0.35em] font-bold">
                            Stage {activeProgram.number} / {activeProgram.duration}
                          </span>
                          <span className="text-soft-linen/20">•</span>
                          <span className="text-soft-linen/50 text-[10px] uppercase tracking-widest">
                            {activeProgram.tag}
                          </span>
                        </div>
                        <h3
                          className="text-3xl xl:text-4xl text-soft-linen tracking-tight leading-tight mb-2"
                          style={{ fontFamily: 'Vogun, serif' }}
                        >
                          {activeProgram.title}
                        </h3>
                        <p className="text-harvest-orange/90 text-sm font-medium tracking-tight mb-3">
                          {activeProgram.subtitle}
                        </p>
                        <p className="text-soft-linen/60 text-sm xl:text-base leading-relaxed mb-4">
                          {activeProgram.description}
                        </p>
                        <p className="text-harvest-orange/80 text-xs xl:text-sm italic leading-relaxed">
                          "{activeProgram.closingLine}"
                        </p>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="flex items-center justify-between pt-5 border-t border-soft-linen/10">
                      <span className="text-soft-linen/40 text-[10px] uppercase tracking-widest font-semibold font-mono">
                        {activeProgram.duration} Focus
                      </span>
                      <button
                        onClick={scrollToSignup}
                        className="px-6 py-3 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#d4581d] transition-all duration-300 shadow-md shadow-harvest-orange/20"
                      >
                        {activeProgram.cta}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>

            {/* ── MOBILE: Original Look with Image Placeholder Before Paragraph (< lg viewports) ── */}
            <div className="lg:hidden flex flex-col gap-4">
              {programs.map((program, index) => {
                const isExpanded = expandedCard === index;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => toggleCard(index)}
                    className={`group border rounded-2xl p-6 md:p-8 transition-all duration-500 bg-white/[0.03] cursor-pointer select-none flex flex-col justify-between ${
                      isExpanded
                        ? 'border-harvest-orange/40 bg-white/[0.055]'
                        : 'border-soft-linen/10 hover:border-harvest-orange/40 hover:bg-white/[0.055]'
                    }`}
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-harvest-orange text-[9px] uppercase tracking-[0.35em] font-bold block mb-2">
                            {program.number}
                          </span>
                          <h2
                            className="text-2xl md:text-3xl text-soft-linen tracking-tight leading-none"
                            style={{ fontFamily: 'Vogun, serif' }}
                          >
                            {program.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 mt-1">
                          <span className="px-3 py-1 rounded-full bg-harvest-orange/10 text-harvest-orange text-[9px] uppercase tracking-widest font-bold border border-harvest-orange/20">
                            {program.tag}
                          </span>
                          <motion.svg
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="w-4 h-4 text-soft-linen/40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </div>
                      </div>

                      {/* Subtitle */}
                      <p className="text-harvest-orange/80 text-sm font-medium tracking-tight mb-3">
                        {program.subtitle}
                      </p>

                      {/* Expandable content */}
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="content"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            {/* Mobile Preview Media Slot (Before Paragraph) */}
                            <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-soft-linen/10 bg-white/[0.03] mb-4 mt-2 select-none">
                              {program.image ? (
                                <img
                                  src={program.image}
                                  alt={program.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full relative flex flex-col justify-between p-4 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent">
                                  <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-soft-linen/25 pointer-events-none" />
                                  <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-soft-linen/25 pointer-events-none" />
                                  <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-soft-linen/25 pointer-events-none" />
                                  <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-soft-linen/25 pointer-events-none" />

                                  <div className="flex items-center justify-between relative z-10">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-midnight-teal/80 border border-soft-linen/15 text-[8px] uppercase tracking-widest text-soft-linen/80 font-mono">
                                      <span className="w-1.5 h-1.5 rounded-full bg-harvest-orange animate-pulse" />
                                      Preview • {program.title}
                                    </span>
                                    <span className="text-soft-linen/40 font-mono text-[9px] uppercase tracking-widest">
                                      {program.tag}
                                    </span>
                                  </div>

                                  <div className="self-center flex flex-col items-center gap-1.5 my-auto relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-soft-linen/10 flex items-center justify-center">
                                      <svg
                                        className="w-5 h-5 text-soft-linen/35 stroke-[1.4]"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                      </svg>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between relative z-10 text-soft-linen/40 text-[9px] font-sans">
                                    <span>WLCM • Encounter</span>
                                    <span className="uppercase tracking-widest font-mono">{program.duration}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <p className="text-soft-linen/60 text-sm leading-relaxed mb-4">
                              {program.description}
                            </p>

                            <p className="text-harvest-orange/80 text-xs italic leading-relaxed mb-6">
                              {program.closingLine}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-soft-linen/10 mt-6">
                      <span className="text-soft-linen/35 text-[10px] uppercase tracking-widest font-semibold">
                        {program.duration}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToSignup();
                        }}
                        className="px-4 py-2 rounded-full bg-harvest-orange/10 text-white text-[9px] uppercase tracking-[0.2em] font-bold border border-harvest-orange/25 hover:bg-harvest-orange hover:text-midnight-teal transition-all duration-300"
                      >
                        {program.cta}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── Sign-Up Split Section ─────────────────────────────── */}
        <section id="signup" className="mt-6 bg-midnight-teal">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto px-6 md:px-12 pb-24 md:pb-36"
          >
            {/* Split card */}
            <div className="rounded-2xl overflow-hidden border border-soft-linen/10 grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">

              {/* Left — context panel (dark) */}
              <div className="bg-white/[0.04] p-10 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-soft-linen/10">
                <div>
                  <span className="text-harvest-orange text-[9px] uppercase tracking-[0.35em] font-bold block mb-6">
                    Get Involved
                  </span>
                  <h2
                    className="text-3xl md:text-5xl text-soft-linen tracking-tight leading-[1.05] mb-5"
                    style={{ fontFamily: 'Vogun, serif' }}
                  >
                    Ready to begin?
                  </h2>
                  <p className="text-soft-linen/55 text-sm leading-relaxed">
                    Fill out the form and we'll send you everything you need to
                    know about the Pre-Encounter, Encounter, and Post-Encounter programs —
                    and help you find the right fit for where you are right now.
                  </p>
                </div>

                {/* Program highlight list */}
                <div className="mt-10 md:mt-0 pt-8 border-t border-soft-linen/10 flex flex-col gap-4">
                  {programs.map((p) => (
                    <div key={p.number} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-harvest-orange/10 border border-harvest-orange/25 flex items-center justify-center shrink-0">
                        <span className="text-harvest-orange text-[9px] font-bold">{p.number}</span>
                      </div>
                      <div>
                        <p
                          className="text-soft-linen text-sm tracking-tight"
                          style={{ fontFamily: 'Vogun, serif' }}
                        >
                          {p.title}
                        </p>
                        <p className="text-soft-linen/35 text-[10px] uppercase tracking-widest">{p.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form panel (high-contrast light) */}
              <div className="bg-soft-linen p-10 md:p-14">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-5"
                    >
                      <p
                        className="text-midnight-teal text-xl tracking-tight mb-1"
                        style={{ fontFamily: 'Vogun, serif' }}
                      >
                        Your Information
                      </p>

                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                            First Name *
                          </label>
                          <input
                            name="firstName"
                            required
                            value={form.firstName}
                            onChange={handleChange}
                            placeholder="First"
                            className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal placeholder:text-midnight-teal/25 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                            Last Name *
                          </label>
                          <input
                            name="lastName"
                            required
                            value={form.lastName}
                            onChange={handleChange}
                            placeholder="Last"
                            className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal placeholder:text-midnight-teal/25 transition-all"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                          Email Address *
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal placeholder:text-midnight-teal/25 transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                          Phone Number
                        </label>
                        <input
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal placeholder:text-midnight-teal/25 transition-all"
                        />
                      </div>

                      {/* Inspiration */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                          What has inspired or moved you to start this journey with God? *
                        </label>
                        <textarea
                          name="inspiration"
                          required
                          value={form.inspiration}
                          onChange={handleChange}
                          placeholder="Share what's on your heart…"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal placeholder:text-midnight-teal/25 transition-all resize-none"
                        />
                      </div>



                      {/* How did you hear */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] uppercase tracking-[0.25em] font-bold text-midnight-teal/50">
                          How did you hear about us?
                        </label>
                        <div className="relative">
                          <select
                            name="hearAboutUs"
                            value={form.hearAboutUs}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-midnight-teal/12 bg-white focus:outline-none focus:border-harvest-orange focus:ring-2 focus:ring-harvest-orange/15 font-sans text-sm text-midnight-teal appearance-none transition-all"
                          >
                            <option value="">Select an option…</option>
                            <option value="Friend or Family Member">A Friend or Family Member</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Through Church">Through Church</option>
                            <option value="Website / Google">Website / Google</option>
                            <option value="Other">Other</option>
                          </select>
                          <svg
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-midnight-teal/35 pointer-events-none"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Error banner */}
                      {error && (
                        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                          ⚠ {error}
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={isLoading ? {} : { scale: 1.02 }}
                        whileTap={isLoading ? {} : { scale: 0.97 }}
                        className="mt-1 w-full py-4 rounded-xl bg-midnight-teal text-soft-linen font-sans text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-harvest-orange hover:text-midnight-teal transition-all duration-300 shadow-lg shadow-midnight-teal/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Sending…' : 'Get Started'}
                      </motion.button>

                      <p className="text-midnight-teal/35 font-sans text-[10px] text-center leading-relaxed">
                        We'll reach out with program details and next steps.
                      </p>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-col items-center justify-center text-center h-full py-8"
                    >
                      {/* Check icon */}
                      <div className="w-16 h-16 rounded-full bg-harvest-orange/10 border border-harvest-orange/30 flex items-center justify-center mb-6">
                        <svg
                          className="w-7 h-7 text-harvest-orange"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

                      <p
                        className="text-midnight-teal text-3xl tracking-tight mb-3"
                        style={{ fontFamily: 'Vogun, serif' }}
                      >
                        You're all set!
                      </p>
                      <p className="text-midnight-teal/60 text-sm leading-relaxed max-w-xs mb-8">
                        Thanks, {form.firstName || 'friend'}! We'll be in touch with
                        everything you need to take your next step.
                      </p>

                      <button
                        onClick={handleReset}
                        className="px-8 py-3 rounded-full border border-midnight-teal/20 text-midnight-teal font-sans text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-midnight-teal hover:text-soft-linen transition-all duration-300"
                      >
                        Submit Another
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default FindFreedom;
