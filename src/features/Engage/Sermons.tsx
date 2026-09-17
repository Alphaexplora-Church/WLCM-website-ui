import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../../components/Navigation';
import { useSermonsViewModel } from './journeys/useSermonsViewModel';
import type { SermonsTab } from './journeys/useSermonsViewModel';
import { episodeCount, formatDate, journeyLabel, partLength, partThumbnail, toMediaEmbed } from './journeys/journeys.media';

const IMAGES = [
  'https://images.pexels.com/photos/19130852/pexels-photo-19130852.jpeg',
  'https://images.pexels.com/photos/5020925/pexels-photo-5020925.jpeg',
  'https://images.pexels.com/photos/34683153/pexels-photo-34683153.jpeg',
];

const SPEAKERS = [
  { name: 'Pastor Mike', role: 'Lead Pastor', sermonCount: 42, img: IMAGES[0] },
  { name: 'Pastor Anna', role: 'Associate Pastor', sermonCount: 18, img: IMAGES[1] },
  { name: 'Pastor Ruben', role: 'Youth Pastor', sermonCount: 12, img: IMAGES[2] },
];

const TABS: { id: SermonsTab; label: string }[] = [
  { id: 'sermons', label: 'All Sermons' },
  { id: 'series', label: 'Series' },
  { id: 'topics', label: 'Topics' },
  { id: 'speakers', label: 'Speakers' },
];

