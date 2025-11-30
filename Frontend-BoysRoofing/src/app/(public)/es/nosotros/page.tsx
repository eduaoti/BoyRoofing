"use client";

import Image from "next/image";
import useTranslation from "@/hooks/useTranslation";
import { useEffect } from "react";

export default function AboutPage() {
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

const valuesList = t("missionVisionValues.valuesList");
const definesList = t("aboutPage.defines");

  return (
    <div className="bg-[#0F0F0F] text-white overflow-hidden">

      {/* HERO */}
      <section className="relative w-full h-[38vh] md:h-[48vh] flex items-center justify-center overflow-hidden bg-[#111315]">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(120,15,22,0.55),rgba(120,15,22,0.18)_45%,rgba(0,0,0,0.65)_85%)]" />
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-700/70 via-red-500/60 to-transparent animate-slideLight" />

        <div className="text-center px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white">
            {t("history.sectionTitle")}
          </h1>
          <p className="mt-3 text-base md:text-lg text-gray-300 font-light">
            {t("aboutPage.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* NUESTRA HISTORIA */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center reveal">
          <div>
            <h2 className="text-3xl font-bold text-[#E5383B] mb-6">
              {t("history.sectionTitle")}
            </h2>

            {[t("history.p1"), t("history.p2"), t("history.p3"), t("history.p4")].map(
              (p, i) => (
                <p key={i} className="mt-4 text-gray-300 leading-relaxed">
                  {p}
                </p>
              )
            )}
          </div>

          <Image
            src="/gallery/trabajo.jpg"
            alt="Roofing Team"
            width={650}
            height={450}
            className="rounded-xl shadow-xl object-cover"
          />
        </div>
      </section>

      {/* FUNDADOR */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center reveal">
          <div>
            <h2 className="text-3xl font-bold text-[#E5383B] mb-6">
              {t("aboutPage.founderTitle")}
            </h2>

            <p className="text-gray-300 mb-4 leading-relaxed">
              {t("aboutPage.founderP1")}
            </p>

            <p className="text-gray-300 leading-relaxed">
              {t("aboutPage.founderP2")}
            </p>
          </div>

          <Image
            src="/gallery/founder.jpg"
            alt="Founder of Boys Roofing"
            width={500}
            height={450}
            className="rounded-xl shadow-xl object-cover"
          />
        </div>
      </section>

      {/* FRASE */}
      <section className="py-20 bg-[#111315] text-center px-6 reveal">
        <p className="text-2xl md:text-3xl italic text-gray-200 max-w-4xl mx-auto">
          {t("aboutPage.quote")}
        </p>
      </section>

      {/* ¿POR QUÉ ELEGIRNOS? */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 reveal">
          <h2 className="text-2xl font-bold text-center text-[#E5383B] mb-10">
            {t("aboutPage.whyChooseUs")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              t("services.benefits.satisfaction"),
              t("services.benefits.speed"),
              t("services.benefits.certified"),
              t("services.benefits.cleaning"),
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-xl bg-[#1f1f1f] hover:shadow-lg hover:shadow-[#E5383B]/20 transition"
              >
                <p className="mt-2 font-semibold text-center text-gray-200">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LO QUE NOS DEFINE */}
      <section className="py-20 bg-[#0F0F0F]">
        <div className="max-w-6xl mx-auto px-6 reveal">
          <h2 className="text-2xl font-bold text-center text-[#E5383B] mb-10">
            {t("aboutPage.whatDefinesUs")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {definesList.map((item, i) => (
              <div key={i} className="p-6 bg-[#1f1f1f] rounded-xl text-center">
                <p className="text-gray-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MISIÓN / VISIÓN / VALORES */}
      <section className="py-20 bg-[#111315]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 reveal">
          <div className="p-6 rounded-xl bg-[#1f1f1f]">
            <h4 className="text-[#E5383B] text-xl font-bold mb-3">
              {t("missionVisionValues.missionTitle")}
            </h4>
            <p className="text-gray-300">{t("missionVisionValues.missionText")}</p>
          </div>

          <div className="p-6 rounded-xl bg-[#1f1f1f]">
            <h4 className="text-[#E5383B] text-xl font-bold mb-3">
              {t("missionVisionValues.visionTitle")}
            </h4>
            <p className="text-gray-300">{t("missionVisionValues.visionText")}</p>
          </div>

          <div className="p-6 rounded-xl bg-[#1f1f1f]">
            <h4 className="text-[#E5383B] text-xl font-bold mb-3">
              {t("missionVisionValues.valuesTitle")}
            </h4>
            <ul className="space-y-2 text-gray-300">
              {valuesList.map((v, i) => (
                <li key={i} className="flex gap-2">✔ {v}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
