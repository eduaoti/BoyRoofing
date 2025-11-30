// src/components/ContactPage.tsx
"use client";

import useTranslation from "@/hooks/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation();

  const phone = t("contact.phone");
  const telHref = `tel:${phone}`;
  const smsHref = `sms:${phone}?body=${encodeURIComponent(
    t("contact.defaultMessage")
  )}`;

  return (
    <div className="bg-[#0F0F0F] text-white overflow-hidden">
      {/* ✅ HERO (lo dejamos igual) */}
      <section className="relative w-full h-[38vh] md:h-[48vh] flex items-center justify-center overflow-hidden bg-[#111315]">
        {/* Degradado */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(120,15,22,0.55),rgba(120,15,22,0.18)_45%,rgba(0,0,0,0.65)_85%)]" />

        {/* Barrita roja superior */}
        <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-red-700/70 via-red-500/60 to-transparent animate-slideLight" />

        <div className="text-center px-6 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {t("contact.sectionTitle")}
          </h1>
          <p className="mt-3 text-base md:text-lg text-gray-300 font-light max-w-2xl mx-auto">
            {t("contact.sectionText")}
          </p>
        </div>
      </section>

      {/* ✅ SOLO LA TARJETA, SIN REPETIR TITULOS NI TEXTOS */}
      <section className="py-16 bg-[#0F0F0F] flex justify-center">
        <div className="w-[90%] max-w-xl px-2">
          <div className="bg-[#151515] border border-white/10 rounded-2xl px-8 py-10 shadow-xl text-center">
            {/* Iconos */}
            <div className="flex justify-center gap-10 mb-10">
              {/* Teléfono */}
              <a
                href={telHref}
                title={t("contact.callButton")}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#333]"
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

              {/* Mensaje */}
              <a
                href={smsHref}
                title={t("contact.smsButton")}
                className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1f1f1f] border border-[#333]"
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

            {/* Botón llamar */}
            <a
              href={telHref}
              className="block w-full bg-[#E5383B] text-white font-semibold py-3 rounded-lg uppercase tracking-wide text-sm hover:bg-[#f04446] transition-colors"
            >
              {t("contact.callButton")}
            </a>

            {/* Botón mensaje */}
            <a
              href={smsHref}
              className="mt-3 block w-full border border-[#E5383B] text-[#E5383B] font-semibold py-3 rounded-lg uppercase tracking-wide text-sm hover:bg-[#E5383B] hover:text-white transition-colors"
            >
              {t("contact.smsButton")}
            </a>

            {/* Teléfono y badge */}
            <div className="mt-6 text-center text-sm">
              <p className="font-medium text-gray-100">{phone}</p>
              <p className="text-[12px] text-gray-400 mt-1">
                {t("contact.badge")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
