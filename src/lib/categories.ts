import { isDemoImage } from './demoImages';
import {
  categoryToSlug,
  getImageCategory,
  type CloudinaryImage,
} from './imageTypes';

export interface CategorySummary {
  name: string;
  slug: string; // e.g. "author-photos"
  count: number;
  hero: CloudinaryImage; // most recent image — used as the cover
}

const HIDDEN_CATEGORIES = new Set(['Uncategorized']);

/**
 * Group images by category and return one summary per visible category,
 * with the most recent image as the cover. "Uncategorized" images are
 * excluded from the landing-page showcase.
 */
export function getCategorySummaries(
  images: CloudinaryImage[],
  rootFolder: string
): CategorySummary[] {
  const groups = new Map<string, CloudinaryImage[]>();
  for (const img of images) {
    const cat = isDemoImage(img)
      ? getImageCategory(img, 'demo')
      : getImageCategory(img, rootFolder);
    if (HIDDEN_CATEGORIES.has(cat)) continue;
    const list = groups.get(cat) ?? [];
    list.push(img);
    groups.set(cat, list);
  }

  const summaries: CategorySummary[] = [];
  for (const [name, imgs] of groups) {
    const hero = imgs.reduce(
      (latest, img) =>
        img.created_at.localeCompare(latest.created_at) > 0 ? img : latest,
      imgs[0]
    );
    summaries.push({
      name,
      slug: categoryToSlug(name),
      count: imgs.length,
      hero,
    });
  }

  return summaries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Return only the images belonging to the given category. Used by the
 * category route so the client only ships that subset of images.
 */
export function filterImagesByCategory(
  images: CloudinaryImage[],
  rootFolder: string,
  category: string
): CloudinaryImage[] {
  const target = category.toLowerCase();
  return images.filter((img) => {
    const cat = isDemoImage(img)
      ? getImageCategory(img, 'demo')
      : getImageCategory(img, rootFolder);
    return cat.toLowerCase() === target;
  });
}

/**
 * Build a Cloudinary delivery URL that fills `width × height` using auto-
 * gravity. Falls back to the original URL for demo (Unsplash) images,
 * swapping the `w=` query so they're not full-resolution.
 */
export function buildCoverUrl(
  image: CloudinaryImage,
  width: number,
  height: number
): string {
  if (isDemoImage(image)) {
    return image.secure_url.replace(/w=\d+/, `w=${width}`);
  }
  return image.secure_url.replace(
    '/upload/',
    `/upload/c_fill,w_${width},h_${height},g_auto,f_auto,q_auto/`
  );
}
