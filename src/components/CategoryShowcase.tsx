'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildCoverUrl, type CategorySummary } from '@/lib/categories';

interface Props {
  categories: CategorySummary[];
}

// Initial card count = three rows on the desktop 5-column grid. Smaller
// breakpoints will show more rows for the same count, which still reads as
// "fewer than the full set" and is fine.
const INITIAL_VISIBLE = 15;

export default function CategoryShowcase({ categories }: Props) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, categories]);

  // When the user is searching, always show every match. Otherwise honour
  // the expand toggle so the section opens with just the first three rows.
  const isSearching = query.trim().length > 0;
  const showAll = isSearching || expanded;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, filtered.length - INITIAL_VISIBLE);
  const hasMoreControl = !isSearching && hiddenCount > 0;

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-gray-400">
        No categories yet. Upload images to subfolders inside your Cloudinary
        root to populate the gallery.
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Browse by category
          </h2>
          <p className="mt-1.5 text-sm text-gray-400">
            {categories.length} curated{' '}
            {categories.length === 1 ? 'collection' : 'collections'}. Click any
            tile to view its full gallery.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter categories…"
            aria-label="Filter categories"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
          No categories match{' '}
          <span className="font-medium text-gray-200">“{query}”</span>.{' '}
          <button
            onClick={() => setQuery('')}
            className="font-medium text-brand-300 underline-offset-2 hover:underline"
          >
            Clear
          </button>
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((cat) => (
            <li key={cat.slug} className="animate-fade-in">
              <Link
                href={`/${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-gray-900 ring-1 ring-white/5 transition-all duration-300 hover:ring-brand-400/40 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <div className="relative aspect-[4/5] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildCoverUrl(cat.hero, 600, 750)}
                    alt={`${cat.name} cover`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  {/* Bottom-only gradient for title legibility — leaves the
                      top half of the image fully bright. */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />
                  {/* Subtle top sheen on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Count chip */}
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                    {cat.count}
                    <span className="text-white/60">
                      {cat.count === 1 ? 'photo' : 'photos'}
                    </span>
                  </span>

                  {/* Title row */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                    <h3 className="text-base font-semibold leading-tight text-white drop-shadow-sm sm:text-lg">
                      {cat.name}
                    </h3>
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:bg-brand-500/80"
                      aria-hidden="true"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {hasMoreControl && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-200 backdrop-blur-sm transition-all hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-background"
          >
            {expanded ? 'Show less' : `Show ${hiddenCount} more ${hiddenCount === 1 ? 'category' : 'categories'}`}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
