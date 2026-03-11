"use client";

import useTranslation from "@/hooks/useTranslation";

export default function GalleryPageFull() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
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

      <section className="home-section-dark py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6 text-center text-br-pearl">
          <p>{t("gallery.description")}</p>
        </div>
      </section>
    </div>
  );
}
