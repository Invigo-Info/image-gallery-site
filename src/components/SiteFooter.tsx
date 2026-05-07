import Link from 'next/link';
import BrandLogo, { BRAND_FULL, BRAND_TAGLINE } from './BrandLogo';

interface FooterLink {
  label: string;
  href: string;
}

const EXPLORE_LINKS: FooterLink[] = [
  { label: 'All categories', href: '/#categories' },
  { label: 'About', href: '/#about' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/#contact' },
];

const FEATURED_LINKS: FooterLink[] = [
  { label: 'Business', href: '/business-photos' },
  { label: 'Corporate', href: '/corporate-photos' },
  { label: 'LinkedIn', href: '/linkedin-photos' },
  { label: 'Professional', href: '/professional-photos' },
];

const RESOURCE_LINKS: FooterLink[] = [
  { label: 'Licensing', href: '/#contact' },
  { label: 'Press kit', href: '/#contact' },
  { label: 'Privacy', href: '/#contact' },
  { label: 'Terms', href: '/#contact' },
];

interface SocialLink {
  label: string;
  // Replace these placeholder URLs with your real social profiles, or wire
  // them up to NEXT_PUBLIC_SOCIAL_* env vars to keep them out of source.
  href: string;
  iconPath: string;
}

const SOCIALS: SocialLink[] = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/',
    iconPath:
      'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M3 8a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z',
  },
  {
    label: 'Pinterest',
    href: 'https://pinterest.com/',
    iconPath:
      'M12 22s-1-1-1-4 1-7 1-7 M9 12c-1-2 0-7 4-7s5 4 5 6-1 5-4 5-3-2-3-2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
  },
  {
    label: 'X',
    href: 'https://x.com/',
    iconPath: 'M4 4l16 16 M20 4L4 20',
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    iconPath:
      'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/',
    iconPath:
      'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 1 0-4 0v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-16 border-t border-white/10 bg-background/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <BrandLogo size={40} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-gray-400">
              {BRAND_TAGLINE} Browse, share, and download — every collection
              has its own home.
            </p>

            {/* Social media — share & follow */}
            <div className="mt-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Share &amp; follow
              </p>
              <ul className="flex flex-wrap items-center gap-2">
                {SOCIALS.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit on ${s.label}`}
                      title={s.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all hover:-translate-y-0.5 hover:border-brand-400/40 hover:bg-brand-500/15 hover:text-brand-200"
                    >
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
                        aria-hidden="true"
                      >
                        <path d={s.iconPath} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Link columns */}
          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Featured" links={FEATURED_LINKS} />
          <FooterColumn title="Resources" links={RESOURCE_LINKS} />
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>
            © {year} {BRAND_FULL}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            <span
              className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
              aria-hidden="true"
            />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <nav aria-label={title}>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-gray-400 transition-colors hover:text-brand-300"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
