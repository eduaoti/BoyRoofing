"use client";

import Hero from "./Hero";
import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";

export default function HomePage() {
  const { t } = useTranslation();

  const benefits = t("home.benefits") as unknown as string[];
  const valuesList = t("missionVisionValues.valuesList") as unknown as string[];

  return (
    <div className="bg-[#0F0F0F] text-white">

      {/* ⭐ HERO */}
      <Hero />

      {/* ⭐ BENEFICIOS */}
      <section className="py-20 bg-[#111315] border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {benefits.map((txt, i) => (
            <div
              key={i}
              className="p-6 rounded-xl bg-[#1A1A1A] text-center border border-[#2f2f2f] 
              shadow-md hover:border-red-600/60 transition-all"
            >
              <p className="text-gray-200 font-medium">{txt}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⭐ ABOUT RESUMIDO */}
      <section className="py-20 bg-[#0F0F0F] border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">
              {t("home.aboutTitle")}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              {t("home.aboutP1")}
            </p>
            <p className="text-gray-400 leading-relaxed">
              {t("home.aboutP2")}
            </p>
          </div>

          <Image
            src="/gallery/proceso1.jpg"
            alt="Roofing Texas"
            width={650}
            height={450}
            className="rounded-xl shadow-xl border border-[#2a2a2a] object-cover"
          />
        </div>
      </section>

      {/* ⭐ SERVICIOS DESTACADOS */}
      <section className="py-20 bg-[#111315] border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-3xl font-bold text-red-600 mb-12">
            {t("home.featuredServicesTitle")}
          </h2>

          <div className="grid md:grid-cols-2 gap-10">

            {/* Servicio 1 */}
            <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2f2f2f] hover:border-red-600/60 transition">
              <h3 className="text-xl font-semibold text-white">
                {t("home.service1Title")}
              </h3>
              <p className="text-gray-300 mt-3">
                {t("home.service1Text")}
              </p>
            </div>

            {/* Servicio 2 */}
            <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2f2f2f] hover:border-red-600/60 transition">
              <h3 className="text-xl font-semibold text-white">
                {t("home.service2Title")}
              </h3>
              <p className="text-gray-300 mt-3">
                {t("home.service2Text")}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ⭐ MISIÓN – VISIÓN – VALORES */}
      <section className="py-20 bg-[#0F0F0F] border-b border-[#2a2a2a]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">

          {/* Misión */}
          <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2f2f2f]">
            <h3 className="text-xl font-bold text-red-600 mb-3">
              {t("home.mission")}
            </h3>
            <p className="text-gray-300">
              {t("missionVisionValues.missionText")}
            </p>
          </div>

          {/* Visión */}
          <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2f2f2f]">
            <h3 className="text-xl font-bold text-red-600 mb-3">
              {t("home.vision")}
            </h3>
            <p className="text-gray-300">
              {t("missionVisionValues.visionText")}
            </p>
          </div>

          {/* Valores */}
          <div className="p-6 bg-[#1A1A1A] rounded-xl border border-[#2f2f2f]">
            <h3 className="text-xl font-bold text-red-600 mb-3">
              {t("home.values")}
            </h3>

            <ul className="text-gray-300 space-y-2">
              {valuesList.map((v, i) => (
                <li key={i}>✔ {v}</li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* ⭐ CTA FINAL */}
      <section className="py-20 bg-[#111315] text-center">
        <h2 className="text-3xl font-bold text-red-600">
          {t("home.footerCtaTitle")}
        </h2>

        <p className="text-gray-400 mt-3">
          {t("home.footerCtaText")}
        </p>

        <a
          href="/contact"
          className="inline-block mt-6 px-8 py-3 bg-red-600 hover:bg-red-700 
          text-white rounded-lg shadow-md hover:shadow-red-700/40 transition"
        >
          {t("home.footerButton")}
        </a>
      </section>

    </div>
  );
}
