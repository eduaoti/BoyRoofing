"use client";

import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSiteImages } from "@/contexts/SiteImagesContext";

import {
  ShieldCheckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function Hero() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { getImage } = useSiteImages();
  const lang = pathname.startsWith("/en") ? "en" : "es";
  const heroBg = getImage("hero", "");

  return (
    <section
      className="relative overflow-hidden py-28 md:py-36 min-h-[85vh] flex items-center"
      style={{
        ...(heroBg ? { backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center 20%" } : {}),
      }}
    >
      {/* Overlay + gradiente sutil rojo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(180,24,27,0.12)_0%,transparent_50%)]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-br-red-main/70 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 w-full flex flex-col md:flex-row md:items-center gap-14">

        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6 max-w-2xl">
          <p className="home-hero-ribbon hero-ribbon inline-block rounded-full bg-br-red-deep/50 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-br-red-light backdrop-blur-sm border border-white/10">
            {t("hero.ribbon")}
          </p>

          <h1 className="page-h1 home-hero-title text-white drop-shadow-2xl">
            {t("hero.title")}
          </h1>

          <p className="page-tagline home-hero-sub max-w-xl text-gray-200/95">
            {t("hero.subtitle")}
          </p>

          <div className="home-hero-btns flex flex-wrap gap-4">
            <Link
              href={lang === "en" ? "/en/quote" : "/es/cotizacion"}
              className="rounded-lg bg-br-red-main px-7 py-3.5 text-sm font-semibold uppercase tracking-wide shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-br-red-light hover:shadow-xl hover:shadow-red-900/20"
            >
              {t("hero.primaryCta")}
            </Link>
            <Link
              href={lang === "en" ? "/en/services" : "/es/servicios"}
              className="rounded-lg border-2 border-br-red-main/80 px-7 py-3.5 text-sm font-semibold text-white/95 transition-all duration-300 hover:-translate-y-1 hover:border-br-red-light hover:bg-white/10 backdrop-blur-sm"
            >
              {t("hero.secondaryCta")}
            </Link>
          </div>

          <p className="text-xs text-gray-400">{t("hero.experienceNote")}</p>
        </div>

        {/* RIGHT COLUMN - CARDS */}
        <div className="flex flex-col gap-4 w-full md:w-[360px]">
          <div className="home-hero-card flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-md shadow-xl">
            <ShieldCheckIcon className="h-10 w-10 shrink-0 text-br-red-main" />
            <div>
              <p className="font-bold text-white">7+ {lang === "en" ? "years" : "años"}</p>
              <p className="text-sm text-gray-300">{t("hero.stats.years")}</p>
            </div>
          </div>
          <div className="home-hero-card flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-md shadow-xl">
            <HomeModernIcon className="h-10 w-10 shrink-0 text-br-red-main" />
            <div>
              <p className="font-bold text-white">120+ {lang === "en" ? "roofs attended" : "techos atendidos"}</p>
              <p className="text-sm text-gray-300">{t("hero.stats.roofs")}</p>
            </div>
          </div>
          <div className="home-hero-card flex items-center gap-4 bg-black/50 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-md shadow-xl">
            <WrenchScrewdriverIcon className="h-10 w-10 shrink-0 text-br-red-main" />
            <div>
              <p className="font-bold text-white">
                {lang === "en" ? "100% secured work" : "Trabajo 100% asegurado"}
              </p>
              <p className="text-sm text-gray-300">{t("hero.stats.secured")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
