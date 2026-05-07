import Reveal from './Reveal';

const FEATURES = [
  {
    title: 'Curated galleries',
    desc: 'Each Cloudinary subfolder becomes its own browsable category — organised, shareable, and indexable by search engines.',
    path: 'M3 7h7v7H3zM14 4h7v6h-7zM14 14h7v7h-7zM3 17h7v4H3z',
  },
  {
    title: 'Cloudinary-powered',
    desc: 'Originals stay untouched on the CDN; resizing, format conversion, and effects happen on the fly via signed delivery URLs.',
    path: 'M21 15a4 4 0 0 0-4-4 7 7 0 0 0-13.5 1.5A4 4 0 0 0 6 19h11a4 4 0 0 0 4-4z',
  },
  {
    title: 'Built-in filters',
    desc: 'Fifteen-plus presets — Clarendon, Noir, Cinematic, Pop Art, and more. Filtered downloads ship the transformed pixels, not just CSS.',
    path: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
  },
  {
    title: 'Fast & responsive',
    desc: 'Static-friendly Next.js routes with ISR, lazy-loaded thumbnails, and a CSS masonry grid that scales from 2 columns on phones to 6 on desktop.',
    path: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-20 border-t border-white/5"
    >
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-300">
              About
            </span>
            <h2 className="mt-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              A homepage for every collection
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-400 sm:text-lg">
              Aperture Studio is a curated portrait gallery, organised by use
              case. Each professional category — Business, Corporate,
              LinkedIn, Editorial, and more — opens into its own dedicated
              showcase, so a request like{' '}
              <span className="font-medium text-gray-200">Author</span> lands
              at a shareable{' '}
              <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-sm text-brand-300">
                /author-photos
              </code>{' '}
              page with the full lightbox, filters, and downloads.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/30 hover:bg-white/[0.06] hover:shadow-glow">
                <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/20 text-brand-200 ring-1 ring-brand-400/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d={feature.path} />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {feature.desc}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
