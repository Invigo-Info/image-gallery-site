/**
 * Pure types and helpers safe to import from client components.
 * Keep this file free of any Node-only imports (e.g. the Cloudinary SDK).
 */

export interface CloudinaryImage {
  public_id: string;
  width: number;
  height: number;
  format: string;
  secure_url: string;
  created_at: string;
  bytes: number;
  asset_folder?: string;
  folder?: string;
  /** Cloudinary tags array — returned by the Search API when set on the asset. */
  tags?: string[];
  context?: {
    custom?: {
      alt?: string;
      caption?: string;
    };
  };
}

export interface CloudinarySearchResult {
  resources: CloudinaryImage[];
  next_cursor?: string;
  total_count: number;
}

const UNCATEGORIZED = 'Uncategorized';

/**
 * Extract a category label from an image's folder path. The first folder
 * segment under the configured root folder is used as the category.
 *
 * Examples (rootFolder="gallery"):
 *   "gallery/portraits"        → "Portraits"
 *   "gallery/nature/wild"      → "Nature"
 *   "gallery"                  → "Uncategorized"
 *   undefined                  → "Uncategorized"
 */
export function getImageCategory(
  image: CloudinaryImage,
  rootFolder: string
): string {
  const path = image.asset_folder || image.folder || '';
  const trimmedRoot = rootFolder.replace(/^\/+|\/+$/g, '');
  let sub = path;
  if (trimmedRoot && sub.startsWith(trimmedRoot)) {
    sub = sub.slice(trimmedRoot.length);
  }
  const segments = sub.split('/').filter(Boolean);
  if (segments.length === 0) return UNCATEGORIZED;
  return segments[0]
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extract sub-category tags for an image.
 *
 * Two sources are merged (deduped, case-insensitive):
 *   1. Cloudinary `tags` field set on the asset.
 *   2. Sub-folder segments beneath the category folder. Example with
 *      rootFolder="gallery": "gallery/actor/portrait" → ["Portrait"].
 *
 * Tags are returned in their display form (Title Case, hyphens/underscores
 * converted to spaces). Empty array when the image has no derivable tags.
 */
export function getImageTags(
  image: CloudinaryImage,
  rootFolder: string
): string[] {
  const out: string[] = [];

  if (image.tags && image.tags.length > 0) {
    for (const t of image.tags) out.push(prettifyTag(t));
  }

  const path = image.asset_folder || image.folder || '';
  const trimmedRoot = rootFolder.replace(/^\/+|\/+$/g, '');
  let sub = path;
  if (trimmedRoot && sub.startsWith(trimmedRoot)) {
    sub = sub.slice(trimmedRoot.length);
  }
  const segments = sub.split('/').filter(Boolean);
  // segments[0] is the category itself; everything beyond it is a tag.
  if (segments.length > 1) {
    for (const seg of segments.slice(1)) out.push(prettifyTag(seg));
  }

  // Dedupe case-insensitively, preserving first-seen casing.
  const seen = new Set<string>();
  return out.filter((t) => {
    const key = t.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Words kept lowercase in slug → title-case conversion ("black-and-white"
// → "Black and White"). The first word is always capitalized regardless.
const TITLE_CASE_STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of',
  'on', 'or', 'the', 'to', 'vs', 'with',
]);

function prettifyTag(raw: string): string {
  const trimmed = raw.trim();
  // If the tag already contains a space, treat it as a human-readable label
  // and preserve the original casing (e.g. "Black and White").
  if (/\s/.test(trimmed)) return trimmed;
  // Otherwise it's a slug-style tag (kebab- or snake_case); convert to a
  // Title-Cased space-separated label, keeping common conjunctions lowercase.
  return trimmed
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map((word, i) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      if (i > 0 && TITLE_CASE_STOP_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

export const ALL_CATEGORIES_LABEL = 'All';
const CATEGORY_SLUG_SUFFIX = '-photos';

/**
 * Convert a category label (e.g. "Mountain Lakes") to a URL slug
 * (e.g. "mountain-lakes-photos") used by the per-category route.
 */
export function categoryToSlug(category: string): string {
  return (
    category
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + CATEGORY_SLUG_SUFFIX
  );
}

/**
 * Inverse of categoryToSlug. Returns null when the slug doesn't end with the
 * expected `-photos` suffix or is empty.
 */
export function slugToCategory(slug: string): string | null {
  if (!slug.endsWith(CATEGORY_SLUG_SUFFIX)) return null;
  const raw = slug.slice(0, -CATEGORY_SLUG_SUFFIX.length);
  if (!raw) return null;
  return raw
    .replace(/-+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
