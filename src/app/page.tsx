import Link from 'next/link';
import { getAllGalleryImages } from '@/lib/cloudinary';
import { demoImages, isDemoImage } from '@/lib/demoImages';
import { getCategorySummaries } from '@/lib/categories';
import type { CloudinaryImage } from '@/lib/imageTypes';
import CategoryShowcase from '@/components/CategoryShowcase';
import AboutSection from '@/components/AboutSection';
import ContactSection from '@/components/ContactSection';
import FaqSection from '@/components/FaqSection';

// ISR — revalidate every 60s so new uploads appear automatically
export const revalidate = 60;

export default async function Home() {
  const { resources, total_count } = await getAllGalleryImages();

  const usingDemo = resources.length === 0;
  const images = usingDemo ? demoImages : resources;
  const totalImages = usingDemo ? demoImages.length : total_count;
  const rootFolder = usingDemo ? 'demo' : process.env.CLOUDINARY_FOLDER || '';

  const categories = getCategorySummaries(images, rootFolder);

  // Curated set of categories highlighted in the Featured strip. Names that
  // don't yet have a matching Cloudinary folder are skipped gracefully so the
  // strip fills out as you upload.
  const FEATURED_NAMES = ['Business', 'Corporate', 'LinkedIn', 'Professional'];
  const featured = FEATURED_NAMES.map((displayName) => {
    const summary = categories.find(
      (c) => c.name.toLowerCase() === displayName.toLowerCase()
    );
    return summary ? { ...summary, displayName } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <main className="relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-brand-600/25 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center animate-slide-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              {usingDemo ? 'Demo collection' : 'Now showing'}
            </div>

            <h1 className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Portraits,
              <br />
              made to be seen.
            </h1>

            <p className="mt-6 max-w-2xl text-base text-gray-400 sm:text-lg">
              From boardroom headshots to author portraits, LinkedIn profiles
              to casting calls — Aperture Studio crafts photography for every
              professional moment. Browse by category to find the look that
              fits your story.
            </p>

            {/* Stats + CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#categories"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-400 hover:shadow-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-background"
              >
                Explore categories
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
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <div className="flex items-center gap-6 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm">
                <Stat label="Categories" value={categories.length} />
                <span className="h-4 w-px bg-white/10" aria-hidden="true" />
                <Stat label="Photos" value={totalImages} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured strip — curated set: Business, Corporate, LinkedIn, Professional */}
      {featured.length >= 1 && (
        <section className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
              Featured categories
            </h2>
            <Link
              href="#categories"
              className="text-sm text-gray-400 transition-colors hover:text-brand-300"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group relative overflow-hidden rounded-3xl bg-gray-900 ring-1 ring-white/5 transition-all duration-300 hover:ring-brand-400/40 hover:shadow-glow"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={buildHeroBanner(cat.hero, 800, 600)}
                    alt={`${cat.displayName} cover`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/0" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <span className="mb-1.5 inline-block rounded-full border border-white/15 bg-black/30 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                      Featured
                    </span>
                    <h3 className="text-lg font-semibold text-white drop-shadow sm:text-xl">
                      {cat.displayName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {cat.count} {cat.count === 1 ? 'photo' : 'photos'} · view
                      gallery →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All categories */}
      <section
        id="categories"
        className="relative mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 pb-24 sm:px-6 sm:pt-20 sm:pb-32 lg:px-8"
      >
        <CategoryShowcase categories={categories} />
      </section>

      <AboutSection />
      <ContactSection />
      <FaqSection />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-base font-semibold text-white tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="text-xs uppercase tracking-wider text-gray-400">
        {label}
      </span>
    </span>
  );
}

function buildHeroBanner(image: CloudinaryImage, w: number, h: number): string {
  if (isDemoImage(image)) {
    return image.secure_url.replace(/w=\d+/, `w=${w}`);
  }
  return image.secure_url.replace(
    '/upload/',
    `/upload/c_fill,w_${w},h_${h},g_auto,f_auto,q_auto/`
  );
}
