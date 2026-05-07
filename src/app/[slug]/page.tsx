import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllGalleryImages } from '@/lib/cloudinary';
import { demoImages } from '@/lib/demoImages';
import { slugToCategory } from '@/lib/imageTypes';
import {
  filterImagesByCategory,
  getCategorySummaries,
} from '@/lib/categories';
import MasonryGallery from '@/components/MasonryGallery';

export const revalidate = 60;
export const dynamicParams = true;

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = slugToCategory(params.slug);
  return {
    title: category
      ? `${category} Photos · Aperture Studio`
      : 'Gallery · Aperture Studio',
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = slugToCategory(params.slug);
  if (!category) notFound();

  const { resources } = await getAllGalleryImages();
  const usingDemo = resources.length === 0;
  const allImages = usingDemo ? demoImages : resources;
  const rootFolder = usingDemo ? 'demo' : process.env.CLOUDINARY_FOLDER || '';

  const summaries = getCategorySummaries(allImages, rootFolder);
  const matchingSummary = summaries.find(
    (s) => s.name.toLowerCase() === category.toLowerCase()
  );
  if (!matchingSummary) notFound();

  // Only ship this category's images to the client.
  const categoryImages = filterImagesByCategory(
    allImages,
    rootFolder,
    matchingSummary.name
  );

  // Previous/next category links for sequential browsing.
  const idx = summaries.findIndex((s) => s.name === matchingSummary.name);
  const prev = idx > 0 ? summaries[idx - 1] : null;
  const next = idx < summaries.length - 1 ? summaries[idx + 1] : null;

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      {/* Page header */}
      <section className="relative border-b border-white/10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="animate-slide-up">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex items-center gap-1.5 text-sm text-gray-400"
            >
              <Link
                href="/"
                className="transition-colors hover:text-brand-300"
              >
                Home
              </Link>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <Link
                href="/#categories"
                className="transition-colors hover:text-brand-300"
              >
                Categories
              </Link>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-600"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-gray-200">{matchingSummary.name}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-300">
                  Category
                </div>
                <h1 className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
                  {matchingSummary.name} Photos
                </h1>
                <p className="mt-3 text-sm text-gray-400 sm:text-base">
                  {matchingSummary.count}{' '}
                  {matchingSummary.count === 1 ? 'image' : 'images'} in this
                  category.
                </p>
              </div>

              {/* Prev / next category */}
              {(prev || next) && (
                <div className="flex items-center gap-2 text-sm">
                  {prev ? (
                    <Link
                      href={`/${prev.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      {prev.name}
                    </Link>
                  ) : (
                    <span className="opacity-0" aria-hidden="true" />
                  )}
                  {next && (
                    <Link
                      href={`/${next.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-300 transition-colors hover:border-white/20 hover:text-white"
                    >
                      {next.name}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <MasonryGallery
          images={categoryImages}
          rootFolder={rootFolder}
          category={matchingSummary.name}
        />
      </section>
    </main>
  );
}
