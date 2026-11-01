import { motion, AnimatePresence } from 'framer-motion';
import type { DiscoverProgram } from '../types/discoverPurpose.types';

interface DiscoverPurposeCardProps {
  program: DiscoverProgram;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onCtaClick: () => void;
}

const DiscoverPurposeCard: React.FC<DiscoverPurposeCardProps> = ({
  program,
  index,
  isExpanded,
  onToggle,
  onCtaClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative"
    >
      <div
        onClick={onToggle}
        className={`
          relative cursor-pointer rounded-2xl border transition-all duration-500 overflow-hidden
          ${
            isExpanded
              ? 'border-harvest-orange/40 bg-white/[0.07] shadow-lg shadow-harvest-orange/5'
              : 'border-soft-linen/10 bg-white/[0.03] hover:border-soft-linen/20 hover:bg-white/[0.05]'
          }
        `}
      >
        {/* ── Collapsed Header ────────────────────────────────── */}
        <div className="p-8 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Number + tag */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-harvest-orange text-[9px] uppercase tracking-[0.35em] font-bold">
                  {program.number}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[8px] uppercase tracking-widest font-bold border transition-colors ${
                    isExpanded
                      ? 'bg-deep-teal/70 text-soft-linen border-soft-linen/30 shadow-sm'
                      : 'bg-deep-teal/40 text-soft-linen/80 border-soft-linen/15'
                  }`}
                >
                  {program.tag}
                </span>
              </div>

              {/* Title */}
              <h3
                className="text-2xl md:text-3xl text-soft-linen tracking-tight leading-tight mb-2"
                style={{ fontFamily: 'Vogun, serif' }}
              >
                {program.title}
              </h3>

              {/* Subtitle */}
              <p className="text-soft-linen/85 text-sm md:text-base font-medium tracking-tight">
                {program.subtitle}
              </p>
            </div>

            {/* Expand/collapse indicator */}
            <div
              className={`
                shrink-0 mt-2 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500
                ${
                  isExpanded
                    ? 'border-harvest-orange bg-harvest-orange/15 rotate-180'
                    : 'border-soft-linen/20 group-hover:border-harvest-orange/40'
                }
              `}
            >
              <svg
                className="w-3.5 h-3.5 text-harvest-orange transition-transform duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Expanded Content ────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-8 md:px-10 pb-10">
                {/* Divider */}
                <div className="border-t border-soft-linen/10 mb-8" />

                {/* Hook line */}
                <p
                  className="text-soft-linen/90 text-lg md:text-xl leading-relaxed mb-6 italic"
                  style={{ fontFamily: 'Vogun, serif' }}
                >
                  "{program.hookLine}"
                </p>

                {/* Description */}
                <p className="text-soft-linen/55 text-sm md:text-[15px] leading-relaxed mb-6">
                  {program.description}
                </p>

                {/* Closing line */}
                <div className="flex items-start gap-3 mb-8 pl-4 border-l-2 border-harvest-orange/40">
                  <p className="text-soft-linen/75 text-sm leading-relaxed font-medium">
                    {program.closingLine}
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCtaClick();
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[10px] uppercase tracking-[0.2em] font-bold shadow-md shadow-harvest-orange/20 hover:bg-[#d4581d] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-harvest-orange transition-all duration-300"
                >
                  <span>{program.ctaText}</span>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DiscoverPurposeCard;
