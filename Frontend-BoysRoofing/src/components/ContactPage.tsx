"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";

export default function ContactPage() {
  const { t } = useTranslation();
  const reveal = useReveal();

  return (
    <div className="bg-br-smoke-light text-br-carbon py-20">
      <div className="mx-auto max-w-4xl px-4 text-center">

        <h1 className="text-4xl font-bold text-br-red-dark reveal">
          {t("contact.sectionTitle")}
        </h1>

        <p className="mt-4 text-br-carbon/80 reveal delay-100">
          {t("contact.sectionText")}
        </p>

        <div
          ref={reveal}
          className="reveal mt-10 flex flex-col items-center gap-4"
        >
          <a
            href="tel:+1-000-000-0000"
            className="rounded bg-br-red-main px-10 py-3 text-sm font-semibold text-br-white shadow-md hover:bg-br-red-light transition-all"
          >
            {t("contact.callButton")}
          </a>

          <p className="text-xs text-br-carbon/70">
            {t("contact.badge")}
          </p>
        </div>
      </div>
    </div>
  );
}
