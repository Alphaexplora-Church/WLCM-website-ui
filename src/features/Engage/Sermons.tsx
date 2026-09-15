import { useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../../components/Navigation';

interface Sermon {
  title: string;
  series: string;
  duration: string;
  date: string;
  img: string;
}

interface Episode {
  title: string;
  date: string;
  duration: string;
  img: string;
}

interface SeriesItem {
  id: string;
  title: string;
  category: string;
  img: string;
  episodes: Episode[];
}

interface NowPlaying {
  title: string;
  date: string;
  duration: string;
  overview?: string;
}

type Tab = 'sermons' | 'series' | 'topics' | 'speakers';

const SERMONS_PER_PAGE = 6;

const IMAGES = [
  'https://images.pexels.com/photos/19130852/pexels-photo-19130852.jpeg',
  'https://images.pexels.com/photos/5020925/pexels-photo-5020925.jpeg',
  'https://images.pexels.com/photos/34683153/pexels-photo-34683153.jpeg',
  'https://images.pexels.com/photos/9727921/pexels-photo-9727921.jpeg',
  'https://images.pexels.com/photos/10807887/pexels-photo-10807887.jpeg',
];

const SERMON_ARCHIVE: Sermon[] = [
  { title: "service1", series: "series1", duration: "duration1", date: "date1", img: IMAGES[0] },
  { title: "service2", series: "series2", duration: "duration2", date: "date2", img: IMAGES[1] },
  { title: "service3", series: "series3", duration: "duration3", date: "date3", img: IMAGES[2] },
  { title: "service4", series: "series4", duration: "duration4", date: "date4", img: IMAGES[3] },
  { title: "service5", series: "series5", duration: "duration5", date: "date5", img: IMAGES[4] },
];

const ALL_MORE_SERMONS: Sermon[] = Array.from({ length: 10 * SERMONS_PER_PAGE }, (_, i) => ({
  title: `sermon${i + 6}`,
  series: `series${i + 6}`,
  duration: `duration${i + 6}`,
  date: `date${i + 6}`,
  img: IMAGES[i % IMAGES.length],
}));

const CATEGORIES = [
  { name: 'Faith', count: 27 },
  { name: 'Prayer', count: 19 },
  { name: 'Holy Spirit', count: 18 },
  { name: 'Parables', count: 17 },
  { name: 'Love', count: 16 },
  { name: 'Discipleship', count: 11 },
  { name: 'Jesus', count: 8 },
  { name: 'Miracles of Jesus', count: 8 },
  { name: 'Worship', count: 7 },
  { name: 'Blessed Life', count: 6 },
  { name: 'Testimony', count: 5 },
  { name: 'Joy', count: 4 },
  { name: 'Forgiveness', count: 3 },
  { name: 'Christmas', count: 3 },
  { name: 'Rest', count: 3 },
];

const SERIES_LIST: SeriesItem[] = [
  {
    id: 's1',
    title: 'Kingdom Culture',
    category: 'Faith',
    img: IMAGES[0],
    episodes: [
      { title: 'Kingdom Culture: Part 1', date: 'Aug 2026', duration: '42 min', img: IMAGES[0] },
      { title: 'Kingdom Culture: Part 2', date: 'Aug 2026', duration: '39 min', img: IMAGES[1] },
    ],
  },
  {
    id: 's2',
    title: 'Faith Over Fear',
    category: 'Faith',
    img: IMAGES[1],
    episodes: [{ title: 'Faith Over Fear', date: 'Aug 2026', duration: '41 min', img: IMAGES[1] }],
  },
  {
    id: 's3',
    title: 'The Upper Room Discourses',
    category: 'Discipleship',
    img: IMAGES[2],
    episodes: [
      { title: 'The Upper Room Discourses: Part 1', date: 'Aug 2026', duration: '48 min', img: IMAGES[2] },
      { title: 'The Upper Room Discourses: Part 2', date: 'Aug 2026', duration: '44 min', img: IMAGES[3] },
    ],
  },
  {
    id: 's4',
    title: 'Moments of Worship',
    category: 'Worship',
    img: IMAGES[4],
    episodes: [{ title: 'Moments of Worship', date: 'Aug 2026', duration: '35 min', img: IMAGES[4] }],
  },
];

const SPEAKERS = [
  { name: 'Pastor Mike', role: 'Lead Pastor', sermonCount: 42, img: IMAGES[0] },
  { name: 'Pastor Anna', role: 'Associate Pastor', sermonCount: 18, img: IMAGES[1] },
  { name: 'Pastor Ruben', role: 'Youth Pastor', sermonCount: 12, img: IMAGES[2] },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'sermons', label: 'All Sermons' },
  { id: 'series', label: 'Series' },
  { id: 'topics', label: 'Topics' },
  { id: 'speakers', label: 'Speakers' },
];

