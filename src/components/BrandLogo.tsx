import Link from 'next/link';

export const BRAND_NAME = 'Aperture';
export const BRAND_SUBTITLE = 'Studio';
export const BRAND_FULL = `${BRAND_NAME} ${BRAND_SUBTITLE}`;
export const BRAND_TAGLINE =
  'Curated portrait galleries — Business, Corporate, LinkedIn, Editorial, and more.';

interface BrandLogoProps {
  /** Hide the wordmark and render just the icon mark. */
  iconOnly?: boolean;
  /** Show the small "Studio" subtitle beneath the wordmark. Default true. */
  showSubtitle?: boolean;
  /** Size of the icon mark in px. Wordmark scales relative to it. */
  size?: number;
  /** Wraps the logo in a Link to home. Default true. */
  asLink?: boolean;
  className?: string;
}

/**
 * Aperture Studio brand lockup. Mark is an aperture-diaphragm icon set in a
 * brand-gradient rounded tile with a subtle glossy highlight. Wordmark is
 * "Aperture" in a tight tracking; an optional small-caps "Studio" subtitle
 * sits below for contexts (footer, hero) that have room for it.
 */
export default function BrandLogo({
  iconOnly = false,
  showSubtitle = true,
  size = 32,
  asLink = true,
  className = '',
}: BrandLogoProps) {
  const wordmarkSize = Math.round(size * 0.5);
  const subtitleSize = Math.max(9, Math.round(size * 0.26));
  const iconInner = Math.round(size * 0.62);

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className="relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/40 ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        {/* Glossy top sheen */}
        <span
          className="pointer-events-none absolute inset-x-1 top-0.5 h-1/2 rounded-t-lg bg-gradient-to-b from-white/25 to-transparent"
          aria-hidden="true"
        />
        {/* Hover glow */}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl bg-brand-400/0 transition-colors duration-300 group-hover:bg-brand-400/15"
          aria-hidden="true"
        />
        <ApertureIcon size={iconInner} />
      </span>

      {!iconOnly && (
        <span className="inline-flex flex-col leading-none">
          <span
            className="font-semibold tracking-tight text-white"
            style={{ fontSize: wordmarkSize }}
          >
            {BRAND_NAME}
          </span>
          {showSubtitle && (
            <span
              className="mt-1 font-medium uppercase tracking-[0.22em] text-brand-300/80"
              style={{ fontSize: subtitleSize }}
            >
              {BRAND_SUBTITLE}
            </span>
          )}
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link
      href="/"
      aria-label={`${BRAND_FULL} — home`}
      className="group inline-flex items-center"
    >
      {content}
    </Link>
  );
}

/**
 * Aperture-diaphragm icon — a circle with six chord lines that meet to form
 * a hexagonal opening. The classic shutter-blade silhouette every lens has.
 */
function ApertureIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="relative drop-shadow-sm"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m14.31 8 5.74 9.94" />
      <path d="M9.69 8h11.48" />
      <path d="m7.38 12 5.74-9.94" />
      <path d="M9.69 16 3.95 6.06" />
      <path d="M14.31 16H2.83" />
      <path d="m16.62 12-5.74 9.94" />
    </svg>
  );
}
