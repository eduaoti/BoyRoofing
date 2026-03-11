"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";
import { useSiteImages } from "@/contexts/SiteImagesContext";
import { RocketLaunchIcon, LightBulbIcon, CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const Hero = dynamic(() => import("./Hero"), { ssr: false });

export default function HomePage() {
  const { t, lang } = useTranslation();
  const { getImage } = useSiteImages();
  const refBenefits = useReveal();
  const refAboutLeft = useReveal();
  const refAboutRight = useReveal();
  const refFeatured = useReveal();
  const refMvv = useReveal();
  const refCta = useReveal();

  const benefits = t("home.benefits") as unknown as string[];
  const valuesList = t("missionVisionValues.valuesList") as unknown as string[];
  const base = lang === "es" ? "/es" : "/en";

  return (
    <div className="bg-[#0F0F0F] text-white">
      <Hero />

      {/* Beneficios: scale + fade al scroll */}
      <section ref={refBenefits} className="home-section-reveal home-section-alt border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {benefits.map((txt, i) => (
              <div key={i} className="home-benefit-card home-card p-6 md:p-8 text-center">
                <p className="text-gray-200 font-medium text-[0.95rem] md:text-base">{txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About: texto + imagen (actualizable desde el panel) */}
      <section className="home-section-dark border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div ref={refAboutLeft} className="home-reveal-left space-y-4">
            <h2 className="page-h2 text-br-red-light">
              {t("home.aboutTitle")}
            </h2>
            <p className="text-gray-300 leading-relaxed">
              {t("home.aboutP1")}
            </p>
            <p className="text-gray-400 leading-relaxed">
              {t("home.aboutP2")}
            </p>
            <Link
              href={lang === "es" ? "/es/nosotros" : "/en/about"}
              className="inline-flex items-center gap-2 text-br-red-light font-semibold text-sm hover:text-br-red-main transition-colors"
            >
              {t("home.learnMoreAbout")}
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div ref={refAboutRight} className="home-reveal-right">
            {(() => {
              const homeAboutUrl = getImage("home_about", "");
              return homeAboutUrl ? (
                <Image
                  src={homeAboutUrl}
                  alt="Roofing Texas"
                  width={650}
                  height={450}
                  className="rounded-2xl shadow-2xl border border-white/10 object-cover w-full"
                />
              ) : (
                <div className="rounded-2xl shadow-2xl border border-white/10 bg-white/5 aspect-[65/45] w-full flex items-center justify-center text-br-pearl text-sm">
                  {t("home.aboutImagePlaceholder")}
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Servicios destacados: fade-up con stagger */}
      <section ref={refFeatured} className="home-section-reveal home-section-alt border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <h2 className="page-h2 text-center text-br-red-light mb-12 md:mb-14">
            {t("home.featuredServicesTitle")}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 md:gap-10">
            <div className="home-featured-card home-card p-6 md:p-8">
              <h3 className="page-h3 text-white">
                {t("home.service1Title")}
              </h3>
              <p className="text-gray-300 mt-3 leading-relaxed">
                {t("home.service1Text")}
              </p>
            </div>
            <div className="home-featured-card home-card p-6 md:p-8">
              <h3 className="page-h3 text-white">
                {t("home.service2Title")}
              </h3>
              <p className="text-gray-300 mt-3 leading-relaxed">
                {t("home.service2Text")}
              </p>
            </div>
          </div>
          <div className="mt-10 text-center">
            <Link
              href={lang === "es" ? "/es/servicios" : "/en/services"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-br-red-main/80 text-br-red-light font-semibold hover:bg-br-red-main/10 hover:border-br-red-light transition-all duration-300"
            >
              {t("home.seeAllServices")}
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Misión, Visión, Valores */}
      <section ref={refMvv} className="home-section-reveal home-section-dark border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <RocketLaunchIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">
                {t("home.mission")}
              </h3>
              <p className="mvv-text">
                {t("missionVisionValues.missionText")}
              </p>
            </div>
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <LightBulbIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">
                {t("home.vision")}
              </h3>
              <p className="mvv-text">
                {t("missionVisionValues.visionText")}
              </p>
            </div>
            <div className="home-mvv-card home-card p-6 md:p-8">
              <div className="mvv-icon-wrap mb-4">
                <CheckCircleIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="mvv-title">
                {t("home.values")}
              </h3>
              <ul className="mvv-list mt-1">
                {valuesList.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="home-section-alt border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 text-center">
          <div ref={refCta} className="home-cta-block">
            <h2 className="page-h2 text-br-red-light">
              {t("home.footerCtaTitle")}
            </h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
              {t("home.footerCtaText")}
            </p>
            <a
              href={`${base}${lang === "es" ? "/contacto" : "/contact"}`}
              className="inline-block mt-8 px-10 py-4 bg-br-red-main hover:bg-br-red-light text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-900/25 transition-all duration-300 hover:-translate-y-1"
            >
              {t("home.footerButton")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
