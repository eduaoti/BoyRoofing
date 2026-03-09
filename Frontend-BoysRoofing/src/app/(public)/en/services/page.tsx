"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";
import { useSiteImages } from "@/contexts/SiteImagesContext";
import BeforeAfter from "@/components/BeforeAfter";
import WorkCarousel from "@/components/WorkCarousel";

import {
  ShieldCheckAnimated,
  ClockAnimated,
  CheckBadgeAnimated,
  SparklesAnimated,
} from "@/components/BenefitIconsAnimated";

export default function ServicesPage() {
  const { t } = useTranslation();
  const { getImage } = useSiteImages();
  const sectionReveal = useReveal();
  const reveal1 = useReveal();
  const reveal2 = useReveal();

  return (
    <>
      {/* Hero */}
      <div className="relative w-full min-h-[40vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden services-hero">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(120,15,22,0.5),rgba(120,15,22,0.12)_45%,rgba(0,0,0,0.6)_85%)]" />
        <div className="absolute inset-0 services-hero-glow" />
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-700/80 via-red-500/70 to-transparent animate-slideLight" />
        <div className="text-center px-6 relative z-10 max-w-2xl mx-auto">
          <h1 className="page-h1 text-white services-hero-title hero-text-reveal">
            {t("services.sectionTitle")}
          </h1>
          <p className="mt-4 page-tagline hero-tagline-reveal">
            {t("services.tagline")}
          </p>
        </div>
      </div>

      {/* Benefits + Process + Badges (reveal al scroll, estilo Zoho) */}
      <section ref={sectionReveal} className="services-section-reveal services-section-wrap text-white py-20 md:py-24 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 space-y-20">

          <div className="benefits-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { Icon: ShieldCheckAnimated, label: t("services.benefits.satisfaction") },
              { Icon: ClockAnimated, label: t("services.benefits.speed") },
              { Icon: CheckBadgeAnimated, label: t("services.benefits.certified") },
              { Icon: SparklesAnimated, label: t("services.benefits.cleaning") },
            ].map(({ Icon, label }) => (
              <div key={label} className="benefit-card benefit-card-modern p-6 md:p-8 flex flex-col items-center">
                <Icon />
                <p className="mt-4 font-semibold text-center text-[0.95rem] md:text-base text-white/95">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-12">
            <div className="services-process-title-wrap">
<h2 className="page-h2 text-center services-process-title">
              {t("services.process.title")}
            </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                t("services.process.step1"),
                t("services.process.step2"),
                t("services.process.step3"),
                t("services.process.step4"),
              ].map((step, i) => (
                <div key={i} className="process-step-card flex flex-col items-center p-6 md:p-8 text-center">
                  <div className="process-step-num flex items-center justify-center">{i + 1}</div>
                  <p className="mt-4 font-medium text-white/90 text-sm md:text-base">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              t("services.badges.years"),
              t("services.badges.certified"),
              t("services.badges.warranty"),
              t("services.badges.insured"),
            ].map((badge) => (
              <div key={badge} className="services-badge-pill text-white/95">
                ✔ {badge}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Service content cards */}
      <div className="bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(120,15,22,0.06)_0%,transparent_50%)] text-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="space-y-14 md:space-y-16">

            <section
              ref={reveal1}
              className="reveal service-content-card p-8 md:p-10"
            >
              <h2 className="page-h2 text-br-red-light">
                {t("services.roofing.title")}
              </h2>
              <p className="mt-4 text-white/85 leading-relaxed">{t("services.roofing.p1")}</p>
              <p className="mt-3 text-white/85 leading-relaxed">{t("services.roofing.p2")}</p>
              <div className="mt-8">
                <BeforeAfter
                  before={getImage("service_roofing_before", "/gallery/proceso5.jpg")}
                  after={getImage("service_roofing_after", "/gallery/DesPues.jpg")}
                  titleBefore={t("services.before")}
                  titleAfter={t("services.after")}
                />
              </div>
            </section>

            <section
              ref={reveal2}
              className="reveal service-content-card p-8 md:p-10"
            >
              <h2 className="page-h2 text-br-red-light">
                {t("services.cleaning.title")}
              </h2>
              <p className="mt-4 text-white/85 leading-relaxed">{t("services.cleaning.p1")}</p>
              <p className="mt-3 text-white/85 leading-relaxed">{t("services.cleaning.p2")}</p>
              <div className="mt-8">
<BeforeAfter
                before={getImage("service_cleaning_before", "/gallery/limpieza.jpg")}
                after={getImage("service_cleaning_after", "/gallery/despues1.jpg")}
                  titleBefore={t("services.before")}
                  titleAfter={t("services.after")}
                />
              </div>
            </section>

            <WorkCarousel />
          </div>
        </div>
      </div>
    </>
  );
}
