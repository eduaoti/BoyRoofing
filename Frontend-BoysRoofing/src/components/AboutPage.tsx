"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";

export default function AboutPage() {
  const { t } = useTranslation();

  const reveal1 = useReveal();
  const reveal2 = useReveal();

  return (
    <div className="bg-br-carbon text-br-white py-20">
      <div className="mx-auto max-w-6xl px-4">

        <h1 className="text-4xl font-bold text-br-red-main reveal">
          {t("history.sectionTitle")}
        </h1>

        <div
          ref={reveal1}
          className="reveal mt-8 space-y-4 text-br-stone max-w-3xl"
        >
          <p>{t("history.p1")}</p>
          <p>{t("history.p2")}</p>
          <p>{t("history.p3")}</p>
          <p>{t("history.p4")}</p>
        </div>

        {/* CUADRO ESPECIAL */}
        <div
          ref={reveal2}
          className="reveal mt-12 rounded-xl border border-white/10 bg-[rgba(22,26,29,0.35)] backdrop-blur-md p-8 shadow-xl"
        >
          <h2 className="text-2xl font-semibold text-br-red-light">
            {t("history.highlightTitle")}
          </h2>
          <p className="mt-4">{t("history.highlightText")}</p>
        </div>

      </div>
    </div>
  );
}
