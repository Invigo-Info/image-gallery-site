import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryImage, CloudinarySearchResult } from './imageTypes';

export type { CloudinaryImage, CloudinarySearchResult } from './imageTypes';
export { getImageCategory } from './imageTypes';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Fetches images from Cloudinary using the Search API.
 * Returns images sorted by newest first.
 */
/**
 * Fetches every image under the configured root folder by walking the
 * Cloudinary search cursor until exhausted. Capped to avoid runaway
 * pagination on very large libraries.
 */
export async function getAllGalleryImages(
  hardLimit: number = 1000
): Promise<CloudinarySearchResult> {
  const all: CloudinaryImage[] = [];
  let cursor: string | undefined;
  let total = 0;

  do {
    const page = await getGalleryImages(cursor, 500);
    if (page.resources.length === 0 && all.length === 0) {
      // Cloudinary search returned nothing on the first page (likely an error
      // path that already logged); short-circuit so callers see an empty list.
      return page;
    }
    all.push(...page.resources);
    total = page.total_count;
    cursor = page.next_cursor;
  } while (cursor && all.length < hardLimit);

  return { resources: all, total_count: total };
}

export async function getGalleryImages(
  nextCursor?: string,
  maxResults: number = 100
): Promise<CloudinarySearchResult> {
  const folder = process.env.CLOUDINARY_FOLDER || '';

  // Match images directly in the root folder OR in any subfolder beneath it.
  const expression = folder
    ? `(folder:${folder} OR folder:${folder}/*) AND resource_type:image`
    : 'resource_type:image';

  try {
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .with_field('context')
      .next_cursor(nextCursor || '')
      .execute();

    return {
      resources: result.resources as CloudinaryImage[],
      next_cursor: result.next_cursor,
      total_count: result.total_count,
    };
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return { resources: [], total_count: 0 };
  }
}
