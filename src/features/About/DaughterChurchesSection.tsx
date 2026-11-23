import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Region = 'Luzon' | 'Visayas' | 'Mindanao';

interface Church {
  name: string;
  lead: string;
  address: string;      // display address (city / municipality, province)
  lat: number;          // decimal latitude
  lng: number;          // decimal longitude
  verified: boolean;    // true = at least 2 independent sources agree on location
  // Optional pixel nudge (% of container) to separate crowded pins:
  nudgeX?: number;      // extra % to add to computed x
  nudgeY?: number;      // extra % to add to computed y
}

// ─────────────────────────────────────────────────────────────────────────────
// MAP PROJECTION CONFIG
//
// HOW TO PICK REFERENCE POINTS:
// 1. Open the region map image in a browser or inspect the rendered card.
// 2. Identify two geographically distinct reference landmarks on the relief map
//    with known real-world lat/lng (e.g., Baguio City in Northern Luzon and
//    Batangas City in Southern Luzon).
// 3. Measure their (x%, y%) position on the cropped map card.
// 4. Record those as refA and refB below.
// 5. The linear formula:  x% = refA.x + (lng - refA.lng) * scaleX + nudgeX
//                         y% = refA.y + (lat - refA.lat) * scaleY + nudgeY
//    where scaleX = (refB.x - refA.x) / (refB.lng - refA.lng)
//          scaleY = (refB.y - refA.y) / (refB.lat - refA.lat)
// ─────────────────────────────────────────────────────────────────────────────
interface RefPoint { lat: number; lng: number; x: number; y: number; }
interface MapConfig { refA: RefPoint; refB: RefPoint; }

const MAP_CONFIG: Record<Region, MapConfig> = {
  // Luzon relief map crop:
  // Baguio in the Cordillera mountains (x=47.0%, y=31.0%)
  // Batangas City along Batangas Bay (x=45.0%, y=69.5%)
  Luzon: {
    refA: { lat: 16.4164, lng: 120.5931, x: 47.0, y: 31.0 }, // Baguio City
    refB: { lat: 13.7543, lng: 121.0549, x: 45.0, y: 69.5 }, // Batangas City
  },

  // Visayas relief map crop:
  // Ormoc City at Ormoc Bay on Leyte (x=76.5%, y=47.0%)
  // Libagon on Southern Leyte mainland (x=79.5%, y=64.0%)
  Visayas: {
    refA: { lat: 11.0064, lng: 124.6075, x: 76.5, y: 47.0 }, // Ormoc City
    refB: { lat: 10.3000, lng: 125.0500, x: 79.5, y: 64.0 }, // Libagon, S. Leyte
  },

  // Mindanao relief map crop:
  // Davao City along the western shore of Davao Gulf (x=71.0%, y=74.0%)
  // Pendolonan, Lala / Lanao del Norte on Panguil Bay (x=39.0%, y=49.0%)
  Mindanao: {
    refA: { lat: 7.0731, lng: 125.6128, x: 71.0, y: 74.0 }, // Davao City
    refB: { lat: 7.9403, lng: 123.8119, x: 39.0, y: 49.0 }, // Pendolonan, Lala
  },
};

/** Convert real-world lat/lng to % position on the image (0–100). */
function latLngToPercent(
  lat: number,
  lng: number,
  region: Region,
  nudgeX = 0,
  nudgeY = 0
): { x: number; y: number } {
  const { refA, refB } = MAP_CONFIG[region];
  const scaleX = (refB.x - refA.x) / (refB.lng - refA.lng);
  const scaleY = (refB.y - refA.y) / (refB.lat - refA.lat);
  const x = refA.x + (lng - refA.lng) * scaleX + nudgeX;
  const y = refA.y + (lat - refA.lat) * scaleY + nudgeY;
  return { x, y };
}

