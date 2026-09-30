// ─── Plan Visit: View ─────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlanVisitViewModel } from '../features/PlanVisit/usePlanVisitViewModel';

interface PlanVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const expectations = [
  {
    title: 'Know God',
    desc: "Every Sunday is an invitation.",
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Find Freedom',
    desc: "You were never meant to do life alone.",
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    title: 'Discover Purpose',
    desc: "You were made for more.",
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  {
    title: 'Make a Difference',
    desc: "Your life can change others.",
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  }
];

const getNextThreeSundays = () => {
  const dates = [];
  const d = new Date();
  // If today is Sunday (0), it stays today. Otherwise it moves to the next Sunday.
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));

  for (let i = 0; i < 3; i++) {
    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const isoDate = d.toISOString().split('T')[0];
    dates.push({ label: `Sunday, ${formatted}`, value: isoDate });
    d.setDate(d.getDate() + 7);
  }
  return dates;
};

const PlanVisitModal = ({ isOpen, onClose }: PlanVisitModalProps) => {
  const vm = usePlanVisitViewModel();

  // Reset the form whenever the modal is closed
  useEffect(() => {
    if (!isOpen) vm.reset();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-midnight-teal/95 backdrop-blur-xl"
        >
          {/* Backdrop Close */}
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

          <motion.div
            initial={{ y: 50, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.95 }}
            className="bg-soft-linen text-midnight-teal w-full mx-auto max-w-2xl md:max-w-5xl rounded-2xl md:rounded-[40px] overflow-y-auto md:overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row max-h-[95vh] md:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── LEFT: FORM / CONFIRMATION ── */}
            <div className="flex-1 p-6 sm:p-8 md:p-16 flex flex-col justify-center relative min-h-auto md:min-h-[600px]">
              <AnimatePresence mode="wait">

                {/* ── STEP 1: Form ── */}
                {vm.step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <span className="text-harvest-orange uppercase tracking-[0.4em] text-[9px] sm:text-[10px] font-bold mb-2 sm:mb-4 block">
                      Step 01
                    </span>
                    <h2
                      className="text-2xl sm:text-3xl md:text-6xl font-serif tracking-tighter mb-4 sm:mb-8 lowercase leading-[0.9]"
                      style={{ fontFamily: 'Vogun, serif' }}
                    >
                      we'll save <br className="hidden md:block" /> a seat.
                    </h2>

                    <form onSubmit={vm.handleSubmit} className="space-y-5">
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                            First Name *
                          </label>
                          <input
                            name="first_name"
                            required
                            value={vm.form.first_name}
                            onChange={vm.handleChange}
                            placeholder="First name"
                            className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal placeholder:text-midnight-teal/30 transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                            Last Name *
                          </label>
                          <input
                            name="last_name"
                            required
                            value={vm.form.last_name}
                            onChange={vm.handleChange}
                            placeholder="Last name"
                            className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal placeholder:text-midnight-teal/30 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                          Email *
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={vm.form.email}
                          onChange={vm.handleChange}
                          placeholder="your@email.com"
                          className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal placeholder:text-midnight-teal/30 transition-colors"
                        />
                      </div>

                      {/* Attend Date */}
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                          Which Sunday? *
                        </label>
                        <select
                          name="attend_date"
                          required
                          value={vm.form.attend_date}
                          onChange={vm.handleChange}
                          className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal transition-colors appearance-none"
                        >
                          <option value="">Select a date</option>
                          {getNextThreeSundays().map(date => (
                            <option key={date.value} value={date.value}>
                              {date.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Service */}
                      <div className="flex flex-col gap-1">
                        <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                          Preferred Service *
                        </label>
                        <select
                          name="service"
                          required
                          value={vm.form.service}
                          onChange={vm.handleChange}
                          className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal transition-colors appearance-none"
                        >
                          <option value="">Select a service</option>
                          <option value="sunday-10am">Sunday 10:00 AM — English</option>
                          <option value="sunday-2pm">Sunday 2:00 PM — Tagalog</option>
                          <option value="sunday-4pm">Sunday 4:00 PM — English</option>
                        </select>
                      </div>

                      {/* Adults & Kids */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                            Adults
                          </label>
                          <input
                            name="adults"
                            type="number"
                            min="1"
                            max="20"
                            value={vm.form.adults}
                            onChange={vm.handleChange}
                            className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal transition-colors"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                            Kids
                          </label>
                          <input
                            name="kids"
                            type="number"
                            min="0"
                            max="20"
                            value={vm.form.kids}
                            onChange={vm.handleChange}
                            className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-lg md:rounded-xl border border-midnight-teal/10 bg-white focus:outline-none focus:border-harvest-orange font-sans text-xs sm:text-sm text-midnight-teal transition-colors"
                          />
                        </div>
                      </div>

                      {/* Visitor Status */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-midnight-teal/60">
                          I am a…
                        </label>
                        <div className="flex gap-2 sm:gap-3">
                          {(
                            [
                              { value: 'first_time', label: 'First-time Guest' },
                              { value: 'returning', label: 'Returning Guest' },
                            ] as const
                          ).map(({ value, label }) => (
                            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${vm.form.guestType === value
                                    ? 'border-harvest-orange bg-harvest-orange'
                                    : 'border-midnight-teal/20 group-hover:border-harvest-orange/50'
                                  }`}
                              >
                                {vm.form.guestType === value && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <input
                                type="radio"
                                name="guestType"
                                value={value}
                                checked={vm.form.guestType === value}
                                onChange={vm.handleChange}
                                className="sr-only"
                              />
                              <span className="font-sans text-xs sm:text-sm text-midnight-teal">
                                {label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Error message */}
                      {vm.error && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 font-sans text-xs bg-red-50 border border-red-200 rounded-lg px-4 py-2.5"
                        >
                          {vm.error}
                        </motion.p>
                      )}

                      <motion.button
                        type="submit"
                        disabled={vm.isSubmitting}
                        whileHover={vm.isSubmitting ? {} : { scale: 1.02 }}
                        whileTap={vm.isSubmitting ? {} : { scale: 0.98 }}
                        className="mt-3 sm:mt-2 w-full py-3 sm:py-4 rounded-lg md:rounded-xl bg-harvest-orange text-midnight-teal font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-harvest-orange/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {vm.isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving your seat…
                          </>
                        ) : (
                          'Continue to Guide'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>

                ) : (
                  /* ── STEP 2: Success ── */
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-harvest-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-harvest-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2
                      className="text-4xl md:text-5xl font-serif tracking-tighter mb-4 lowercase leading-none"
                      style={{ fontFamily: 'Vogun, serif' }}
                    >
                      See you soon.
                    </h2>
                    <p className="text-midnight-teal/60 mb-10 text-sm md:text-base leading-relaxed italic max-w-xs mx-auto">
                      "A member of our Welcome Team will be looking out for you near the front doors."
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full border border-midnight-teal/10 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-midnight-teal hover:text-soft-linen transition-all"
                    >
                      Got it, Thanks
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: WHAT TO EXPECT ── */}
            <div className="bg-midnight-teal flex-1 p-6 sm:p-8 md:p-16 text-soft-linen flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5">
              <span className="text-harvest-orange uppercase tracking-[0.4em] text-[8px] sm:text-[9px] font-bold mb-4 sm:mb-8 md:mb-12 block opacity-50">
                What to expect
              </span>
              <div className="space-y-4 sm:space-y-6 md:space-y-12">
                {expectations.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-3 sm:gap-5 md:gap-8"
                  >
                    <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-2xl bg-white/5 flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-harvest-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-lg md:text-2xl mb-1 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] md:text-xs text-soft-linen/40 leading-relaxed font-sans max-w-xs">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-midnight-teal md:text-soft-linen/20 hover:text-harvest-orange transition-colors z-50 p-2"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlanVisitModal;