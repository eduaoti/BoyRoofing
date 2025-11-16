"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";

export default function ServicesPage() {
  const { t } = useTranslation();

  const reveal1 = useReveal();
  const reveal2 = useReveal();

  return (
    <div className="bg-br-carbon text-br-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        
        <h1 className="text-4xl font-bold text-br-red-main reveal">
          {t("services.sectionTitle")}
        </h1>

        <p className="mt-4 max-w-2xl text-br-stone reveal delay-100">
          {t("services.sectionSubtitle")}
        </p>

        <div className="mt-12 space-y-12">

          {/* Servicio 1 */}
          <section
            ref={reveal1}
            className="reveal rounded-xl border border-br-smoke bg-br-smoke/40 p-8 backdrop-blur shadow-xl hover:scale-[1.01] transition-transform"
          >
            <h2 className="text-2xl font-semibold text-br-red-light">
              {t("services.roofing.title")}
            </h2>
            <p className="mt-4">{t("services.roofing.p1")}</p>
            <p className="mt-3">{t("services.roofing.p2")}</p>
          </section>

          {/* Servicio 2 */}
          <section
            ref={reveal2}
            className="reveal rounded-xl border border-br-smoke bg-br-smoke/40 p-8 backdrop-blur shadow-xl hover:scale-[1.01] transition-transform"
          >
            <h2 className="text-2xl font-semibold text-br-red-light">
              {t("services.cleaning.title")}
            </h2>
            <p className="mt-4">{t("services.cleaning.p1")}</p>
            <p className="mt-3">{t("services.cleaning.p2")}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
