'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getImageCategory,
  getImageTags,
  type CloudinaryImage,
} from '@/lib/imageTypes';
import { isDemoImage } from '@/lib/demoImages';

interface MasonryGalleryProps {
  images: CloudinaryImage[];
  rootFolder: string;
  /**
   * Category label these images belong to. Shown in the lightbox metadata
   * panel. When omitted, the category is derived per-image from its folder.
   */
  category?: string;
}

type SortOrder = 'newest' | 'oldest' | 'name';

const SORT_LABELS: Record<SortOrder, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Name (A–Z)',
};

export default function MasonryGallery({
  images,
  rootFolder,
  category,
}: MasonryGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  // Selected tag pills, stored lower-cased for case-insensitive match.
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Annotate each image with its category and tag set. The tags annotation
  // powers the pill filter row above the gallery and is reused in matching.
  const annotated = useMemo(
    () =>
      images.map((img) => {
        const folder = isDemoImage(img) ? 'demo' : rootFolder;
        return {
          img,
          category:
            category ?? getImageCategory(img, folder),
          tags: getImageTags(img, folder),
        };
      }),
    [images, rootFolder, category]
  );

  // Available tags across this category — used to render the pill row.
  // Sorted with the most common tags first, then alphabetically as tiebreak.
  const availableTags = useMemo(() => {
    const counts = new Map<string, { display: string; count: number }>();
    for (const { tags } of annotated) {
      for (const t of tags) {
        const key = t.toLowerCase();
        const entry = counts.get(key);
        if (entry) entry.count += 1;
        else counts.set(key, { display: t, count: 1 });
      }
    }
    return Array.from(counts.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.display.localeCompare(b.display);
    });
  }, [annotated]);

  const toggleTag = (tag: string) => {
    const key = tag.toLowerCase();
    setSelectedTags((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  };

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = annotated;

    if (selectedTags.length > 0) {
      // OR semantics: image matches if it has at least one of the selected tags.
      list = list.filter(({ tags }) => {
        const lower = tags.map((t) => t.toLowerCase());
        return selectedTags.some((s) => lower.includes(s));
      });
    }

    if (q) {
      list = list.filter(({ img, category, tags }) => {
        const haystack = [
          img.context?.custom?.alt,
          img.context?.custom?.caption,
          img.public_id,
          category,
          tags.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    const sorted = [...list];
    if (sortOrder === 'newest') {
      sorted.sort((a, b) => b.img.created_at.localeCompare(a.img.created_at));
    } else if (sortOrder === 'oldest') {
      sorted.sort((a, b) => a.img.created_at.localeCompare(b.img.created_at));
    } else if (sortOrder === 'name') {
      sorted.sort((a, b) => deriveTitle(a.img).localeCompare(deriveTitle(b.img)));
    }

    return sorted.map((a) => ({ img: a.img, category: a.category }));
  }, [annotated, searchQuery, selectedTags, sortOrder]);

  // Reset lightbox if filters/sort change so we don't open a stale index.
  useEffect(() => {
    setSelectedIndex(null);
  }, [searchQuery, selectedTags, sortOrder]);

  // Keyboard navigation: Esc to close, Arrow keys to navigate
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowRight' && selectedIndex < filteredImages.length - 1) {
        setSelectedIndex(selectedIndex + 1);
      }
      if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [selectedIndex, filteredImages.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIndex]);

  // Empty state — only when there are no images at all (not when a filter empties the result).
  if (annotated.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10 text-5xl">
          📷
        </div>
        <h2 className="mb-3 text-2xl font-semibold text-white">
          No images found
        </h2>
        <p className="max-w-md text-gray-400">
          Upload images to your Cloudinary account in the folder specified by{' '}
          <code className="rounded-md bg-gray-800 px-2 py-1 font-mono text-sm text-brand-300">
            CLOUDINARY_FOLDER
          </code>{' '}
          and refresh the page.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filters row: tag pills + search + sort */}
      <div className="mb-6 space-y-4">
        {/* Tag pill row — only renders when this category has tagged images */}
        {availableTags.length > 0 && (
          <div
            role="group"
            aria-label="Filter by tag"
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setSelectedTags([])}
              aria-pressed={selectedTags.length === 0}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                selectedTags.length === 0
                  ? 'bg-white text-gray-900'
                  : 'bg-white/5 text-gray-300 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              All
            </button>
            {availableTags.map(({ display }) => {
              const key = display.toLowerCase();
              const active = selectedTags.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleTag(display)}
                  aria-pressed={active}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
                    active
                      ? 'bg-brand-500/20 text-brand-100 ring-1 ring-inset ring-brand-400/50 shadow-sm shadow-brand-500/20'
                      : 'bg-white/5 text-gray-300 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {display}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search input */}
          <div className="relative w-full sm:max-w-xs">
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search images…"
              aria-label="Search images"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-xs uppercase tracking-wide text-gray-400">
              Sort
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-100 focus:border-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            >
              {(Object.keys(SORT_LABELS) as SortOrder[]).map((key) => (
                <option key={key} value={key} className="bg-gray-900">
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty filtered state — covers both search and tag filters. */}
        {filteredImages.length === 0 && (searchQuery || selectedTags.length > 0) && (
          <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">
            No images match your filters.{' '}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTags([]);
              }}
              className="font-medium text-brand-300 underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          </p>
        )}
      </div>

      {/* Masonry layout via CSS columns — pure Tailwind utilities */}
      <div className="columns-2 gap-3 space-y-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-5 2xl:columns-6">
        {filteredImages.map(({ img: image }, index) => {
          const aspectRatio = image.width / image.height;
          return (
            <button
              key={image.public_id}
              onClick={() => setSelectedIndex(index)}
              className="group relative block w-full cursor-pointer overflow-hidden rounded-xl bg-gray-900 break-inside-avoid animate-fade-in shadow-lg ring-1 ring-white/5 transition-all duration-300 hover:shadow-glow hover:ring-brand-400/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
              style={{ aspectRatio }}
              aria-label={`View image ${index + 1} of ${filteredImages.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  isDemoImage(image)
                    ? image.secure_url
                    : buildCloudinaryUrl(image, { width: 800 })
                }
                width={image.width}
                height={image.height}
                alt={image.context?.custom?.alt || `Gallery image ${index + 1}`}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1536px) 20vw, 16vw"
                className="h-auto w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading={index < 8 ? 'eager' : 'lazy'}
              />
              {/*
                NOTE: switched away from <CldImage> to keep rendering
                independent of NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME being inlined
                into the client bundle. We build the delivery URL from
                image.secure_url, which already embeds the cloud name.
              */}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Caption (if present) */}
              {image.context?.custom?.caption && (
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-sm text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {image.context.custom.caption}
                </div>
              )}

              {/* Zoom icon indicator */}
              <div className="absolute right-3 top-3 flex h-9 w-9 scale-75 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
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
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && filteredImages[selectedIndex] && (
        <Lightbox
          images={filteredImages}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
          onSelectIndex={setSelectedIndex}
        />
      )}
    </>
  );
}

interface LightboxImage {
  img: CloudinaryImage;
  category: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

const DOWNLOAD_SIZES: { label: string; width: number | 'original' }[] = [
  { label: 'Small', width: 400 },
  { label: 'Medium', width: 800 },
  { label: 'Large', width: 1600 },
  { label: 'Original', width: 'original' },
];

type ImageFilter = {
  id: string;
  label: string;
  cloudinary: string; // empty string = no transform
  css: string; // empty string = no CSS filter
};

/**
 * Filter presets modelled on the most-used filters from Instagram, VSCO,
 * and classic film emulation. Cloudinary doesn't ship 1:1 LUTs for these,
 * so each preset stacks its primitive adjustments (brightness, saturation,
 * contrast, sepia, grayscale, hue) to closely approximate the named look.
 */
const IMAGE_FILTERS: ImageFilter[] = [
  { id: 'none', label: 'Original', cloudinary: '', css: '' },

  // Instagram's most-used filter overall. Bright, cool, punchy contrast.
  {
    id: 'clarendon',
    label: 'Clarendon',
    cloudinary: 'e_brightness:8,e_saturation:25,e_contrast:15,e_blue:10',
    css: 'brightness(108%) contrast(115%) saturate(125%) hue-rotate(-5deg)',
  },

  // Warm, vibrant Instagram pop — flattering for portraits and food.
  {
    id: 'juno',
    label: 'Juno',
    cloudinary: 'e_brightness:5,e_saturation:30,e_contrast:10,e_red:10',
    css: 'saturate(140%) contrast(110%) brightness(105%) sepia(8%)',
  },

  // Soft, faded vintage look — Instagram Gingham.
  {
    id: 'gingham',
    label: 'Gingham',
    cloudinary: 'e_sepia:15,e_brightness:5,e_saturation:-15,e_contrast:-5',
    css: 'sepia(15%) brightness(105%) saturate(85%) contrast(95%)',
  },

  // Bright, light, slightly desaturated reds — Instagram Lark.
  {
    id: 'lark',
    label: 'Lark',
    cloudinary: 'e_brightness:12,e_saturation:-10,e_contrast:5',
    css: 'brightness(110%) saturate(90%) contrast(105%)',
  },

  // High-contrast monochrome — Instagram Moon (balanced B&W).
  {
    id: 'moon',
    label: 'Moon',
    cloudinary: 'e_grayscale,e_contrast:20,e_brightness:5',
    css: 'grayscale(100%) contrast(120%) brightness(105%)',
  },

  // Film-noir B&W — deep blacks, blown highlights, dramatic mood.
  // Uses raw grayscale + heavy contrast for a guaranteed strong B&W look,
  // distinct from Moon's softer balanced grayscale.
  {
    id: 'noir',
    label: 'Noir',
    cloudinary: 'e_grayscale,e_contrast:55,e_brightness:-8',
    css: 'grayscale(100%) contrast(155%) brightness(92%)',
  },

  // Hollywood teal-and-orange colour grade — high-end editorial look.
  {
    id: 'cinematic',
    label: 'Cinematic',
    cloudinary: 'e_saturation:20,e_contrast:25,e_blue:15,e_brightness:-3',
    css: 'saturate(120%) contrast(125%) brightness(97%) hue-rotate(-3deg)',
  },

  // Faded analog film — VSCO / Polaroid emulation.
  {
    id: 'polaroid',
    label: 'Polaroid',
    cloudinary: 'e_sepia:25,e_brightness:5,e_saturation:-20,e_contrast:8',
    css: 'sepia(25%) brightness(105%) saturate(80%) contrast(108%)',
  },

  // High Dynamic Range — boosted detail, popular for landscapes/products.
  {
    id: 'hdr',
    label: 'HDR',
    cloudinary: 'e_improve:50,e_saturation:30,e_contrast:20,e_sharpen:60',
    css: 'saturate(140%) contrast(125%) brightness(102%)',
  },

  // Lomography — saturated, contrasty, dark vignette.
  {
    id: 'lomo',
    label: 'Lomo',
    cloudinary: 'e_saturation:50,e_contrast:25,e_vignette:60,e_red:5',
    css: 'saturate(160%) contrast(130%) brightness(95%)',
  },

  // Pop Art — Warhol-inspired oversaturated, bold blocks of colour.
  {
    id: 'popart',
    label: 'Pop Art',
    cloudinary: 'e_saturation:80,e_contrast:40,e_vibrance:50,e_brightness:5',
    css: 'saturate(220%) contrast(140%) brightness(105%) hue-rotate(8deg)',
  },

  // Cyberpunk / Neon — magenta-cyan colour grade, glowing edges.
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    cloudinary: 'e_saturation:60,e_contrast:35,e_blue:25,e_red:15,e_brightness:-5',
    css: 'saturate(170%) contrast(125%) brightness(95%) hue-rotate(-25deg)',
  },

  // Pastel / Dreamy — soft, airy, low contrast.
  {
    id: 'pastel',
    label: 'Pastel',
    cloudinary: 'e_brightness:15,e_saturation:-25,e_contrast:-15',
    css: 'saturate(70%) brightness(115%) contrast(85%)',
  },

  // Kodak Portra emulation — warm peachy skin tones, soft lifted contrast.
  // Uses Cloudinary's `al_dente` art filter as a guaranteed-visible warm base,
  // then softens contrast and lifts brightness for the classic Portra feel.
  {
    id: 'kodak',
    label: 'Kodak',
    cloudinary: 'e_art:al_dente,e_brightness:8,e_contrast:-15',
    css: 'sepia(25%) saturate(95%) brightness(108%) contrast(85%) hue-rotate(-5deg)',
  },

  // Fuji Pro emulation — clean, slightly cool greens, balanced contrast.
  // Uses Cloudinary's `eucalyptus` art filter for a green-cool base,
  // then nudges brightness for the clean Fuji feel.
  {
    id: 'fuji',
    label: 'Fuji',
    cloudinary: 'e_art:eucalyptus,e_brightness:5,e_saturation:-10',
    css: 'saturate(90%) brightness(105%) contrast(98%) hue-rotate(8deg)',
  },
];

// Effects that must run in their own Cloudinary pipeline step. If we put
// these in the same step as other effects, the others re-introduce colour
// (e.g. `e_grayscale,e_contrast:N` only desaturates ~20% of pixels). Other
// effects (sepia, brightness, saturation, etc.) MUST stay combined with
// commas — running them in their own step makes Cloudinary apply each at
// full strength rather than blending, which produces artefacts like a fully
// yellow image from a 25% sepia value.
const ISOLATED_EFFECTS = new Set(['e_grayscale', 'e_blackwhite', 'e_negate']);

/**
 * Build a Cloudinary delivery URL for the given image with optional resize,
 * effect, and download flags. Returns the original `secure_url` for demo
 * (Unsplash) sources except for resizing — those use the `w=` query param.
 */
function buildCloudinaryUrl(
  image: CloudinaryImage,
  opts: {
    width?: number | 'original';
    effect?: string;
    asAttachment?: boolean;
  } = {}
): string {
  const { width, effect, asAttachment } = opts;
  const filename = (image.public_id.split('/').pop() || 'image').replace(/^demo:/, '');

  if (isDemoImage(image)) {
    // Unsplash supports `w=`; effects and attachments aren't available there.
    if (width && width !== 'original') {
      return image.secure_url.replace(/w=\d+/, `w=${width}`);
    }
    if (width === 'original') {
      return image.secure_url.replace(/w=\d+/, 'w=2400');
    }
    return image.secure_url;
  }

  const steps: string[] = [];

  // Resize/quality go together as the first step.
  if (typeof width === 'number') {
    steps.push(`w_${width},c_limit,q_auto`);
  }

  if (effect) {
    const parts = effect.split(',').map((s) => s.trim()).filter(Boolean);
    const isolated = parts.filter((p) => ISOLATED_EFFECTS.has(p.split(':')[0]));
    const combined = parts.filter((p) => !ISOLATED_EFFECTS.has(p.split(':')[0]));

    // Isolated effects each in their own step, applied first.
    for (const e of isolated) steps.push(e);
    // Other effects all in one step so they blend rather than each running
    // at full strength on the previous output.
    if (combined.length > 0) steps.push(combined.join(','));
  }

  if (asAttachment) {
    steps.push(`fl_attachment:${filename}`);
  }

  if (steps.length === 0) return image.secure_url;
  return image.secure_url.replace('/upload/', `/upload/${steps.join('/')}/`);
}

function buildDownloadUrl(
  image: CloudinaryImage,
  width: number | 'original',
  effect = ''
): string {
  return buildCloudinaryUrl(image, { width, effect, asAttachment: true });
}

function deriveDescription(
  image: CloudinaryImage,
  category: string
): string {
  const explicit = image.context?.custom?.caption;
  if (explicit) return explicit;

  const dims = `${image.width} × ${image.height}`;
  const fmt = image.format ? image.format.toUpperCase() : 'image';
  const orientation =
    image.width > image.height
      ? 'landscape'
      : image.width < image.height
      ? 'portrait'
      : 'square';
  const cat = category && category !== 'Uncategorized' ? `${category} ` : '';

  return `${cat}${orientation} ${fmt} image at ${dims}.`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function deriveTitle(image: CloudinaryImage): string {
  if (image.context?.custom?.alt) return image.context.custom.alt;
  const tail = image.public_id.split('/').pop() || image.public_id;
  return tail
    .replace(/^demo:/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectLabel(w: number, h: number): string {
  const g = gcd(w, h);
  return `${w / g} : ${h / g}`;
}

const SLIDESHOW_DURATION_MS = 3500;

function Lightbox({
  images,
  currentIndex,
  onClose,
  onSelectIndex,
}: LightboxProps) {
  const totalImages = images.length;
  const { img: image, category } = images[currentIndex];
  const isDemo = isDemoImage(image);
  const title = deriveTitle(image);
  const description = deriveDescription(image, category);
  const hasExplicitCaption = Boolean(image.context?.custom?.caption);

  type Panel = 'info' | 'thumbs' | null;
  type InfoTab = 'info' | 'effects' | 'download';

  const [activeFilterId, setActiveFilterId] = useState<string>('none');
  const [panel, setPanel] = useState<Panel>(null);
  const [infoTab, setInfoTab] = useState<InfoTab>('info');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const activeFilter =
    IMAGE_FILTERS.find((f) => f.id === activeFilterId) || IMAGE_FILTERS[0];

  // Reset transient per-image state when the user navigates.
  useEffect(() => {
    setActiveFilterId('none');
    setIsZoomed(false);
  }, [image.public_id]);

  // Slideshow: advance to the next image after SLIDESHOW_DURATION_MS, with a
  // progress bar that fills smoothly. Loops back to 0 at the end.
  useEffect(() => {
    if (!isPlaying) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const start = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / SLIDESHOW_DURATION_MS) * 100);
      setProgress(pct);
      if (elapsed >= SLIDESHOW_DURATION_MS) {
        onSelectIndex((currentIndex + 1) % totalImages);
      }
    }, 50);
    return () => window.clearInterval(tick);
  }, [isPlaying, currentIndex, totalImages, onSelectIndex]);

  // Keep our `isFullscreen` state in sync with the actual document state, so
  // pressing Esc to exit fullscreen still updates the toolbar icon.
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Auto-dismiss toast after 2s.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  const displayUrl = isDemo
    ? image.secure_url.replace(/w=\d+/, 'w=1600')
    : buildCloudinaryUrl(image, {
        width: 1600,
        effect: activeFilter.cloudinary,
      });

  const onPrev = () => {
    if (currentIndex > 0) onSelectIndex(currentIndex - 1);
  };
  const onNext = () => {
    if (currentIndex < totalImages - 1) onSelectIndex(currentIndex + 1);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setToast('Fullscreen unavailable');
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    // Prefer the native share sheet on devices that support it (mostly mobile).
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied to clipboard');
    } catch {
      setToast('Could not copy link');
    }
  };

  const togglePanel = (next: Exclude<Panel, null>) =>
    setPanel((p) => (p === next ? null : next));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md animate-fade-in-fast"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      {/* Top bar: counter (left) + toolbar (right) */}
      <div
        className="absolute inset-x-0 top-0 z-40 flex items-center justify-between gap-3 px-3 py-3 sm:px-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-full bg-black/40 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
          <span className="text-white">{currentIndex + 1}</span>
          <span className="text-white/40"> / {totalImages}</span>
        </div>

        <div className="flex items-center gap-0.5 rounded-full bg-black/40 p-1 backdrop-blur-sm">
          <ToolbarButton
            label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            active={isPlaying}
            onClick={() => setIsPlaying((p) => !p)}
          >
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </ToolbarButton>

          <ToolbarButton
            label={isZoomed ? 'Zoom out' : 'Zoom in'}
            active={isZoomed}
            onClick={() => setIsZoomed((z) => !z)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              {!isZoomed && <line x1="8" y1="11" x2="14" y2="11" />}
            </svg>
          </ToolbarButton>

          <ToolbarButton label="Share" onClick={handleShare}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            label="Thumbnails"
            active={panel === 'thumbs'}
            onClick={() => togglePanel('thumbs')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            label="Image info"
            active={panel === 'info'}
            onClick={() => togglePanel('info')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            active={isFullscreen}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 3v4a1 1 0 0 1-1 1H3" />
                <path d="M21 8h-4a1 1 0 0 1-1-1V3" />
                <path d="M3 16h4a1 1 0 0 1 1 1v4" />
                <path d="M16 21v-4a1 1 0 0 1 1-1h4" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
              </svg>
            )}
          </ToolbarButton>

          <ToolbarButton label="Close" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Slideshow progress bar — positioned just under the top bar. */}
      {isPlaying && (
        <div className="absolute inset-x-0 top-[60px] z-20 h-0.5 bg-white/10">
          <div
            className="h-full bg-brand-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Image stage with side nav arrows */}
      <div
        className="relative flex h-full w-full items-center justify-center overflow-hidden px-2 sm:px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-md bg-black/60 text-white shadow-lg transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-brand-400 sm:left-4 sm:h-14 sm:w-14"
            aria-label="Previous image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
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
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${image.public_id}-${activeFilterId}`}
          src={displayUrl}
          width={image.width}
          height={image.height}
          alt={image.context?.custom?.alt || `Gallery image ${currentIndex + 1}`}
          onClick={() => setIsZoomed((z) => !z)}
          className={`max-h-[88vh] max-w-[90vw] select-none rounded-lg object-contain shadow-2xl transition-transform duration-300 ease-out ${
            isZoomed
              ? 'scale-150 cursor-zoom-out'
              : 'scale-100 cursor-zoom-in'
          }`}
          style={isDemo ? { filter: activeFilter.css || 'none' } : undefined}
          draggable={false}
        />

        {currentIndex < totalImages - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-md bg-black/60 text-white shadow-lg transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-brand-400 sm:right-4 sm:h-14 sm:w-14"
            aria-label="Next image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
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
          </button>
        )}
      </div>

      {/* Slide-in info panel (right) — tabs: info / effects / download.
          Sits below the top toolbar so the Info button stays clickable. */}
      {panel === 'info' && (
        <aside
          className="absolute bottom-0 right-0 top-[64px] z-30 flex w-full max-w-sm flex-col border-l border-white/10 bg-black/85 text-sm text-gray-200 backdrop-blur-md animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tab bar */}
          <div className="flex shrink-0 border-b border-white/10 px-2 pt-2">
            {([
              { id: 'info', label: 'Info' },
              { id: 'effects', label: 'Effects' },
              { id: 'download', label: 'Download' },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setInfoTab(t.id)}
                aria-pressed={infoTab === t.id}
                className={`-mb-px border-b-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  infoTab === t.id
                    ? 'border-brand-400 text-brand-300'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {infoTab === 'info' && (
              <>
                <h2 className="text-lg font-semibold text-white">{title}</h2>

                <div className="mt-3">
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Description
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      hasExplicitCaption ? 'text-gray-200' : 'italic text-gray-400'
                    }`}
                  >
                    {description}
                  </p>
                </div>

                <dl className="mt-5 space-y-3 border-t border-white/10 pt-4">
                  <MetaRow label="Category" value={category} />
                  <MetaRow
                    label="Dimensions"
                    value={`${image.width} × ${image.height}`}
                  />
                  <MetaRow
                    label="Aspect ratio"
                    value={aspectLabel(image.width, image.height)}
                  />
                  <MetaRow
                    label="Format"
                    value={image.format?.toUpperCase() || '—'}
                  />
                  {!isDemo && (
                    <>
                      <MetaRow label="File size" value={formatBytes(image.bytes)} />
                      <MetaRow
                        label="Uploaded"
                        value={formatDate(image.created_at)}
                      />
                      <MetaRow label="Public ID" value={image.public_id} mono />
                    </>
                  )}
                  {isDemo && <MetaRow label="Source" value="Unsplash (demo)" />}
                </dl>
              </>
            )}

            {infoTab === 'effects' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Effects
                  </h3>
                  {activeFilterId !== 'none' && (
                    <span className="text-[11px] text-brand-300">
                      {activeFilter.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_FILTERS.map((filter) => {
                    const active = filter.id === activeFilterId;
                    const thumbUrl = isDemo
                      ? image.secure_url.replace(/w=\d+/, 'w=160')
                      : buildCloudinaryUrl(image, {
                          width: 160,
                          effect: filter.cloudinary,
                        });
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setActiveFilterId(filter.id)}
                        aria-pressed={active}
                        className={`group flex flex-col items-center gap-1 rounded-lg border p-1 text-[11px] transition-all ${
                          active
                            ? 'border-brand-400/60 bg-brand-500/10 text-brand-200 shadow-sm shadow-brand-500/20'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbUrl}
                          alt={filter.label}
                          className="h-14 w-full rounded object-cover"
                          style={
                            isDemo ? { filter: filter.css || 'none' } : undefined
                          }
                          loading="lazy"
                        />
                        <span className="font-medium">{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
                {isDemo && (
                  <p className="mt-3 text-[11px] text-gray-500">
                    Effects on demo images preview via CSS only — downloads stay
                    unfiltered.
                  </p>
                )}
              </>
            )}

            {infoTab === 'download' && (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Download
                  </h3>
                  {activeFilterId !== 'none' && !isDemo && (
                    <span className="text-[11px] text-brand-300">
                      with {activeFilter.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DOWNLOAD_SIZES.map(({ label, width }) => {
                    const url = buildDownloadUrl(
                      image,
                      width,
                      activeFilter.cloudinary
                    );
                    const filename =
                      (image.public_id.split('/').pop() || 'image').replace(
                        /^demo:/,
                        ''
                      ) +
                      (activeFilterId !== 'none' ? `-${activeFilterId}` : '') +
                      (image.format ? `.${image.format}` : '');
                    const sizeHint =
                      width === 'original'
                        ? `${image.width}px`
                        : `${Math.min(width, image.width)}px`;
                    return (
                      <a
                        key={label}
                        href={url}
                        download={filename}
                        target={isDemo ? '_blank' : undefined}
                        rel={isDemo ? 'noopener noreferrer' : undefined}
                        className="flex flex-col items-start rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-200 transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 hover:text-brand-200"
                      >
                        <span className="font-medium">{label}</span>
                        <span className="text-[11px] text-gray-400">
                          {sizeHint}
                        </span>
                      </a>
                    );
                  })}
                </div>
                {isDemo && (
                  <p className="mt-3 text-[11px] text-gray-500">
                    Demo images open in a new tab — your browser will save them
                    from there.
                  </p>
                )}
              </>
            )}
          </div>
        </aside>
      )}

      {/* Thumbnails strip — bottom overlay */}
      {panel === 'thumbs' && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 max-h-72 overflow-y-auto border-t border-white/10 bg-black/85 p-4 backdrop-blur-md animate-slide-in-bottom"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
            {images.map(({ img }, i) => {
              const url = isDemoImage(img)
                ? img.secure_url.replace(/w=\d+/, 'w=200')
                : buildCloudinaryUrl(img, { width: 200 });
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={img.public_id}
                  onClick={() => onSelectIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={isCurrent}
                  className={`block h-16 w-full overflow-hidden rounded-md bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-400 sm:h-20 ${
                    isCurrent
                      ? 'scale-105 ring-2 ring-brand-400'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toast (share/copy feedback) */}
      {toast && (
        <div className="pointer-events-none absolute bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm animate-fade-in-fast">
          {toast}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 ${
        active
          ? 'bg-brand-500/30 text-brand-200'
          : 'text-white/85 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function MetaRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-sm text-gray-100 ${
          mono ? 'font-mono text-xs' : ''
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
