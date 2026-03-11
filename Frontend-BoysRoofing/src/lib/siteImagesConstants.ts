/** Keys y etiquetas para el panel de imágenes (EN/ES) */
export const SITE_IMAGE_SLOTS: { key: string; labelEn: string; labelEs: string; group: string }[] = [
  { key: "hero", labelEn: "Hero (home banner)", labelEs: "Hero (banner inicio)", group: "home" },
  { key: "home_about", labelEn: "Home · About section", labelEs: "Inicio · Sección sobre nosotros", group: "home" },
  { key: "about_team", labelEn: "About · Our story", labelEs: "Nosotros · Nuestra historia", group: "about" },
  { key: "about_founder", labelEn: "About · Founder", labelEs: "Nosotros · Fundador", group: "about" },
  { key: "service_roofing_before", labelEn: "Services · Roofing (before)", labelEs: "Servicios · Techo (antes)", group: "services" },
  { key: "service_roofing_after", labelEn: "Services · Roofing (after)", labelEs: "Servicios · Techo (después)", group: "services" },
  { key: "service_cleaning_before", labelEn: "Services · Cleaning (before)", labelEs: "Servicios · Limpieza (antes)", group: "services" },
  { key: "service_cleaning_after", labelEn: "Services · Cleaning (after)", labelEs: "Servicios · Limpieza (después)", group: "services" },
  { key: "carousel_1", labelEn: "Carousel image 1", labelEs: "Carrusel imagen 1", group: "carousel" },
  { key: "carousel_2", labelEn: "Carousel image 2", labelEs: "Carrusel imagen 2", group: "carousel" },
  { key: "carousel_3", labelEn: "Carousel image 3", labelEs: "Carrusel imagen 3", group: "carousel" },
  { key: "carousel_4", labelEn: "Carousel image 4", labelEs: "Carrusel imagen 4", group: "carousel" },
  { key: "carousel_5", labelEn: "Carousel image 5", labelEs: "Carrusel imagen 5", group: "carousel" },
  { key: "logo", labelEn: "Logo", labelEs: "Logo", group: "brand" },
];

export const ALL_SLOTS = [...SITE_IMAGE_SLOTS];

/** Resuelve URL para preview (path relativo -> absoluto) */
export function getImageUrlForPreview(url: string, origin?: string): string {
  if (url.startsWith("http")) return url;
  if (typeof window !== "undefined") return `${window.location.origin}${url}`;
  return origin ? `${origin}${url}` : url;
}
