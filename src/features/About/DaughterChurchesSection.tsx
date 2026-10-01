import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Region = 'Luzon' | 'Visayas' | 'Mindanao';

const regionChurches: Record<Region, { name: string; lead: string }[]> = {
  Luzon: [
    { name: "San Juan Main Church", lead: "Pastor Josef Zabarte" },
    { name: "Baguio Church", lead: "Pastor Ramon Carbonell" },
    { name: "Batangas Church", lead: "Pastor Roderick Mercado" },
    { name: "Sto. Tomas Church", lead: "Pastor Sonny Feranil" },
    { name: "Caba Church", lead: "Pastor Micah Bernardine" },
    { name: "Marikina Church", lead: "Pastor Jude Orbiso" },
    { name: "Luzon Ave Church", lead: "Pastor Jimmy Velasquez" },
    { name: "Binangonan Church", lead: "Pastor Jezz Carillo" },
  ],
  Visayas: [
    { name: "Palompon Church", lead: "Pastor Tony Monencillo" },
    { name: "Libjo Church", lead: "Pastor Danilo Meralles" },
    { name: "Liloan Church", lead: "Pastor Hermie Garbe" },
    { name: "Libagon Church", lead: "Pastor Hermie Garbe" },
    { name: "Ormoc Church", lead: "Pastor Jim Fantonial" },
    { name: "Benabaye Church", lead: "Pastor Dindo Fantonial" },
    { name: "RM Tan Church", lead: "Pastor Novie Pajaron" },
    { name: "Elijan Church", lead: "Pastor Rudy Sarco" },
    { name: "Sta. Rita Church", lead: "Pastor Nicasio Orbiso" },
    { name: "Sto. Niño Western Samar Church", lead: "Pastor Nicasio Orbiso" },
  ],
  Mindanao: [
    { name: "Davao Church", lead: "Pastor Nilo Nool" },
    { name: "Pendulonan Church", lead: "Pastor Reynante Yango" },
    { name: "Lanao del Norte Church", lead: "Pastor Reynante Yango" },
  ],
};

const regionImages: Record<Region, string> = {
  Luzon: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261476/luzon-map_dqxcac.jpg",
  Visayas: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261481/visayas-map_tgr3wj.png",
  Mindanao: "https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261480/mindanao-map_mfx6mc.png",
};

export default function DaughterChurchesSection() {
  const [activeRegion, setActiveRegion] = useState<Region>('Luzon');
  const regions: Region[] = ['Luzon', 'Visayas', 'Mindanao'];

  const churches = regionChurches[activeRegion];

  return (
    <section id="churches" className="bg-deep-teal py-24 md:py-40 relative overflow-hidden">



      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* Header */}
        <div className="mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-harvest-orange uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-4 block"
          >
            Our Nationwide Reach
          </motion.span>
          <motion.h2 className="font-serif text-5xl md:text-8xl text-soft-linen leading-[0.9] lowercase tracking-tighter">
            one family,<br /> many churches.
          </motion.h2>
        </div>

        {/* Region Tabs */}
        <div className="flex gap-2 mb-10 p-1 bg-soft-linen/5 rounded-full w-fit">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-5 md:px-7 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${activeRegion === r
                ? 'bg-harvest-orange text-midnight-teal shadow-md'
                : 'text-soft-linen/50 hover:text-soft-linen'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Church Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Featured image card */}
          <div className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeRegion}
                src={regionImages[activeRegion]}
                alt={activeRegion}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/90 via-deep-teal/30 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-harvest-orange font-bold block mb-1">Region</span>
              <span className="font-serif text-4xl text-soft-linen">{activeRegion}</span>
              <span className="font-sans text-sm text-soft-linen/50 block mt-1">{churches.length} churches</span>
            </div>
          </div>

          {/* Church list */}
          <div className="flex flex-col gap-0 h-[400px] md:h-[500px] overflow-y-auto pr-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                {churches.map((church, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between py-4 border-b border-soft-linen/10 last:border-b-0 group"
                  >
                    <div>
                      <h3 className="font-serif text-lg md:text-xl text-soft-linen group-hover:text-harvest-orange transition-colors">
                        {church.name}
                      </h3>
                      <p className="font-sans text-[10px] uppercase tracking-widest text-soft-linen/40 mt-0.5">{church.lead}</p>
                    </div>
                    <span className="text-soft-linen/20 font-serif text-2xl select-none shrink-0 ml-4">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}