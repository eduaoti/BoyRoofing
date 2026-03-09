// src/components/ContactPage.tsx
"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";

export default function ContactPage() {
  const { t } = useTranslation();
  const refCard = useReveal();

  const phone = t("contact.phone");
  const telHref = `tel:${phone}`;
  const smsHref = `sms:${phone}?body=${encodeURIComponent(
    t("contact.defaultMessage")
  )}`;

  return (
    <div className="bg-[#0F0F0F] text-white overflow-hidden">
      {/* Hero */}
      <section className="relative w-full min-h-[38vh] md:min-h-[44vh] flex items-center justify-center overflow-hidden page-hero">
        <div className="absolute inset-0 page-hero-overlay" />
        <div className="absolute inset-0 page-hero-glow" />
        <div className="absolute top-0 left-0 w-full page-hero-accent animate-slideLight" />
        <div className="text-center px-6 relative z-10 max-w-2xl mx-auto">
<h1 className="page-h1 text-white page-hero-title">
          {t("contact.sectionTitle")}
          </h1>
          <p className="mt-4 page-tagline max-w-2xl mx-auto">
            {t("contact.sectionText")}
          </p>
        </div>
      </section>

      {/* Tarjeta de contacto */}
      <section className="home-section-dark py-20 md:py-24 flex justify-center">
        <div ref={refCard} className="reveal w-full max-w-xl px-6">
          <div className="home-card rounded-2xl px-8 py-10 text-center border border-white/10">
            {/* Iconos */}
            <div className="flex justify-center gap-10 mb-10">
              <a
                href={telHref}
                title={t("contact.callButton")}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-br-red-light/50 hover:bg-br-red-main/10 transition-all"
              >
                <svg
                  className="w-7 h-7 text-white opacity-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h1.125c1.035 0 1.875-.84 1.875-1.875v-2.548c0-.464-.316-.868-.768-.97l-4.507-1.002a1.125 1.125 0 00-1.173.494l-.97 1.455a.75.75 0 01-1.043.257 12.04 12.04 0 01-5.267-5.268.75.75 0 01.257-1.042l1.455-.97a1.125 1.125 0 00.494-1.173L6.643 3.892a1.125 1.125 0 00-.97-.768H3.75C2.715 3.125 1.875 3.965 1.875 5v1.125z"
                  />
                </svg>
              </a>

              <a
                href={smsHref}
                title={t("contact.smsButton")}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-br-red-light/50 hover:bg-br-red-main/10 transition-all"
              >
                <svg
                  className="w-7 h-7 text-white opacity-90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>

            <a
              href={telHref}
              className="block w-full bg-br-red-main text-white font-semibold py-3.5 rounded-xl uppercase tracking-wide text-sm hover:bg-br-red-light transition-all"
            >
              {t("contact.callButton")}
            </a>
            <a
              href={smsHref}
              className="mt-3 block w-full border-2 border-br-red-main text-br-red-light font-semibold py-3.5 rounded-xl uppercase tracking-wide text-sm hover:bg-br-red-main hover:text-white transition-all"
            >
              {t("contact.smsButton")}
            </a>

            <div className="mt-6 text-center text-sm">
              <p className="font-medium text-gray-100">{phone}</p>
              <p className="text-xs text-gray-400 mt-1">{t("contact.badge")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
