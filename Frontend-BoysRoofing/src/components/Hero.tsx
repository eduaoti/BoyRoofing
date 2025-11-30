"use client";

import useTranslation from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  ShieldCheckIcon,
  HomeModernIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function Hero() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const lang = pathname.startsWith("/en") ? "en" : "es";

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{
        backgroundImage: "url('/gallery/hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-black/90" />

      <div className="relative mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-start gap-12">

        {/* LEFT COLUMN */}
        <div className="flex-1 space-y-6">
          <p className="hero-ribbon inline-block rounded-full bg-br-red-deep/40 px-4 py-1
            text-[10px] font-semibold uppercase tracking-[0.25em] text-br-red-light backdrop-blur animate-pulse">
            {t("hero.ribbon")}
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-xl">
            {t("hero.title")}
          </h1>

          <p className="max-w-xl text-sm md:text-lg text-gray-200">
            {t("hero.subtitle")}
          </p>

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={lang === "en" ? "/en/quote" : "/es/cotizacion"}
              className="rounded-md bg-br-red-main px-6 py-3 text-sm font-semibold uppercase tracking-wide
                shadow-md transition-transform duration-300 hover:-translate-y-1 hover:bg-br-red-light hover:shadow-xl"
            >
              {t("hero.primaryCta")}
            </Link>

            <Link
              href={lang === "en" ? "/en/services" : "/es/servicios"}
              className="rounded-md border border-br-red-main px-6 py-3 text-sm font-semibold text-white/90
                transition-all duration-300 hover:-translate-y-1 hover:border-br-red-light hover:bg-white/10 backdrop-blur"
            >
              {t("hero.secondaryCta")}
            </Link>
          </div>

          <p className="text-xs text-gray-300">{t("hero.experienceNote")}</p>
        </div>

        {/* RIGHT COLUMN - CARDS */}
        <div className="flex flex-col gap-4 w-full md:w-[340px]">

          {/* CARD 1 */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-5 py-4 backdrop-blur">
            <ShieldCheckIcon className="h-10 w-10 text-br-red-main" />
            <div>
              <p className="font-bold text-white">7+ {lang === "en" ? "years" : "años"}</p>
              <p className="text-sm text-gray-300">{t("hero.stats.years")}</p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-5 py-4 backdrop-blur">
            <HomeModernIcon className="h-10 w-10 text-br-red-main" />
            <div>
              <p className="font-bold text-white">120+ {lang === "en" ? "roofs attended" : "techos atendidos"}</p>
              <p className="text-sm text-gray-300">{t("hero.stats.roofs")}</p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-xl px-5 py-4 backdrop-blur">
            <WrenchScrewdriverIcon className="h-10 w-10 text-br-red-main" />
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
