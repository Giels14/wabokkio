import type { ImageMetadata } from 'astro';
// Alle foto's in src/assets/photos/ (jpg/jpeg/png/webp/avif). Ontbreekt een bestand, dan valt de site terug op de gradient.
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/photos/**/*.{jpg,jpeg,png,webp,avif}', { eager: true });
export function photo(name: string): ImageMetadata | undefined {
  // name zonder extensie, bv. 'hero' of 'resorts/ikos-porto-petro'
  for (const ext of ['jpg', 'jpeg', 'webp', 'avif', 'png']) {
    const f = files[`/src/assets/photos/${name}.${ext}`];
    if (f) return f.default;
  }
  return undefined;
}