// ─────────────────────────────────────────────────────────────────────────────
// CHURCH DATA  (sources noted inline; see verification table in task output)
// ─────────────────────────────────────────────────────────────────────────────
const regionChurches: Record<Region, Church[]> = {
  Luzon: [
    {
      name: 'San Juan Main Church',
      lead: 'Pastor Josef Zabarte',
      address: 'Greenhills Shopping Center, San Juan City, Metro Manila',
      lat: 14.5994,
      lng: 121.0502,
      verified: true,
      nudgeX: -1.5,
      nudgeY: 0.5,
    },
    {
      name: 'Baguio Church',
      lead: 'Pastor Ramon Carbonell',
      address: 'Baguio City, Benguet',
      lat: 16.4164,
      lng: 120.5931,
      verified: true,
      nudgeX: 0.5,
      nudgeY: 0,
    },
    {
      name: 'Batangas Church',
      lead: 'Pastor Roderick Mercado',
      address: 'Batangas City, Batangas',
      lat: 13.7543,
      lng: 121.0549,
      verified: true,
      nudgeX: -0.5,
      nudgeY: 0,
    },
    {
      name: 'Sto. Tomas Church',
      lead: 'Pastor Sonny Feranil',
      address: 'Sto. Tomas, Batangas',
      lat: 14.1079,
      lng: 121.1414,
      verified: true,
      nudgeX: 0.5,
      nudgeY: -0.5,
    },
    {
      name: 'Caba Church',
      lead: 'Pastor Micah Bernardine',
      address: 'Caba, La Union',
      lat: 16.4316,
      lng: 120.3446,
      verified: true,
      nudgeX: -2.5,
      nudgeY: 0,
    },
    {
      name: 'Marikina Church',
      lead: 'Pastor Jude Orbiso',
      address: 'Marikina City, Metro Manila',
      lat: 14.6373,
      lng: 121.0917,
      verified: true,
      nudgeX: 1.0,
      nudgeY: -0.5,
    },
    {
      name: 'Luzon Ave Church',
      lead: 'Pastor Jimmy Velasquez',
      address: 'Luzon Avenue, Quezon City, Metro Manila',
      lat: 14.6677,
      lng: 121.0694,
      verified: true,
      nudgeX: -0.5,
      nudgeY: -1.5,
    },
    {
      name: 'Binangonan Church',
      lead: 'Pastor Jezz Carillo',
      address: 'Binangonan, Rizal',
      lat: 14.4514,
      lng: 121.1919,
      verified: true,
      nudgeX: 1.0,
      nudgeY: 0,
    },
  ],

  Visayas: [
    {
      name: 'Palompon Church',
      lead: 'Pastor Tony Monencillo',
      address: 'Palompon, Leyte',
      lat: 11.0478,
      lng: 124.3825,
      verified: true,
      nudgeX: -1.5,
      nudgeY: -0.5,
    },
    {
      name: 'Libjo Church',
      lead: 'Pastor Danilo Meralles',
      address: 'Libjo, Dinagat Islands',
      lat: 10.1959,
      lng: 125.5328,
      verified: true,
      nudgeX: 3.5,
      nudgeY: -2.5,
    },
    {
      name: 'Liloan Church',
      lead: 'Pastor Hermie Garbe',
      address: 'Liloan, Southern Leyte',
      lat: 10.1614,
      lng: 125.1303,
      verified: true,
      nudgeX: 1.0,
      nudgeY: 1.5,
    },
    {
      name: 'Libagon Church',
      lead: 'Pastor Hermie Garbe',
      address: 'Libagon, Southern Leyte',
      lat: 10.3000,
      lng: 125.0500,
      verified: true,
      nudgeX: 0,
      nudgeY: 0,
    },
    {
      name: 'Ormoc Church',
      lead: 'Pastor Jim Fantonial',
      address: 'Ormoc City, Leyte',
      lat: 11.0064,
      lng: 124.6075,
      verified: true,
      nudgeX: 0,
      nudgeY: 0,
    },
    {
      name: 'Benabaye Church',
      lead: 'Pastor Dindo Fantonial',
      address: 'Benabaye (Merida), Leyte',
      lat: 10.8711,
      lng: 124.5015,
      verified: true,
      nudgeX: -1.5,
      nudgeY: -1.0,
    },
    {
      name: 'RM Tan Church',
      lead: 'Pastor Novie Pajaron',
      address: 'Barangay R.M. Tan, Ormoc City, Leyte',
      lat: 11.0755,
      lng: 124.5258,
      verified: true,
      nudgeX: -0.5,
      nudgeY: -1.5,
    },
    {
      name: 'Elijan Church',
      lead: 'Pastor Rudy Sarco',
      address: 'Barangay Elijan, Samar (approximate)',
      lat: 11.9263,
      lng: 124.4492,
      verified: false,
    },
    {
      name: 'Sta. Rita Church',
      lead: 'Pastor Nicasio Orbiso',
      address: 'Sta. Rita, Samar',
      lat: 11.4500,
      lng: 124.9400,
      verified: true,
      nudgeX: 3.5,
      nudgeY: 2.5,
    },
    {
      name: 'Sto. Niño Western Samar Church',
      lead: 'Pastor Nicasio Orbiso',
      address: 'Sto. Niño, Samar',
      lat: 11.9263,
      lng: 124.4492,
      verified: true,
      nudgeX: 7.5,
      nudgeY: 1.5,
    },
  ],

  Mindanao: [
    {
      name: 'Davao Church',
      lead: 'Pastor Nilo Nool',
      address: 'Davao City, Davao del Sur',
      lat: 7.0731,
      lng: 125.6128,
      verified: true,
      nudgeX: 0,
      nudgeY: 0,
    },
    {
      name: 'Pendulonan Church',
      lead: 'Pastor Reynante Yango',
      address: 'Barangay Pendolonan, Lala, Lanao del Norte',
      lat: 7.9403,
      lng: 123.8119,
      verified: true,
      nudgeX: -1.0,
      nudgeY: 0,
    },
    {
      name: 'Lanao del Norte Church',
      lead: 'Pastor Reynante Yango',
      address: 'Lanao del Norte',
      lat: 7.9500,
      lng: 123.9100,
      verified: true,
      nudgeX: 1.0,
      nudgeY: -1.0,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAP IMAGES
// ─────────────────────────────────────────────────────────────────────────────
const regionImages: Record<Region, string> = {
  Luzon:    'https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261476/luzon-map_dqxcac.jpg',
  Visayas:  'https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261481/visayas-map_tgr3wj.png',
  Mindanao: 'https://res.cloudinary.com/ldbgnurm/image/upload/f_auto,q_auto:best,w_1200/v1784261480/mindanao-map_mfx6mc.png',
};

// ─────────────────────────────────────────────────────────────────────────────
// PIN DIALOG COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface PinDialogProps {
  church: Church;
  /** Whether the dialog should flip above or below the pin dot */
  flipDown: boolean;
  /** Whether the dialog should flip left */
  flipLeft: boolean;
}

function PinDialog({ church, flipDown, flipLeft }: PinDialogProps) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${church.lat},${church.lng}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: flipDown ? -6 : 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: flipDown ? -6 : 6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        // Horizontal: default center-left, flip when near right edge
        left: flipLeft ? 'auto' : '50%',
        right: flipLeft ? '50%' : 'auto',
        transform: flipLeft ? 'translateX(50%)' : 'translateX(-50%)',
        // Vertical: above pin by default, below when near top edge
        bottom: flipDown ? 'auto' : 'calc(100% + 10px)',
        top: flipDown ? 'calc(100% + 10px)' : 'auto',
        zIndex: 50,
        pointerEvents: 'auto',
        minWidth: '180px',
        maxWidth: '220px',
      }}
      role="tooltip"
    >
      {/* Dialog box */}
      <div
        style={{
          background: '#002E38',
          border: '1px solid rgba(236, 102, 44, 0.5)',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(236,102,44,0.1)',
          position: 'relative',
        }}
      >
        {/* Tiny arrow — points toward the pin */}
        <div
          style={{
            position: 'absolute',
            [flipDown ? 'top' : 'bottom']: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            [flipDown ? 'borderBottom' : 'borderTop']: '6px solid rgba(236, 102, 44, 0.5)',
          }}
        />

        {/* CHURCH label */}
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#EC662C',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Church
        </span>

        {/* Church name */}
        <h4
          style={{
            fontFamily: 'Vogun, serif',
            fontSize: '15px',
            color: '#E6EDEF',
            margin: '0 0 4px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {church.name}
        </h4>

        {/* Pastor */}
        <p
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(230,237,239,0.45)',
            margin: '0 0 6px 0',
          }}
        >
          {church.lead}
        </p>

        {/* Address */}
        <p
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '10px',
            color: 'rgba(230,237,239,0.65)',
            margin: '0 0 8px 0',
            lineHeight: 1.4,
          }}
        >
          {church.address}
        </p>

        {/* Get Directions link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#EC662C',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          Get Directions ↗
        </a>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIN BUTTON COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface MapPinProps {
  church: Church;
  region: Region;
  activePin: string | null;
  setActivePin: (name: string | null) => void;
}

function MapPin({ church, region, activePin, setActivePin }: MapPinProps) {
  const { x, y } = latLngToPercent(
    church.lat,
    church.lng,
    region,
    church.nudgeX ?? 0,
    church.nudgeY ?? 0
  );

  const isOpen = activePin === church.name;

  // Decide dialog flip direction based on position on the image
  const flipDown = y < 20;
  const flipLeft = x > 72;

  const handleClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setActivePin(isOpen ? null : church.name);
    },
    [isOpen, church.name, setActivePin]
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isOpen ? 40 : 20,
      }}
    >
      {/* 44 × 44 px invisible tap target — centred over the visual dot */}
      <button
        aria-label={church.name}
        aria-expanded={isOpen}
        onClick={handleClick}
        onMouseEnter={() => setActivePin(church.name)}
        onMouseLeave={() => {
          if (activePin === church.name) {
            setActivePin(null);
          }
        }}
        onFocus={() => setActivePin(church.name)}
        onBlur={() => {
          if (activePin === church.name) {
            setActivePin(null);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          outline: 'none',
        }}
        className="group focus-visible:ring-2 focus-visible:ring-harvest-orange/80 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent rounded-full"
      >
        {/* Hover glow ring */}
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'rgba(236,102,44,0)',
            transition: 'background 0.2s',
          }}
          className="group-hover:!bg-harvest-orange/15"
        />

        {/* Visual dot: white outline + orange fill */}
        <motion.span
          animate={{
            scale: isOpen ? 1.4 : 1,
            boxShadow: isOpen
              ? '0 0 0 3px rgba(236,102,44,0.4), 0 0 12px rgba(236,102,44,0.5)'
              : '0 0 0 2px #fff',
          }}
          whileHover={{ scale: 1.35 }}
          transition={{ duration: 0.18 }}
          style={{
            display: 'block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#EC662C',
            boxShadow: '0 0 0 2px #fff',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </button>

      {/* Dialog — rendered via AnimatePresence for clean exit animation */}
      <AnimatePresence>
        {isOpen && (
          <PinDialog
            church={church}
            flipDown={flipDown}
            flipLeft={flipLeft}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function DaughterChurchesSection() {
  const [activeRegion, setActiveRegion] = useState<Region>('Luzon');
  const [activePin, setActivePin] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const regions: Region[] = ['Luzon', 'Visayas', 'Mindanao'];

  const churches = regionChurches[activeRegion];
  const verifiedChurches = churches.filter((c) => c.verified);

  // Close pin when clicking the map background (not a pin button)
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        mapContainerRef.current &&
        !mapContainerRef.current.contains(e.target as Node)
      ) {
        setActivePin(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Reset active pin when switching regions
  const handleRegionChange = (r: Region) => {
    setActiveRegion(r);
    setActivePin(null);
  };

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
              onClick={() => handleRegionChange(r)}
              className={`px-5 md:px-7 py-2.5 rounded-full font-sans text-[10px] uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                activeRegion === r
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

          {/* Map card with pins */}
          <div
            ref={mapContainerRef}
            className="relative h-[300px] md:h-[500px] rounded-2xl overflow-hidden"
            onClick={() => setActivePin(null)}
          >
            {/* Map image & pins layer (animates together on region switch) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRegion}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0"
              >
                <img
                  src={regionImages[activeRegion]}
                  alt={`Map of the Philippines — ${activeRegion}`}
                  className="w-full h-full object-cover"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/90 via-deep-teal/30 to-transparent pointer-events-none" />

                {/* ── MAP PINS ── */}
                {verifiedChurches.map((church) => (
                  <MapPin
                    key={church.name}
                    church={church}
                    region={activeRegion}
                    activePin={activePin}
                    setActivePin={setActivePin}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Bottom-left region label */}
            <div className="absolute bottom-6 left-6 pointer-events-none z-30">
              <span className="font-sans text-[9px] uppercase tracking-[0.4em] text-harvest-orange font-bold block mb-1">
                Region
              </span>
              <span className="font-serif text-4xl text-soft-linen">{activeRegion}</span>
              <span className="font-sans text-sm text-soft-linen/50 block mt-1">
                {churches.length} churches
              </span>
            </div>
          </div>

          {/* Church list (unchanged) */}
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
                      <p className="font-sans text-[10px] uppercase tracking-widest text-soft-linen/40 mt-0.5">
                        {church.lead}
                      </p>
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
