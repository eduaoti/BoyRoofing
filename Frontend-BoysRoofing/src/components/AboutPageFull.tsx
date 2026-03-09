"use client";

import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";
import { useSiteImages } from "@/contexts/SiteImagesContext";
import { RocketLaunchIcon, LightBulbIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AboutPageFull() {
  const { t } = useTranslation();
  const { getImage } = useSiteImages();
  const refHistory = useReveal();
  const refFounder = useReveal();
  const refQuote = useReveal();
  const refWhy = useReveal();
  const refDefines = useReveal();
  const refMvv = useReveal();

  const valuesList = t("missionVisionValues.valuesList") as unknown as string[];
  const definesList = t("aboutPage.defines") as unknown as string[];

  return (
    <div className="bg-[#0F0F0F] text-white overflow-hidden">
      {/* Hero */}
      <section className="relative w-full min-h-[38vh] md:min-h-[44vh] flex items-center justify-center overflow-hidden page-hero">
        <div className="absolute inset-0 page-hero-overlay" />
        <div className="absolute inset-0 page-hero-glow" />
        <div className="absolute top-0 left-0 w-full page-hero-accent animate-slideLight" />
        <div className="text-center px-6 relative z-10 max-w-2xl mx-auto">
          <h1 className="page-h1 text-white page-hero-title">
            {t("history.sectionTitle")}
          </h1>
          <p className="mt-4 page-tagline">
            {t("aboutPage.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Nuestra historia */}
      <section className="home-section-dark border-b border-white/5 py-20 md:py-24">
        <div ref={refHistory} className="reveal max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-4">
            <h2 className="page-h2 text-br-red-light">
              {t("history.sectionTitle")}
            </h2>
            {[t("history.p1"), t("history.p2"), t("history.p3"), t("history.p4")].map((p, i) => (
              <p key={i} className="text-gray-300 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
          <div>
            <Image
              src={getImage("about_team", "/gallery/trabajo.jpg")}
              alt="Roofing Team"
              width={650}
              height={450}
              className="rounded-2xl shadow-2xl border border-white/10 object-cover w-full"
            />
          </div>
        </div>
      </section>

      {/* Fundador */}
      <section className="home-section-alt border-b border-white/5 py-20 md:py-24">
        <div ref={refFounder} className="reveal max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="space-y-4">
            <h2 className="page-h2 text-br-red-light">
              {t("aboutPage.founderTitle")}
            </h2>
            <p className="text-gray-300 leading-relaxed">{t("aboutPage.founderP1")}</p>
            <p className="text-gray-300 leading-relaxed">{t("aboutPage.founderP2")}</p>
          </div>
          <div>
            <Image
              src={getImage("about_founder", "/gallery/founder.jpg")}
              alt="Founder of Boys Roofing"
              width={500}
              height={450}
              className="rounded-2xl shadow-2xl border border-white/10 object-cover w-full"
            />
          </div>
        </div>
      </section>

      {/* Frase */}
      <section className="home-section-dark border-b border-white/5 py-20 md:py-24">
        <div ref={refQuote} className="reveal max-w-4xl mx-auto px-6 text-center">
          <p className="page-lead italic text-gray-200">
            {t("aboutPage.quote")}
          </p>
        </div>
      </section>

      {/* ¿Por qué elegirnos? */}
      <section className="home-section-alt border-b border-white/5 py-20 md:py-24">
        <div ref={refWhy} className="reveal max-w-6xl mx-auto px-6">
          <h2 className="page-h2 text-center text-br-red-light mb-12">
            {t("aboutPage.whyChooseUs")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              t("services.benefits.satisfaction"),
              t("services.benefits.speed"),
              t("services.benefits.certified"),
              t("services.benefits.cleaning"),
            ].map((item, i) => (
              <div key={i} className="home-card p-6 text-center">
                <p className="font-semibold text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lo que nos define */}
      <section className="home-section-dark border-b border-white/5 py-20 md:py-24">
        <div ref={refDefines} className="reveal max-w-6xl mx-auto px-6">
          <h2 className="page-h2 text-center text-br-red-light mb-12">
            {t("aboutPage.whatDefinesUs")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {definesList.map((item: string, i: number) => (
              <div key={i} className="home-card p-6 md:p-8 text-center">
                <p className="text-gray-200 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section className="home-section-alt border-b border-white/5 py-20 md:py-24">
        <div ref={refMvv} className="reveal max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <RocketLaunchIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">{t("missionVisionValues.missionTitle")}</h3>
              <p className="mvv-text">{t("missionVisionValues.missionText")}</p>
            </div>
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <LightBulbIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">{t("missionVisionValues.visionTitle")}</h3>
              <p className="mvv-text">{t("missionVisionValues.visionText")}</p>
            </div>
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <CheckCircleIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">{t("missionVisionValues.valuesTitle")}</h3>
              <ul className="mvv-list mt-1">
                {valuesList.map((v: string, i: number) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
