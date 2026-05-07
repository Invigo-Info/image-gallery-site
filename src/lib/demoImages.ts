import type { CloudinaryImage } from './imageTypes';

/**
 * Demo image set used when Cloudinary returns no results, so the showcase
 * renders something out-of-the-box. Replace by uploading images to the
 * Cloudinary folder configured in CLOUDINARY_FOLDER.
 */

type DemoSeed = {
  id: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  category: string;
  tags?: string[];
};

const seeds: DemoSeed[] = [
  { id: 'photo-1506744038136-46273834b3fb', width: 1200, height: 1600, alt: 'Mountain lake at dusk', caption: 'Mountain lake at dusk', category: 'mountains', tags: ['Landscape', 'Light'] },
  { id: 'photo-1441974231531-c6227db76b6e', width: 1600, height: 1067, alt: 'Forest light beams', caption: 'Forest light beams', category: 'forest', tags: ['Landscape', 'Light'] },
  { id: 'photo-1518837695005-2083093ee35b', width: 1200, height: 1500, alt: 'Ocean cliffs', caption: 'Ocean cliffs', category: 'coast', tags: ['Landscape', 'Sea'] },
  { id: 'photo-1500382017468-9049fed747ef', width: 1600, height: 1200, alt: 'Autumn field', caption: 'Autumn field', category: 'fields', tags: ['Landscape'] },
  { id: 'photo-1470770841072-f978cf4d019e', width: 1200, height: 1800, alt: 'Reflective lake', caption: 'Reflective lake', category: 'lakes', tags: ['Landscape'] },
  { id: 'photo-1501785888041-af3ef285b470', width: 1600, height: 1067, alt: 'Foggy mountain road', caption: 'Foggy mountain road', category: 'mountains', tags: ['Landscape', 'Fog'] },
  { id: 'photo-1507525428034-b723cf961d3e', width: 1600, height: 1066, alt: 'Tropical beach', caption: 'Tropical beach', category: 'coast', tags: ['Sea', 'Landscape'] },
  { id: 'photo-1493246507139-91e8fad9978e', width: 1200, height: 1500, alt: 'Snowy peaks', caption: 'Snowy peaks', category: 'mountains', tags: ['Landscape', 'Black and White'] },
  { id: 'photo-1469474968028-56623f02e42e', width: 1600, height: 1067, alt: 'Misty valley', caption: 'Misty valley', category: 'mountains', tags: ['Landscape', 'Fog'] },
  { id: 'photo-1418065460487-3e41a6c84dc5', width: 1200, height: 1600, alt: 'Desert dunes', caption: 'Desert dunes', category: 'desert', tags: ['Landscape', 'Desert'] },
  { id: 'photo-1510784722466-f2aa9c52fff6', width: 1600, height: 1200, alt: 'Coastal sunset', caption: 'Coastal sunset', category: 'coast', tags: ['Sea', 'Light'] },
  { id: 'photo-1447752875215-b2761acb3c5d', width: 1200, height: 1500, alt: 'Forest canopy', caption: 'Forest canopy', category: 'forest', tags: ['Landscape'] },
  { id: 'photo-1439066615861-d1af74d74000', width: 1600, height: 1067, alt: 'Cabin in the woods', caption: 'Cabin in the woods', category: 'forest', tags: ['Landscape', 'Interior'] },
  { id: 'photo-1426604966848-d7adac402bff', width: 1600, height: 1067, alt: 'Yosemite valley', caption: 'Yosemite valley', category: 'mountains', tags: ['Landscape'] },
  { id: 'photo-1472214103451-9374bd1c798e', width: 1200, height: 1800, alt: 'Aurora sky', caption: 'Aurora sky', category: 'sky', tags: ['Landscape', 'Light'] },
  { id: 'photo-1464822759023-fed622ff2c3b', width: 1600, height: 1067, alt: 'Iceberg lagoon', caption: 'Iceberg lagoon', category: 'lakes', tags: ['Landscape'] },
  { id: 'photo-1416879595882-3373a0480b5b', width: 1200, height: 1500, alt: 'Pine forest', caption: 'Pine forest', category: 'forest', tags: ['Landscape'] },
  { id: 'photo-1432889490240-84df33d47091', width: 1600, height: 1067, alt: 'Sunlit grassland', caption: 'Sunlit grassland', category: 'fields', tags: ['Landscape', 'Light'] },
  { id: 'photo-1473773508845-188df298d2d1', width: 1200, height: 1600, alt: 'Cliffside village', caption: 'Cliffside village', category: 'coast', tags: ['Sea', 'Urban'] },
  { id: 'photo-1444703686981-a3abbc4d4fe3', width: 1600, height: 1067, alt: 'River bend', caption: 'River bend', category: 'lakes', tags: ['Landscape'] },
  { id: 'photo-1454496522488-7a8e488e8606', width: 1200, height: 1500, alt: 'Alpine pass', caption: 'Alpine pass', category: 'mountains', tags: ['Landscape', 'Black and White'] },
  { id: 'photo-1502082553048-f009c37129b9', width: 1200, height: 1800, alt: 'Tall trees', caption: 'Tall trees', category: 'forest', tags: ['Landscape'] },
  { id: 'photo-1490604001847-b712b0c2f967', width: 1600, height: 1067, alt: 'Mountain town', caption: 'Mountain town', category: 'mountains', tags: ['Urban', 'Landscape'] },
  { id: 'photo-1505765050516-f72dcac9c60e', width: 1200, height: 1500, alt: 'Tropical leaves', caption: 'Tropical leaves', category: 'forest', tags: ['Landscape'] },
];

export const demoImages: CloudinaryImage[] = seeds.map((seed) => {
  const url = `https://images.unsplash.com/${seed.id}?auto=format&fit=crop&w=900&q=80`;
  return {
    public_id: `demo:${seed.id}`,
    width: seed.width,
    height: seed.height,
    format: 'jpg',
    secure_url: url,
    created_at: new Date().toISOString(),
    bytes: 0,
    asset_folder: `demo/${seed.category}`,
    tags: seed.tags,
    context: { custom: { alt: seed.alt, caption: seed.caption } },
  };
});

export function isDemoImage(image: CloudinaryImage): boolean {
  return image.public_id.startsWith('demo:');
}
