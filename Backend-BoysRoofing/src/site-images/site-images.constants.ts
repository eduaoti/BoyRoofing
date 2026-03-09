/**
 * Keys de imágenes del sitio. Cada key tiene una URL por defecto (path local)
 * que se usa si no hay override en la BD.
 */
export const SITE_IMAGE_KEYS = [
  'hero',
  'home_about',
  'about_team',
  'about_founder',
  'service_roofing_before',
  'service_roofing_after',
  'service_cleaning_before',
  'service_cleaning_after',
  'carousel_1',
  'carousel_2',
  'carousel_3',
  'carousel_4',
  'carousel_5',
  'logo',
] as const;

export type SiteImageKey = (typeof SITE_IMAGE_KEYS)[number];

/** URLs por defecto (paths del frontend public) */
export const DEFAULT_SITE_IMAGE_URLS: Record<SiteImageKey, string> = {
  hero: '/gallery/hero.png',
  home_about: '/gallery/proceso1.jpg',
  about_team: '/gallery/trabajo.jpg',
  about_founder: '/gallery/founder.jpg',
  service_roofing_before: '/gallery/proceso5.jpg',
  service_roofing_after: '/gallery/DesPues.jpg',
  service_cleaning_before: '/gallery/limpieza.jpg',
  service_cleaning_after: '/gallery/despues1.jpg',
  carousel_1: '/gallery/proceso5.jpg',
  carousel_2: '/gallery/DesPues.jpg',
  carousel_3: '/gallery/limpieza.jpg',
  carousel_4: '/gallery/despues1.jpg',
  carousel_5: '/gallery/proceso4.jpg',
  logo: '/gallery/LOGO.png',
};

/** Keys para galería (gallery_1 ... gallery_36) */
export const GALLERY_KEYS = Array.from({ length: 36 }, (_, i) => `gallery_${i + 1}`) as const;
export type GalleryKey = (typeof GALLERY_KEYS)[number];

export const DEFAULT_GALLERY_URLS: Record<GalleryKey, string> = Object.fromEntries(
  GALLERY_KEYS.map((k, i) => [k, `/gallery/imagen${i + 1}.jpg`]),
) as Record<GalleryKey, string>;

export const ALL_IMAGE_KEYS = [...SITE_IMAGE_KEYS, ...GALLERY_KEYS] as const;
