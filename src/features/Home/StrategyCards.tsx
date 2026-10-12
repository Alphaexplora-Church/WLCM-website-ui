import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import PlanVisitModal from '../../components/PlanVisitModal';

/* 
 * Magazine treatment: each card = large photo + one word headline
 * Body copy is hidden until clicked — keeps it visually clean. 
 */
const cards = [
  {
    number: "01",
    title: "Know God",
    tagline: "Every sunday is an invitation.",
    body: "A warm invitation to experience a real relationship with God. Our weekend gatherings are welcoming, Bible-centered, and designed to help you encounter Jesus in a meaningful way. Whether you are exploring faith or growing deeper in your walk, there is a place for you here. ",
    ctas: [
      { label: "Plan a Visit", action: "plan-visit" },
      { label: "Join a Care Group", action: "/engage" },
    ],
    img: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=1200",
  },
  {
    number: "02",
    title: "Find Freedom",
    tagline: "You were never meant to do life alone.",
    body: "You were never meant to walk this alone. Through mentoring, Caregroups, and discipleship, we walk alongside you — in your faith, your relationships, and your personal growth. Whatever you're carrying right now, how can we help?",
    ctas: [
      { label: "Start the Journey", action: "/find-freedom" },
    ],
    img: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:good,w_1000/v1784261368/random-4_yu9wms.jpg",
  },
  {
    number: "03",
    title: "Discover Purpose",
    tagline: "You were made for more.",
    body: "Every person is created with intention. The WLCM Discipleship Journey helps you grow spiritually, understand your gifts, and discover how your life fits into God’s greater plan.",
    ctas: [
      { label: "Discover Purpose", action: "/discover-purpose" },
    ],
    img: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:good,w_1000/v1784261369/random-6_pptks6.jpg",
  },
  {
    number: "04",
    title: "Make a Difference",
    tagline: "Your life can change others.",
    body: "True joy is found when we serve others. Through our ministries and outreach opportunities, you can use your gifts and talents to impact the church and the community.",
    ctas: [
      { label: "Explore Ministries", action: "/experience#ministries" },
    ],
    img: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:good,w_1000/v1784261370/heavensound-3_rwa46l.jpg",
  },
];

const StrategyCards = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);

  return (
    <>
      <section className="py-0 bg-midnight-teal">

        {/* Section header */}
        <div className="px-6 md:px-14 lg:px-20 pt-16 md:pt-24 pb-10 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end gap-4 md:gap-0 md:justify-between"
          >
            <h2
              className="font-serif text-5xl md:text-7xl text-soft-linen lowercase tracking-tighter leading-[0.9]"
              style={{ fontFamily: 'Vogun, serif' }}
            >
              Your<br />next step.
            </h2>
            <p className="font-sans text-soft-linen/40 text-sm max-w-xs leading-relaxed italic font-light md:text-right">
              Tap a card to learn more.
            </p>
          </motion.div>
        </div>

        {/* Cards — horizontal scroll on mobile, 2-col grid on desktop */}
        <div className="px-6 md:px-14 lg:px-20 pb-16 md:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {cards.map((card, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="relative overflow-hidden rounded-2xl md:rounded-3xl cursor-pointer group"
                >
                  {/* Background photo — always fills the card, never resizes */}
                  <img
                    src={card.img}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/30 to-transparent pointer-events-none" />

                  {/* Content — drives the card height, text overlaid on photo */}
                  <div className="relative flex flex-col justify-end p-6 md:p-7" style={{ minHeight: '320px' }}>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="font-sans text-soft-linen/30 text-[10px] uppercase tracking-widest block mb-1">{card.number}</span>
                        <h3 className={`font-serif text-3xl md:text-4xl tracking-tight transition-colors duration-300 ${isOpen ? 'text-harvest-orange' : 'text-soft-linen'}`}>
                          {card.title}
                        </h3>
                        <p className="font-sans text-soft-linen/60 text-sm mt-1 italic">{card.tagline}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 mb-1 transition-all duration-300 ${isOpen ? 'bg-harvest-orange border-harvest-orange text-midnight-teal' : 'border-soft-linen/20 text-soft-linen/40'}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Expandable body */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                          className="overflow-hidden"
                        >
                          <p className="font-sans text-soft-linen/60 text-sm leading-relaxed mt-4 mb-5">
                            {card.body}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {card.ctas.map((cta, ci) =>
                              cta.action === 'plan-visit' ? (
                                <button
                                  key={ci}
                                  onClick={(e) => { e.stopPropagation(); setIsPlanVisitOpen(true); }}
                                  className="px-5 py-2 rounded-full bg-harvest-orange text-midnight-teal font-sans text-[9px] uppercase tracking-[0.2em] font-bold"
                                >
                                  {cta.label}
                                </button>
                              ) : (
                                <Link
                                  key={ci}
                                  to={cta.action}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-5 py-2 rounded-full border border-soft-linen/20 text-soft-linen font-sans text-[9px] uppercase tracking-[0.2em] font-bold hover:border-harvest-orange hover:text-harvest-orange transition-colors"
                                >
                                  {cta.label}
                                </Link>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <PlanVisitModal isOpen={isPlanVisitOpen} onClose={() => setIsPlanVisitOpen(false)} />
    </>
  );
};

export default StrategyCards;