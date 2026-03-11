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

/** Solo Cloudinary: vacío por defecto. Logo tiene fallback local para navbar/recibo. */
const LOGO_FALLBACK = '/gallery/LOGO.png';
export const DEFAULT_SITE_IMAGE_URLS: Record<SiteImageKey, string> = {
  hero: '',
  home_about: '',
  about_team: '',
  about_founder: '',
  service_roofing_before: '',
  service_roofing_after: '',
  service_cleaning_before: '',
  service_cleaning_after: '',
  carousel_1: '',
  carousel_2: '',
  carousel_3: '',
  carousel_4: '',
  carousel_5: '',
  logo: LOGO_FALLBACK,
};

export const ALL_IMAGE_KEYS: readonly string[] = [...SITE_IMAGE_KEYS];
