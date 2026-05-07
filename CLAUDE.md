# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (default port 3000; the Playwright tests in this repo target ports 3003/3005, so dev may be run on a different port via `next dev -p <port>`).
- `npm run build` — production build.
- `npm run start` — run the production build.
- `npm run lint` — run `next lint`.
- No unit test runner is configured. `test_cld.py`, `test_lightbox.py`, `test_tags.py` are ad-hoc Playwright (Python) smoke tests run against a live dev server; invoke individually with `python test_<name>.py`.

## Environment

`.env.local` must define:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — exposed to the browser; required by `next-cloudinary`'s `<CldImage>`.
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — server-only, used by the Search API in `src/lib/cloudinary.ts`.
- `CLOUDINARY_FOLDER` — root folder whose direct children become categories (e.g. `gallery`).

## Architecture

Next.js 14 App Router. Path alias `@/*` → `src/*`.

### Data flow (Cloudinary → categories → gallery)

1. `src/lib/cloudinary.ts` (server-only — imports the `cloudinary` SDK) calls the Search API. `getAllGalleryImages()` walks the `next_cursor` until exhausted (capped at 1000) and matches both `folder:<root>` and `folder:<root>/*` so any depth of subfolder is included. The secret never leaves the server.
2. `src/lib/imageTypes.ts` is the **client-safe** types/helpers module. **Do not** import the Cloudinary SDK here — server-only code stays in `cloudinary.ts`. Client components import types and category/tag helpers from `imageTypes.ts`.
3. **Category derivation is folder-based, not tag-based.** `getImageCategory(image, rootFolder)` strips the root folder prefix from `asset_folder`/`folder` and uses the *first* remaining segment as the category (Title-Cased). Subsequent segments become tags via `getImageTags`, merged with the asset's Cloudinary `tags` array (deduped, case-insensitive).
4. `src/lib/categories.ts` groups annotated images into `CategorySummary[]` (name, slug, count, hero = newest image). The `Uncategorized` bucket (images sitting directly in the root folder) is **hidden** from the showcase. `buildCoverUrl` rewrites `/upload/` to inject `c_fill,w_,h_,g_auto,f_auto,q_auto` for cover thumbnails.

### Routing

- `src/app/page.tsx` — landing page. Server component; fetches all images, computes summaries, renders Hero + Featured strip (curated names: Business / Corporate / LinkedIn / Professional — silently skipped when no matching folder exists) + `<CategoryShowcase>` + About / Contact / FAQ sections.
- `src/app/[slug]/page.tsx` — per-category page. Slugs use the `-photos` suffix (`categoryToSlug`/`slugToCategory` round-trip via that suffix; slugs without it return `null` → 404). Filters to that category's images only — the client never receives images from other categories.
- Both routes set `export const revalidate = 60` (ISR).

### Demo fallback

When Cloudinary returns zero images, `src/lib/demoImages.ts` provides 24 Unsplash seed images with synthetic `asset_folder: "demo/<category>"` paths. Both routes detect this via `resources.length === 0`, swap in `demoImages`, and pass `rootFolder="demo"` so the same category derivation logic works. `isDemoImage(image)` is the discriminator — used by `buildCoverUrl` and `MasonryGallery` to route to the Unsplash URL-rewrite branch (`w=` query) instead of the Cloudinary `/upload/` transform branch.

### Client gallery (`src/components/MasonryGallery.tsx`)

- Marked `'use client'`. Annotates each image once via `useMemo` with `{ category, tags }`.
- The optional `category` prop (set by `[slug]/page.tsx`) overrides per-image category derivation so all images in a category page report the same label in the lightbox.
- Filtering: tag pills use **OR semantics** (image matches if it has any selected tag) combined with a free-text search across `alt`/`caption`/`public_id`/category/tags.
- Layout uses pure CSS columns (`columns-1 xs:columns-2 lg:columns-3 xl:columns-4` + `break-inside-avoid`) — no JS layout, no shift.
- Built-in lightbox with toolbar (Play, Zoom, Share, Thumbnails, Info, Fullscreen, Close), keyboard navigation, and an Info panel with Info/Effects/Download tabs. The Playwright smoke tests document the expected `aria-label` set — keep these stable when editing.

### Styling

Tailwind CSS with custom theme in `tailwind.config.js`:
- `brand-50…brand-950` purple palette; `bg-background`/`text-foreground` are CSS variables defined in `globals.css`.
- Custom breakpoints `xs: 475px` and `3xl: 1920px`.
- Custom animations: `animate-fade-in`, `animate-fade-in-fast`, `animate-scale-in`, `animate-slide-up`, `animate-slide-in-right`, `animate-slide-in-bottom`, `animate-shimmer`.
- Custom shadows: `shadow-glow-sm`/`glow`/`glow-lg`.
- Reusable component classes `.btn-icon` and `.glass-panel` are defined in `globals.css` under `@layer components`.

`next.config.js` whitelists `res.cloudinary.com` for `next/image`. Keep this entry when editing.
