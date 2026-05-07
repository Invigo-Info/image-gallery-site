# Masonry Gallery — Next.js + Tailwind CSS + Cloudinary

A production-ready, fully responsive masonry image gallery built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Cloudinary**.

## ✨ Features

- **Pure Tailwind styling** — every visual element uses Tailwind utility classes
- **True masonry layout** via `columns-1 xs:columns-2 lg:columns-3 xl:columns-4` (CSS columns — zero JS, zero layout shift)
- **Custom Tailwind animations** defined in `tailwind.config.js` (`animate-fade-in`, `animate-scale-in`, `animate-slide-up`)
- **Custom brand color palette** (`brand-50` through `brand-950`)
- **Custom box shadows** (`shadow-glow`, `shadow-glow-sm`, `shadow-glow-lg`)
- **Custom screen breakpoint** (`xs: 475px`)
- **Server-side image fetching** via Cloudinary's Search API (your API secret never leaves the server)
- **Auto-optimized images** through `next-cloudinary` — best format (AVIF/WebP) and adaptive quality
- **Full-screen lightbox** with keyboard navigation (Esc, Arrow keys)
- **Incremental Static Regeneration** — pages refresh every 60 seconds
- **TypeScript** end-to-end

## 📁 Project Structure

```
masonry-gallery/
├── src/
│   ├── app/
│   │   ├── globals.css          # Tailwind directives + CSS variables + @layer components
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page (server component)
│   ├── components/
│   │   └── MasonryGallery.tsx   # Client component: grid + lightbox
│   └── lib/
│       └── cloudinary.ts        # Cloudinary SDK config + Search API helper
├── public/                      # Static assets
├── .env.local.example           # Environment variable template
├── .gitignore
├── next.config.js               # Allows res.cloudinary.com in next/image
├── package.json
├── postcss.config.js            # Tailwind + Autoprefixer
├── tailwind.config.js           # Custom theme: colors, animations, shadows, screens
├── tsconfig.json
└── README.md
```

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get Cloudinary credentials

Sign up free at https://cloudinary.com if you haven't already, then grab your **Cloud name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=gallery
```

> The cloud name is intentionally public (the `NEXT_PUBLIC_` prefix exposes it to the browser). Your API key and secret stay server-side.

### 4. Upload images

In your Cloudinary Media Library, create a folder called `gallery` (or whatever you set in `CLOUDINARY_FOLDER`) and upload some images.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000.

## 🎨 Tailwind Customizations

Everything is configured in `tailwind.config.js`:

### Custom colors

```js
colors: {
  brand: { 50, 100, ..., 950 }  // Full purple brand palette
}
```

Use as: `bg-brand-500`, `text-brand-300`, `ring-brand-400/40`, etc.

### Custom animations

```js
animation: {
  'fade-in': 'fade-in 0.6s ease-out',
  'fade-in-fast': 'fade-in-fast 0.3s ease-out',
  'scale-in': 'scale-in 0.3s ease-out',
  'slide-up': 'slide-up 0.5s ease-out',
}
```

Use as: `animate-fade-in`, `animate-scale-in`, etc.

### Custom shadows

```js
boxShadow: {
  'glow-sm': '0 0 10px rgba(139, 92, 246, 0.3)',
  'glow':    '0 0 20px rgba(139, 92, 246, 0.4)',
  'glow-lg': '0 0 40px rgba(139, 92, 246, 0.5)',
}
```

Use as: `shadow-glow`, `hover:shadow-glow`, etc.

### Custom breakpoint

```js
screens: { xs: '475px', '3xl': '1920px' }
```

Use as: `xs:columns-2`, `3xl:max-w-screen-2xl`.

### Reusable component classes

In `globals.css`:

```css
@layer components {
  .btn-icon { @apply rounded-full bg-white/10 p-3 ...; }
  .glass-panel { @apply rounded-full bg-white/10 backdrop-blur-sm; }
}
```

## 🔧 How It Works

**The masonry layout** uses CSS columns — the simplest, most performant approach. Each image gets `break-inside-avoid` so it never splits across columns. Browsers handle packing natively.

**Image optimization** is automatic. The `<CldImage>` component from `next-cloudinary` builds URLs with `f_auto,q_auto` so Cloudinary serves AVIF, WebP, or JPEG depending on the browser, at adaptive quality. The `sizes` prop tells Next.js how wide to request the image at each breakpoint.

**Server-side rendering**: `page.tsx` is a React Server Component. It calls Cloudinary's Search API at build/request time, your secret never reaches the browser, and the initial HTML already references the correct images — great for SEO and Largest Contentful Paint.

**ISR**: `export const revalidate = 60` means the page is statically cached but Next.js rebuilds it in the background every 60 seconds. New uploads appear without redeploying.

## 🎛 Customization

**Number of columns** — edit the `columns-*` classes in `MasonryGallery.tsx`:

```tsx
className="columns-1 gap-4 space-y-4 xs:columns-2 lg:columns-3 xl:columns-4"
```

**Theme colors** — edit `--background` and `--foreground` in `globals.css`, or change the `brand` palette in `tailwind.config.js`.

**Animations** — add or modify keyframes/animations in `tailwind.config.js` and reference them with `animate-*` classes.

**Image captions** — add `alt` and `caption` to an image's contextual metadata in Cloudinary's Media Library; the gallery picks them up automatically.

## 📦 Production

```bash
npm run build
npm run start
```

## ☁️ Deploying to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add the same env vars in Vercel's dashboard
4. Deploy

## 🐛 Troubleshooting

- **"No images found"** — Check `.env.local` values, folder name, and that images are actually uploaded.
- **Images don't load** — `next.config.js` already allows `res.cloudinary.com`. If you fork/edit, keep it.
- **Tailwind classes not applying** — Make sure `tailwind.config.js` `content` paths cover all your files.

## 📄 License

MIT
