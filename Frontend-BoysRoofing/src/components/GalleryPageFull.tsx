"use client";

import { useEffect, useState, useMemo } from "react";
import useTranslation from "@/hooks/useTranslation";
import { useSiteImages } from "@/contexts/SiteImagesContext";

type ImageItem = {
  src: string;
  alt: string;
};

export default function GalleryPageFull() {
  const { t } = useTranslation();
  const { getImage } = useSiteImages();
  const images: ImageItem[] = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => {
        const index = i + 1;
        return {
          src: getImage(`gallery_${index}`, `/gallery/imagen${index}.jpg`),
          alt: `Boys Roofing project ${index}`,
        };
      }),
    [getImage]
  );
  const [selected, setSelected] = useState<ImageItem | null>(null);
  const [isBottom, setIsBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsBottom(
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50
      );
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToggle = () => {
    if (isBottom) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Hero */}
      <section className="relative w-full min-h-[32vh] md:min-h-[38vh] flex items-center justify-center overflow-hidden page-hero">
        <div className="absolute inset-0 page-hero-overlay" />
        <div className="absolute inset-0 page-hero-glow" />
        <div className="absolute top-0 left-0 w-full page-hero-accent animate-slideLight" />
        <div className="text-center px-6 relative z-10 max-w-2xl mx-auto">
          <h1 className="page-h1 text-white page-hero-title">
            {t("gallery.title")}
          </h1>
          <p className="mt-4 page-tagline">
            {t("gallery.description")}
          </p>
        </div>
      </section>

      {/* Contenido */}
      <section className="home-section-dark py-16 md:py-20">
        <div className="masonry mx-auto max-w-6xl px-6 columns-1 gap-6 sm:columns-2 md:columns-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="mb-6 break-inside-avoid opacity-0 animate-stagger"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <button
                type="button"
                onClick={() => setSelected(img)}
                className="gallery-card group w-full rounded-xl overflow-hidden border border-white/10 hover:border-br-red-light/30 transition-colors"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="gallery-img block w-full"
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl animate-modal-fade"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-br-smoke/95 backdrop-blur-xl shadow-2xl border border-white/10 animate-modal-zoom"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selected.src}
              alt={selected.alt}
              className="max-h-[80vh] w-full object-contain"
            />
            <div className="flex justify-end gap-4 border-t border-white/10 bg-black/60 px-4 py-3">
              <button
                type="button"
                className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:border-br-red-light hover:text-br-red-light transition"
                onClick={() => setSelected(null)}
              >
                {t("gallery.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={scrollToggle}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-br-red-main flex items-center justify-center text-xl font-bold shadow-xl hover:bg-br-red-light transition btn-pulse"
      >
        {isBottom ? "⬆" : "⬇"}
      </button>
    </div>
  );
}