export default function Sermons() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('sermons');
  const [currentPage, setCurrentPage] = useState(1);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [openSeries, setOpenSeries] = useState<SeriesItem | null>(null);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return CATEGORIES;
    const lower = categorySearch.toLowerCase();
    return CATEGORIES.filter((c) => c.name.toLowerCase().includes(lower));
  }, [categorySearch]);

  const filteredSermons = useMemo(() => {
    let list = ALL_MORE_SERMONS;
    if (activeCategory) {
      list = list.filter((_, i) => i % CATEGORIES.length === CATEGORIES.findIndex((c) => c.name === activeCategory));
    }
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(lower) || s.series.toLowerCase().includes(lower));
    }
    return list;
  }, [activeCategory, searchQuery]);

  const filteredSeries = useMemo(() => {
    if (!activeCategory) return SERIES_LIST;
    return SERIES_LIST.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredSermons.length / SERMONS_PER_PAGE));
  const pageStart = (currentPage - 1) * SERMONS_PER_PAGE;
  const pageSermons = filteredSermons.slice(pageStart, pageStart + SERMONS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const selectCategory = (name: string | null) => {
    setActiveCategory(name);
    setCategoryOpen(false);
    setCategorySearch('');
    setCurrentPage(1);
  };

  const handleScroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector('.sermon-card') as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 20 : 260;
    const scrollAmount = cardWidth * 2;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (dir === 'right') {
      if (el.scrollLeft >= maxScroll - 5) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (el.scrollLeft <= 5) {
        el.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;
    pages.push(1);
    if (currentPage - delta > 2) pages.push('...');
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }
    if (currentPage + delta < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const openPlayer = (item: NowPlaying) => {
    setNowPlaying(item);
  };

  const closePlayer = () => {
    setNowPlaying(null);
  };

  const handleSeriesClick = (series: SeriesItem) => {
    if (series.episodes.length === 1) {
      const ep = series.episodes[0];
      openPlayer({ title: ep.title, date: ep.date, duration: ep.duration });
    } else {
      setOpenSeries(series);
    }
  };

  return (
    <>
      <Navigation />

      <section className="relative flex h-screen flex-col justify-center overflow-hidden bg-midnight-teal">
        <span
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center font-serif text-[22vw] text-soft-linen/5 whitespace-nowrap"
          aria-hidden="true"
        >
          archives
        </span>

        <div className="relative z-10 mx-auto mt-16 mb-8 max-w-7xl px-6 md:mt-20 md:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-2xl"
          >
            <span className="mb-3 block font-bold text-[10px] text-harvest-orange uppercase tracking-[0.4em]">
              The Library
            </span>
            <h2 className="font-serif text-3xl text-soft-linen lowercase tracking-tighter leading-none md:text-5xl">
              Sermon archive.
            </h2>
            <div className="mt-4 mb-3 h-[1px] w-16 bg-soft-linen/20" />
            <h3 className="font-serif text-xl text-soft-linen/70 tracking-tight md:text-3xl">
              sunday services
            </h3>
          </motion.div>
        </div>

        <div className="relative z-10 w-full">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous"
            className="absolute left-4 lg:left-8 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-soft-linen/20 bg-midnight-teal/60 text-soft-linen backdrop-blur-sm transition-colors hover:border-harvest-orange hover:bg-harvest-orange md:flex"
          >
            <span className="text-2xl leading-none">&lsaquo;</span>
          </button>

          <button
            onClick={() => handleScroll('right')}
            aria-label="Next"
            className="absolute right-4 lg:right-8 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-soft-linen/20 bg-midnight-teal/60 text-soft-linen backdrop-blur-sm transition-colors hover:border-harvest-orange hover:bg-harvest-orange md:flex"
          >
            <span className="text-2xl leading-none">&rsaquo;</span>
          </button>

          <div
            ref={scrollRef}
            className="relative overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-5 px-6 md:gap-8 md:px-12">
              {SERMON_ARCHIVE.map((sermon, i) => (
                <button
                  key={i}
                  onClick={() => openPlayer({ title: sermon.title, date: sermon.date, duration: sermon.duration })}
                  className="sermon-card group relative h-[300px] w-[200px] shrink-0 overflow-hidden rounded-[24px] border border-soft-linen/5 bg-midnight-teal text-left shadow-2xl md:h-[320px] md:w-[520px]"
                >
                  <img
                    src={sermon.img}
                    alt={sermon.title}
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/40 to-transparent opacity-90" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className="rounded-full bg-harvest-orange px-6 py-2.5 font-bold font-sans text-xs text-midnight-teal uppercase tracking-widest">
                      watch now
                    </span>
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-[1px] w-5 bg-harvest-orange" />
                      <span className="font-bold text-[8px] text-harvest-orange uppercase tracking-widest">
                        {sermon.series}
                      </span>
                    </div>
                    <h3 className="mb-3 font-serif text-lg text-soft-linen tracking-tighter transition-transform group-hover:-translate-y-1 md:text-xl">
                      {sermon.title}
                    </h3>

                    <div className="flex items-center justify-between border-t border-soft-linen/10 pt-3">
                      <div className="flex gap-3 font-sans text-[8px] text-soft-linen/40 uppercase tracking-[0.15em]">
                        <span>{sermon.date}</span>
                        <span>{sermon.duration}</span>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border border-soft-linen/20">
                        <PlayIcon className="h-3 w-3 text-soft-linen" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <h3 className="mb-4 font-serif text-2xl text-midnight-teal tracking-tight md:text-4xl">
            preachings.
          </h3>
          <p className="mb-8 max-w-xl font-sans text-sm text-midnight-teal/50">
            Explore the full library of past messages, organized and ready whenever you are.
          </p>

          <div className="mb-10 flex flex-wrap items-center gap-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`rounded-full border px-5 py-2.5 font-bold font-sans text-xs uppercase tracking-widest transition-colors ${
                  activeTab === tab.id
                    ? 'border-harvest-orange bg-harvest-orange text-midnight-teal'
                    : 'border-midnight-teal/15 text-midnight-teal/60 hover:border-harvest-orange hover:text-harvest-orange'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <div className="relative ml-auto w-full sm:w-64">
              <button
                type="button"
                onClick={() => setCategoryOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-full border border-midnight-teal/15 bg-white px-5 py-2.5 font-sans text-xs text-midnight-teal/70 uppercase tracking-widest transition-colors hover:border-harvest-orange"
              >
                <span className="truncate">{activeCategory ?? 'Filter by category'}</span>
                <svg
                  className={`h-4 w-4 shrink-0 text-midnight-teal/40 transition-transform ${categoryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {categoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-30 mt-2 w-full overflow-hidden rounded-2xl border border-midnight-teal/10 bg-white shadow-2xl"
                  >
                    <div className="border-b border-midnight-teal/10 p-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Search categories..."
                          className="w-full rounded-full border border-midnight-teal/15 bg-white px-4 py-2.5 pr-9 font-sans text-sm text-midnight-teal outline-none transition-colors focus:border-harvest-orange"
                        />
                        <svg
                          className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-midnight-teal/40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {activeCategory && (
                        <button
                          type="button"
                          onClick={() => selectCategory(null)}
                          className="flex w-full items-center px-5 py-3 font-sans text-sm text-harvest-orange hover:bg-midnight-teal/5"
                        >
                          Clear filter
                        </button>
                      )}

                      {filteredCategories.length === 0 ? (
                        <p className="px-5 py-6 text-center font-sans text-sm text-midnight-teal/40">
                          No categories found.
                        </p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => selectCategory(cat.name)}
                            className={`flex w-full items-center justify-between px-5 py-3 font-sans text-sm transition-colors hover:bg-midnight-teal/5 ${
                              activeCategory === cat.name ? 'text-harvest-orange' : 'text-midnight-teal/80'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="text-midnight-teal/30">{cat.count}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative w-full sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search sermons..."
                className="w-full rounded-full border border-midnight-teal/15 bg-white px-5 py-2.5 pr-10 font-sans text-xs text-midnight-teal outline-none transition-colors focus:border-harvest-orange"
              />
              <svg
                className="absolute right-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-midnight-teal/40"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + currentPage + (activeCategory ?? '') + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {activeTab === 'sermons' && (
                <>
                  {pageSermons.length === 0 ? (
                    <p className="mb-14 text-center font-sans text-sm text-midnight-teal/40">
                      No sermons found.
                    </p>
                  ) : (
                    <div className="mb-14 grid grid-cols-1 md:grid-cols-2">
                      {pageSermons.map((sermon, i) => (
                        <div
                          key={i}
                          className={`flex flex-col items-start gap-6 py-10 border-midnight-teal/20 sm:flex-row ${
                            i >= 2 ? 'border-t-2' : ''
                          } ${i % 2 === 0 ? 'md:pr-10 md:border-r' : 'md:pl-10'}`}
                        >
                          <button
                            onClick={() => openPlayer({ title: sermon.title, date: sermon.date, duration: sermon.duration })}
                            className="group relative h-56 w-full shrink-0 overflow-hidden rounded-xl sm:w-72"
                          >
                            <img
                              src={sermon.img}
                              alt={sermon.title}
                              className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-midnight-teal/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <span className="rounded-full bg-harvest-orange px-6 py-2.5 font-bold font-sans text-xs text-midnight-teal uppercase tracking-widest">
                                watch now
                              </span>
                            </div>
                          </button>

                          <div className="flex-1">
                            <h4 className="mb-1 font-serif text-xl text-midnight-teal md:text-2xl">
                              {sermon.title}
                            </h4>
                            <p className="mb-4 font-sans text-xs text-midnight-teal/40 uppercase tracking-widest">
                              {sermon.series}
                            </p>
                            <div className="mb-5 flex flex-col gap-1.5 font-sans text-xs text-midnight-teal/50">
                              <span>{sermon.date}</span>
                              <span>{sermon.duration}</span>
                            </div>
                            <button
                              onClick={() => openPlayer({ title: sermon.title, date: sermon.date, duration: sermon.duration })}
                              className="inline-flex items-center gap-1.5 font-bold font-sans text-xs text-harvest-orange uppercase tracking-widest transition-colors hover:text-midnight-teal"
                            >
                              see more <span>&rarr;</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pageSermons.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex h-10 items-center justify-center rounded-full border border-midnight-teal/15 px-4 font-bold font-sans text-midnight-teal/60 text-sm transition-colors hover:border-harvest-orange hover:text-harvest-orange disabled:pointer-events-none disabled:opacity-30"
                      >
                        &lsaquo; Previous
                      </button>

                      {getPageNumbers().map((page, i) =>
                        page === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-1 font-sans text-midnight-teal/40 text-sm">
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page as number)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full border font-bold font-sans text-sm transition-colors ${
                              currentPage === page
                                ? 'border-harvest-orange bg-harvest-orange text-midnight-teal'
                                : 'border-midnight-teal/15 text-midnight-teal/60 hover:border-harvest-orange hover:text-harvest-orange'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex h-10 items-center justify-center rounded-full border border-midnight-teal/15 px-4 font-bold font-sans text-midnight-teal/60 text-sm transition-colors hover:border-harvest-orange hover:text-harvest-orange disabled:pointer-events-none disabled:opacity-30"
                      >
                        Next &rsaquo;
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'series' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {filteredSeries.length === 0 ? (
                    <p className="col-span-full py-16 text-center font-sans text-sm text-midnight-teal/40">
                      No series found in this category.
                    </p>
                  ) : (
                    filteredSeries.map((series) => (
                      <button
                        key={series.id}
                        onClick={() => handleSeriesClick(series)}
                        className="group relative h-64 overflow-hidden rounded-2xl border border-midnight-teal/10 bg-midnight-teal text-left shadow-xl"
                      >
                        <img
                          src={series.img}
                          alt={series.title}
                          className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/50 to-transparent" />

                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                          <span className="mb-1.5 font-bold text-[9px] text-harvest-orange uppercase tracking-widest">
                            {series.category}
                          </span>
                          <h3 className="font-serif text-lg text-soft-linen tracking-tight">
                            Series: {series.title}
                          </h3>
                          <span className="mt-2 font-sans text-[10px] text-soft-linen/40 uppercase tracking-widest">
                            {series.episodes.length} {series.episodes.length === 1 ? 'episode' : 'episodes'}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'topics' && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setActiveTab('sermons');
                        selectCategory(cat.name);
                      }}
                      className="flex items-center justify-between rounded-xl border border-midnight-teal/10 px-5 py-4 font-sans text-sm text-midnight-teal/80 transition-colors hover:border-harvest-orange hover:text-harvest-orange"
                    >
                      <span>{cat.name}</span>
                      <span className="text-midnight-teal/30">{cat.count}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'speakers' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {SPEAKERS.map((speaker) => (
                    <div
                      key={speaker.name}
                      className="flex items-center gap-4 rounded-xl border border-midnight-teal/10 p-5"
                    >
                      <img
                        src={speaker.img}
                        alt={speaker.name}
                        className="h-16 w-16 shrink-0 rounded-full object-cover grayscale"
                      />
                      <div>
                        <h4 className="font-serif text-lg text-midnight-teal">{speaker.name}</h4>
                        <p className="font-sans text-xs text-midnight-teal/40 uppercase tracking-widest">
                          {speaker.role}
                        </p>
                        <p className="mt-1 font-sans text-xs text-midnight-teal/50">
                          {speaker.sermonCount} sermons
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {openSeries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-midnight-teal/90 p-4 backdrop-blur-sm md:p-10"
            onClick={() => setOpenSeries(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white"
            >
              <div className="flex items-start justify-between p-6 md:p-8">
                <div>
                  <span className="mb-1 block font-bold text-[10px] text-harvest-orange uppercase tracking-widest">
                    {openSeries.category}
                  </span>
                  <h2 className="font-serif text-2xl text-midnight-teal md:text-3xl">
                    Series: {openSeries.title}
                  </h2>
                </div>
                <button
                  onClick={() => setOpenSeries(null)}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-midnight-teal/15 text-midnight-teal transition-colors hover:bg-midnight-teal hover:text-soft-linen"
                >
                  &times;
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 md:px-8">
                {openSeries.episodes.map((episode, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setOpenSeries(null);
                      openPlayer({ title: episode.title, date: episode.date, duration: episode.duration });
                    }}
                    className="group relative h-48 overflow-hidden rounded-xl text-left"
                  >
                    <img
                      src={episode.img}
                      alt={episode.title}
                      className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <h4 className="font-serif text-base text-soft-linen">{episode.title}</h4>
                      <div className="mt-1 flex gap-3 font-sans text-[10px] text-soft-linen/50 uppercase tracking-widest">
                        <span>{episode.date}</span>
                        <span>{episode.duration}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nowPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-midnight-teal/90 p-4 backdrop-blur-sm md:p-10"
            onClick={closePlayer}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white"
            >
              <div className="flex justify-end p-4">
                <button
                  onClick={closePlayer}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-midnight-teal/15 text-midnight-teal transition-colors hover:bg-midnight-teal hover:text-soft-linen"
                >
                  &times;
                </button>
              </div>

              <div className="px-4 md:px-8">
                <div className="aspect-video w-full overflow-hidden rounded-xl">
                  <iframe
                    className="h-full w-full"
                    src="https://www.youtube.com/embed/Y-x0efG1seA"
                    title={nowPlaying.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="p-6 md:p-8">
                <h2 className="mb-3 font-serif text-2xl text-midnight-teal md:text-3xl">
                  {nowPlaying.title}
                </h2>
                <div className="flex gap-4 font-sans text-xs text-midnight-teal/50">
                  <span>{nowPlaying.date}</span>
                  <span>{nowPlaying.duration}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PlayIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z"
      />
    </svg>
  );
}
