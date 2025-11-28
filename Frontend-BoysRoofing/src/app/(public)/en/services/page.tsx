"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";
import BeforeAfter from "@/components/BeforeAfter";
import WorkCarousel from "@/components/WorkCarousel";

/* ⭐ Professional Icons */
import {
  ShieldCheckIcon,
  ClockIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function ServicesPage() {
  const { t } = useTranslation();

  const reveal1 = useReveal();
  const reveal2 = useReveal();

  return (
    <>
      {/* ⭐ HERO SERVICES */}
      <div className="relative w-full h-[38vh] md:h-[48vh] flex items-center justify-center overflow-hidden bg-[#111315]">

        {/* 🔥 Gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(120,15,22,0.55),rgba(120,15,22,0.18)_45%,rgba(0,0,0,0.65)_85%)]"></div>

        {/* 💡 Light bar */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-700/70 via-red-500/60 to-transparent animate-slideLight"></div>

        {/* 📝 Hero Text */}
        <div className="text-center px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
            {t("services.sectionTitle")}
          </h1>

          <p className="mt-3 text-base md:text-lg text-gray-300 font-light">
            {t("services.tagline")}
          </p>
        </div>
      </div>

      {/* ⭐⭐ PROFESSIONAL EXTRA SECTION */}
      <section className="bg-[#0F0F0F] text-white py-16 border-b border-[#2a2a2a]">
        <div className="mx-auto max-w-6xl px-6 space-y-16">

          {/* 1. BENEFITS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] hover:border-br-red-light/70 hover:shadow-lg hover:shadow-br-red-light/20 transition">
              <ShieldCheckIcon className="w-10 h-10 mx-auto text-br-red-light" />
              <p className="mt-3 font-semibold text-center">
                {t("services.benefits.satisfaction")}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] hover:border-br-red-light/70 hover:shadow-lg hover:shadow-br-red-light/20 transition">
              <ClockIcon className="w-10 h-10 mx-auto text-br-red-light" />
              <p className="mt-3 font-semibold text-center">
                {t("services.benefits.speed")}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] hover:border-br-red-light/70 hover:shadow-lg hover:shadow-br-red-light/20 transition">
              <CheckBadgeIcon className="w-10 h-10 mx-auto text-br-red-light" />
              <p className="mt-3 font-semibold text-center">
                {t("services.benefits.certified")}
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] hover:border-br-red-light/70 hover:shadow-lg hover:shadow-br-red-light/20 transition">
              <SparklesIcon className="w-10 h-10 mx-auto text-br-red-light" />
              <p className="mt-3 font-semibold text-center">
                {t("services.benefits.cleaning")}
              </p>
            </div>

          </div>

          {/* 2. PROCESS STEPS */}
          <div className="space-y-10">
            <h2 className="text-center text-2xl font-bold text-br-red-light">
              {t("services.process.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                t("services.process.step1"),
                t("services.process.step2"),
                t("services.process.step3"),
                t("services.process.step4"),
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-6 rounded-xl bg-[#1f1f1f] border border-[#3a3a3a] hover:border-br-red-light/70 transition"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-br-red-main/80 text-white font-bold text-xl">
                    {i + 1}
                  </div>
                  <p className="mt-4 text-center font-medium">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. WARRANTY BADGES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              t("services.badges.years"),
              t("services.badges.certified"),
              t("services.badges.warranty"),
              t("services.badges.insured"),
            ].map((badge, i) => (
              <div
                key={i}
                className="py-3 px-4 bg-[#1f1f1f] border border-[#3a3a3a] rounded-lg text-center font-semibold text-sm hover:border-br-red-light/70 transition"
              >
                ✔ {badge}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 🔧 SERVICE CONTENT */}
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(120, 15, 22, 0.07),rgba(10, 10, 10, 0.1)_70%)] text-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-12 space-y-12">

            {/* Service 1 */}
            <section
              ref={reveal1}
              className="reveal rounded-xl border border-[#242424]/80 bg-[#1E1F21]/70 p-8 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <h2 className="text-2xl font-semibold text-[#E5383B]">
                {t("services.roofing.title")}
              </h2>
              <p className="mt-4">{t("services.roofing.p1")}</p>
              <p className="mt-3">{t("services.roofing.p2")}</p>

              <BeforeAfter
                before="/gallery/proceso5.jpg"
                after="/gallery/DesPues.jpg"
                titleBefore={t("services.before")}
                titleAfter={t("services.after")}
              />
            </section>

            {/* Service 2 */}
            <section
              ref={reveal2}
              className="reveal rounded-xl border border-[#242424]/80 bg-[#1E1F21]/70 p-8 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all"
            >
              <h2 className="text-2xl font-semibold text-[#E5383B]">
                {t("services.cleaning.title")}
              </h2>
              <p className="mt-4">{t("services.cleaning.p1")}</p>
              <p className="mt-3">{t("services.cleaning.p2")}</p>

              <BeforeAfter
                before="/gallery/limpieza.jpg"
                after="/gallery/despues1.jpg"
                titleBefore={t("services.before")}
                titleAfter={t("services.after")}
              />
            </section>

            {/* Carousel */}
            <WorkCarousel />
          </div>
        </div>
      </div>
    </>
  );
}
