'use client';

import { useState } from 'react';
import Reveal from './Reveal';

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How are images organised into categories?',
    a: "Each subfolder under your Cloudinary root folder becomes its own category. Drop images into a folder called 'mountains', and a 'Mountains' gallery appears at /mountains-photos automatically — no code changes required.",
  },
  {
    q: 'Can I download photos from the gallery?',
    a: 'Yes. Open any image and the lightbox panel offers Small, Medium, Large, and Original download buttons. If a filter is applied, the downloaded file ships the transformed pixels — not just a CSS preview.',
  },
  {
    q: 'What filters are available, and how are they applied?',
    a: 'Fifteen-plus presets ship out of the box, including Clarendon, Juno, Gingham, Lark, Moon, Noir, Cinematic, Polaroid, HDR, Lomo, Pop Art, Cyberpunk, Pastel, Kodak, and Fuji. Filters are composed as Cloudinary URL transformations, so the CDN does the heavy lifting and you can link the filtered URL directly.',
  },
  {
    q: 'How quickly do new uploads appear?',
    a: 'Pages use Incremental Static Regeneration with a 60-second revalidation window. A new image uploaded to Cloudinary will appear on its category page within roughly a minute of the next request.',
  },
  {
    q: 'Does the gallery work on mobile?',
    a: 'Yes — the masonry uses CSS columns and adapts from 2 columns on small phones up to 6 on ultra-wide displays. The lightbox stacks vertically on narrow screens, and category cards reflow into a 2-up grid on mobile.',
  },
  {
    q: 'What technology powers this site?',
    a: 'Next.js 14 with the App Router and React Server Components, Tailwind CSS for styling, and Cloudinary for image hosting, on-the-fly transformations, and CDN delivery. There are no external runtime dependencies for animations — just CSS transitions and IntersectionObserver.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative scroll-mt-20 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-brand-300">
              FAQ
            </span>
            <h2 className="mt-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base text-gray-400 sm:text-lg">
              The short answers to what most visitors want to know.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIdx === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <Reveal key={item.q} delay={i * 70}>
                <div
                  className={`rounded-2xl border bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 ${
                    isOpen
                      ? 'border-brand-400/30 bg-white/[0.06] shadow-glow-sm'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-white sm:px-6 sm:py-5 sm:text-base"
                    >
                      <span className="flex-1">{item.q}</span>
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 ${
                          isOpen
                            ? 'rotate-180 border-brand-400/40 bg-brand-500/20 text-brand-200'
                            : ''
                        }`}
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
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  {/* grid-rows trick: animates from 0fr → 1fr without measuring */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-all duration-500 ease-out motion-reduce:transition-none ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-gray-400 sm:px-6 sm:pb-6">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
