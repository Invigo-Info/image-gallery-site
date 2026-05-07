'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

const NAV_LINKS = [
  { label: 'Categories', href: '/#categories' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/#faq' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle the glass surface once the user has scrolled past the very top —
  // keeps the hero feeling immersive when the page first loads.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close the drawer if the viewport widens past the mobile breakpoint.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div
        className={`relative transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/10 bg-background/80 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(139,92,246,0.25)]'
            : 'border-b border-transparent bg-background/30 backdrop-blur-md'
        }`}
      >
        {/* Top hairline highlight */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
          aria-hidden="true"
        />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo size={34} showSubtitle={false} />

          {/* Desktop nav */}
          <nav
            className="hidden items-center md:flex"
            aria-label="Primary navigation"
          >
            <ul className="flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
                  >
                    {/* Hover background */}
                    <span
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-500/0 to-brand-500/0 opacity-0 transition-all duration-300 group-hover:from-brand-500/15 group-hover:to-brand-500/5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                    <span className="relative z-10">{link.label}</span>
                    {/* Animated underline */}
                    <span
                      className="absolute inset-x-4 bottom-1 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-brand-300 to-transparent transition-transform duration-300 ease-out group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right cluster: CTA + mobile menu trigger */}
          <div className="flex items-center gap-2">
            <Link
              href="/#contact"
              className="group hidden items-center gap-1.5 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 ring-1 ring-white/10 transition-all duration-300 hover:from-brand-400 hover:to-brand-600 hover:shadow-brand-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:inline-flex"
            >
              Get in touch
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-100 transition-colors hover:border-white/20 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 md:hidden"
            >
              <span className="relative block h-4 w-4">
                <span
                  className={`absolute inset-x-0 top-0 h-0.5 rounded-full bg-current transition-all duration-300 ${
                    menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : ''
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                    menuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current transition-all duration-300 ${
                    menuOpen ? 'bottom-1/2 translate-y-1/2 -rotate-45' : ''
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Brand accent line that fades in once the user has scrolled */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent transition-opacity duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          aria-hidden={!menuOpen}
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        {/* Panel */}
        <div
          id="mobile-menu"
          aria-hidden={!menuOpen}
          className={`relative z-40 overflow-hidden border-b border-white/10 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-out ${
            menuOpen ? 'max-h-[28rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav
            className="px-4 py-4 sm:px-6"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-base font-medium text-gray-200 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
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
                      className="text-gray-500"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </li>
              ))}
              <li className="mt-3 border-t border-white/10 pt-3">
                <Link
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-brand-500/30"
                >
                  Get in touch
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