export default function Sermons() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const vm = useSermonsViewModel();

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
    if (vm.currentPage - delta > 2) pages.push('...');
    for (let i = Math.max(2, vm.currentPage - delta); i <= Math.min(vm.totalPages - 1, vm.currentPage + delta); i++) {
      pages.push(i);
    }
    if (vm.currentPage + delta < vm.totalPages - 1) pages.push('...');
    if (vm.totalPages > 1) pages.push(vm.totalPages);
    return pages;
  };

  const embed = vm.nowPlaying ? toMediaEmbed(vm.nowPlaying.part.mediaUrl, vm.nowPlaying.part.mediaType) : null;

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
          {vm.heroJourneys.length > 1 && (
            <>
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
            </>
          )}

          <div
            ref={scrollRef}
            className="relative overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="mx-auto flex w-max gap-5 px-6 md:gap-8 md:px-12">
              {vm.isLoadingCatalog ? (
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-[300px] w-[200px] shrink-0 animate-pulse rounded-[24px] border border-soft-linen/5 bg-soft-linen/5 md:h-[320px] md:w-[520px]"
                  />
                ))
              ) : vm.catalogError ? (
                <div className="flex flex-col items-start gap-3 py-10">
                  <p className="font-sans text-sm text-soft-linen/60">{vm.catalogError}</p>
                  <button
                    onClick={vm.retry}
                    className="rounded-full border border-soft-linen/20 px-5 py-2 font-bold font-sans text-xs text-soft-linen uppercase tracking-widest transition-colors hover:border-harvest-orange hover:text-harvest-orange"
                  >
                    try again
                  </button>
                </div>
              ) : vm.heroJourneys.length === 0 ? (
                <p className="py-10 font-sans text-sm text-soft-linen/50">No sermons have been published yet.</p>
              ) : (
                vm.heroJourneys.map((journey) => (
                  <button
                    key={journey.journeyId}
                    onClick={() => vm.openJourney(journey)}
                    className="sermon-card group relative h-[300px] w-[200px] shrink-0 overflow-hidden rounded-[24px] border border-soft-linen/5 bg-midnight-teal text-left shadow-2xl md:h-[320px] md:w-[520px]"
                  >
                    {journey.thumbnailUrl && (
                      <img
                        src={journey.thumbnailUrl}
                        alt={journey.title}
                        className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                    )}
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
                          {journeyLabel(journey)}
                        </span>
                      </div>
                      <h3 className="mb-3 font-serif text-lg text-soft-linen tracking-tighter transition-transform group-hover:-translate-y-1 md:text-xl">
                        {journey.title}
                      </h3>

                      <div className="flex items-center justify-between border-t border-soft-linen/10 pt-3">
                        <div className="flex gap-3 font-sans text-[8px] text-soft-linen/40 uppercase tracking-[0.15em]">
                          <span>{formatDate(journey.createdAt)}</span>
                          <span>{episodeCount(journey.totalPublishedParts)}</span>
                        </div>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-soft-linen/20">
                          <PlayIcon className="h-3 w-3 text-soft-linen" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
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
                onClick={() => vm.setActiveTab(tab.id)}
                className={`rounded-full border px-5 py-2.5 font-bold font-sans text-xs uppercase tracking-widest transition-colors ${
                  vm.activeTab === tab.id
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
                onClick={vm.toggleCategoryOpen}
                className="flex w-full items-center justify-between rounded-full border border-midnight-teal/15 bg-white px-5 py-2.5 font-sans text-xs text-midnight-teal/70 uppercase tracking-widest transition-colors hover:border-harvest-orange"
              >
                <span className="truncate">{vm.activeCategory ?? 'Filter by category'}</span>
                <svg
                  className={`h-4 w-4 shrink-0 text-midnight-teal/40 transition-transform ${vm.categoryOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {vm.categoryOpen && (
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
                          value={vm.categorySearch}
                          onChange={(e) => vm.setCategorySearch(e.target.value)}
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
                      {vm.activeCategory && (
                        <button
                          type="button"
                          onClick={() => vm.selectCategory(null)}
                          className="flex w-full items-center px-5 py-3 font-sans text-sm text-harvest-orange hover:bg-midnight-teal/5"
                        >
                          Clear filter
                        </button>
                      )}

                      {vm.filteredCategories.length === 0 ? (
                        <p className="px-5 py-6 text-center font-sans text-sm text-midnight-teal/40">
                          No categories found.
                        </p>
                      ) : (
                        vm.filteredCategories.map((cat) => (
                          <button
                            key={cat.name}
                            type="button"
                            onClick={() => vm.selectCategory(cat.name)}
                            className={`flex w-full items-center justify-between px-5 py-3 font-sans text-sm transition-colors hover:bg-midnight-teal/5 ${
                              vm.activeCategory === cat.name ? 'text-harvest-orange' : 'text-midnight-teal/80'
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
                value={vm.searchQuery}
                onChange={(e) => vm.setSearchQuery(e.target.value)}
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
              key={vm.activeTab + vm.currentPage + (vm.activeCategory ?? '')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="min-h-[320px]"
            >
              {vm.activeTab === 'sermons' && (
                <>
                  {vm.showListSkeleton ? (
                    <div className="mb-14 grid grid-cols-1 gap-10 py-10 md:grid-cols-2">
                      {[0, 1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-start gap-6 sm:flex-row">
                          <div className="h-56 w-full shrink-0 animate-pulse rounded-xl bg-midnight-teal/5 sm:w-72" />
                          <div className="w-full flex-1 space-y-3">
                            <div className="h-6 w-3/4 animate-pulse rounded bg-midnight-teal/5" />
                            <div className="h-3 w-1/3 animate-pulse rounded bg-midnight-teal/5" />
                            <div className="h-3 w-1/4 animate-pulse rounded bg-midnight-teal/5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : vm.listError ? (
                    <div className="mb-14 flex flex-col items-center gap-4 py-10">
                      <p className="text-center font-sans text-sm text-midnight-teal/50">{vm.listError}</p>
                      <button
                        onClick={vm.retry}
                        className="rounded-full border border-midnight-teal/15 px-5 py-2.5 font-bold font-sans text-xs text-midnight-teal/60 uppercase tracking-widest transition-colors hover:border-harvest-orange hover:text-harvest-orange"
                      >
                        try again
                      </button>
                    </div>
                  ) : vm.visibleSermons.length === 0 ? (
                    <p className="mb-14 text-center font-sans text-sm text-midnight-teal/40">
                      No sermons found.
                    </p>
                  ) : (
                    <div className="mb-14 grid grid-cols-1 md:grid-cols-2">
                      {vm.visibleSermons.map((journey, i) => (
                        <div
                          key={journey.journeyId}
                          className={`flex flex-col items-start gap-6 py-10 border-midnight-teal/20 sm:flex-row ${
                            i >= 2 ? 'border-t-2' : ''
                          } ${i % 2 === 0 ? 'md:pr-10 md:border-r' : 'md:pl-10'}`}
                        >
                          <button
                            onClick={() => vm.openJourney(journey)}
                            className="group relative h-56 w-full shrink-0 overflow-hidden rounded-xl bg-midnight-teal sm:w-72"
                          >
                            {journey.thumbnailUrl && (
                              <img
                                src={journey.thumbnailUrl}
                                alt={journey.title}
                                className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-midnight-teal/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <span className="rounded-full bg-harvest-orange px-6 py-2.5 font-bold font-sans text-xs text-midnight-teal uppercase tracking-widest">
                                watch now
                              </span>
                            </div>
                          </button>

                          <div className="flex-1">
                            <h4 className="mb-1 font-serif text-xl text-midnight-teal md:text-2xl">
                              {journey.title}
                            </h4>
                            <p className="mb-4 font-sans text-xs text-midnight-teal/40 uppercase tracking-widest">
                              {journeyLabel(journey)}
                            </p>
                            <div className="mb-5 flex flex-col gap-1.5 font-sans text-xs text-midnight-teal/50">
                              <span>{formatDate(journey.createdAt)}</span>
                              <span>{episodeCount(journey.totalPublishedParts)}</span>
                            </div>
                            <button
                              onClick={() => vm.openJourney(journey)}
                              className="inline-flex items-center gap-1.5 font-bold font-sans text-xs text-harvest-orange uppercase tracking-widest transition-colors hover:text-midnight-teal"
                            >
                              see more <span>&rarr;</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!vm.showListSkeleton && !vm.listError && vm.visibleSermons.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => vm.goToPage(vm.currentPage - 1)}
                        disabled={vm.currentPage === 1}
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
                            onClick={() => vm.goToPage(page as number)}
                            className={`flex h-10 w-10 items-center justify-center rounded-full border font-bold font-sans text-sm transition-colors ${
                              vm.currentPage === page
                                ? 'border-harvest-orange bg-harvest-orange text-midnight-teal'
                                : 'border-midnight-teal/15 text-midnight-teal/60 hover:border-harvest-orange hover:text-harvest-orange'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() => vm.goToPage(vm.currentPage + 1)}
                        disabled={vm.currentPage === vm.totalPages}
                        className="flex h-10 items-center justify-center rounded-full border border-midnight-teal/15 px-4 font-bold font-sans text-midnight-teal/60 text-sm transition-colors hover:border-harvest-orange hover:text-harvest-orange disabled:pointer-events-none disabled:opacity-30"
                      >
                        Next &rsaquo;
                      </button>
                    </div>
                  )}
                </>
              )}

              {vm.activeTab === 'series' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {vm.isLoadingCatalog ? (
                    [0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-64 animate-pulse rounded-2xl bg-midnight-teal/5" />
                    ))
                  ) : vm.catalogError ? (
                    <p className="col-span-full py-16 text-center font-sans text-sm text-midnight-teal/40">
                      {vm.catalogError}
                    </p>
                  ) : vm.filteredSeries.length === 0 ? (
                    <p className="col-span-full py-16 text-center font-sans text-sm text-midnight-teal/40">
                      No series found in this category.
                    </p>
                  ) : (
                    vm.filteredSeries.map((series) => (
                      <button
                        key={series.journeyId}
                        onClick={() => vm.openJourney(series)}
                        className="group relative h-64 overflow-hidden rounded-2xl border border-midnight-teal/10 bg-midnight-teal text-left shadow-xl"
                      >
                        {series.thumbnailUrl && (
                          <img
                            src={series.thumbnailUrl}
                            alt={series.title}
                            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/50 to-transparent" />

                        <div className="absolute inset-0 flex flex-col justify-end p-5">
                          <span className="mb-1.5 font-bold text-[9px] text-harvest-orange uppercase tracking-widest">
                            {journeyLabel(series)}
                          </span>
                          <h3 className="font-serif text-lg text-soft-linen tracking-tight">
                            Series: {series.title}
                          </h3>
                          <span className="mt-2 font-sans text-[10px] text-soft-linen/40 uppercase tracking-widest">
                            {episodeCount(series.totalPublishedParts)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {vm.activeTab === 'topics' && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {vm.isLoadingCatalog
                    ? [0, 1, 2, 3].map((i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-midnight-teal/5" />
                      ))
                    : vm.categoryCounts.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            vm.setActiveTab('sermons');
                            vm.selectCategory(cat.name);
                          }}
                          className="flex items-center justify-between rounded-xl border border-midnight-teal/10 px-5 py-4 font-sans text-sm text-midnight-teal/80 transition-colors hover:border-harvest-orange hover:text-harvest-orange"
                        >
                          <span>{cat.name}</span>
                          <span className="text-midnight-teal/30">{cat.count}</span>
                        </button>
                      ))}
                </div>
              )}

              {vm.activeTab === 'speakers' && (
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
        {vm.seriesTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-midnight-teal/90 p-4 backdrop-blur-sm md:p-10"
            onClick={vm.closeSeries}
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
                    {journeyLabel(vm.seriesTarget)}
                  </span>
                  <h2 className="font-serif text-2xl text-midnight-teal md:text-3xl">
                    Series: {vm.seriesTarget.title}
                  </h2>
                  {(vm.seriesTarget.description || vm.seriesTarget.summary) && (
                    <p className="mt-3 max-w-xl whitespace-pre-line font-sans text-sm text-midnight-teal/60">
                      {vm.seriesTarget.description || vm.seriesTarget.summary}
                    </p>
                  )}
                </div>
                <button
                  onClick={vm.closeSeries}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-midnight-teal/15 text-midnight-teal transition-colors hover:bg-midnight-teal hover:text-soft-linen"
                >
                  &times;
                </button>
              </div>

              <div className="min-h-56">
              {vm.isLoadingSeries ? (
                <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 md:px-8">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-48 animate-pulse rounded-xl bg-midnight-teal/5" />
                  ))}
                </div>
              ) : vm.seriesError ? (
                <p className="px-6 pb-8 text-center font-sans text-sm text-midnight-teal/50 md:px-8">
                  {vm.seriesError}
                </p>
              ) : vm.seriesDetail && vm.seriesDetail.parts.length === 0 ? (
                <p className="px-6 pb-8 text-center font-sans text-sm text-midnight-teal/40 md:px-8">
                  No episodes have been published for this series yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 px-6 pb-8 sm:grid-cols-2 md:px-8">
                  {vm.seriesDetail?.parts.map((part) => {
                    const thumbnail = partThumbnail(part, vm.seriesDetail?.journey ?? null);
                    return (
                      <button
                        key={part.partId}
                        onClick={() => vm.playPart(part)}
                        className="group relative h-48 overflow-hidden rounded-xl bg-midnight-teal text-left"
                      >
                        {thumbnail && (
                          <img
                            src={thumbnail}
                            alt={part.title}
                            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight-teal via-midnight-teal/40 to-transparent" />
                        <div className="absolute inset-0 flex flex-col justify-end p-4">
                          <h4 className="font-serif text-base text-soft-linen">{part.title}</h4>
                          <div className="mt-1 flex gap-3 font-sans text-[10px] text-soft-linen/50 uppercase tracking-widest">
                            <span>{formatDate(part.createdAt)}</span>
                            <span>{partLength(part)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {vm.nowPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-midnight-teal/90 p-4 backdrop-blur-sm md:p-10"
            onClick={vm.closePlayer}
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
                  onClick={vm.closePlayer}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-midnight-teal/15 text-midnight-teal transition-colors hover:bg-midnight-teal hover:text-soft-linen"
                >
                  &times;
                </button>
              </div>

              {embed && embed.kind !== 'link' && (
                <div className="px-4 md:px-8">
                  {embed.kind === 'iframe' && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl">
                      <iframe
                        className="h-full w-full"
                        src={embed.src}
                        title={vm.nowPlaying.part.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {embed.kind === 'image' && (
                    <img src={embed.src} alt={vm.nowPlaying.part.title} className="w-full rounded-xl object-cover" />
                  )}
                  {embed.kind === 'audio' && <audio controls src={embed.src} className="w-full" />}
                </div>
              )}

              <div className="p-6 md:p-8">
                <span className="mb-1 block font-bold text-[10px] text-harvest-orange uppercase tracking-widest">
                  {vm.nowPlaying.journey.title}
                </span>
                <h2 className="mb-3 font-serif text-2xl text-midnight-teal md:text-3xl">
                  {vm.nowPlaying.part.title}
                </h2>
                <div className="flex gap-4 font-sans text-xs text-midnight-teal/50">
                  <span>{formatDate(vm.nowPlaying.part.createdAt)}</span>
                  <span>{partLength(vm.nowPlaying.part)}</span>
                </div>
                {embed?.kind === 'link' && (
                  <a
                    href={embed.src}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 font-bold font-sans text-xs text-harvest-orange uppercase tracking-widest transition-colors hover:text-midnight-teal"
                  >
                    open media <span>&rarr;</span>
                  </a>
                )}
                {vm.nowPlaying.part.readingText && (
                  <p className="mt-6 whitespace-pre-line font-sans text-sm leading-relaxed text-midnight-teal/80">
                    {vm.nowPlaying.part.readingText}
                  </p>
                )}
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
