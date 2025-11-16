"use client";

import useTranslation from "@/hooks/useTranslation";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-br-smoke to-br-carbon py-16">
      {/* Glows de fondo */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-40 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,#E5383B,#BA181B,transparent)] blur-3xl" />
        <div className="absolute right-[-5rem] bottom-[-5rem] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,#A4161A,#0B090A,transparent)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          {/* Cintillo animado */}
          <p className="hero-ribbon inline-block rounded-full bg-br-red-deep/40 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-br-red-light backdrop-blur">
            {t("hero.ribbon")}
          </p>

          <h1 className="text-3xl font-bold md:text-5xl">
            {t("hero.title")}
          </h1>

          <p className="max-w-xl text-sm text-br-stone md:text-base">
            {t("hero.subtitle")}
          </p>

          {/* Botones con efecto hover */}
          <div className="flex flex-wrap gap-4">
            <a
              href="#contacto"
              className="rounded-md bg-br-red-main px-6 py-3 text-sm font-semibold uppercase tracking-wide shadow-md transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:bg-br-red-light"
            >
              {t("hero.primaryCta")}
            </a>
            <a
              href="#servicios"
              className="rounded-md border border-br-red-main px-6 py-3 text-sm font-semibold text-br-white/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-br-red-light hover:bg-br-smoke/70"
            >
              {t("hero.secondaryCta")}
            </a>
          </div>

          <p className="text-xs text-br-stone">
            {t("hero.experienceNote")}
          </p>
        </div>

        {/* Tarjeta lateral tipo “glassmorphism” */}
        <div className="flex-1">
          <div className="h-64 rounded-2xl border border-white/10 bg-gradient-to-br from-br-smoke/60 to-br-carbon/80 shadow-xl backdrop-blur">
            {/* Aquí después puedes meter una foto de techos / equipo */}
          </div>
        </div>
      </div>
    </section>
  );
}
