"use client";

import useTranslation from "@/hooks/useTranslation";

export default function ContactPage() {
  const { t } = useTranslation();

  const phone = t("contact.phone");
  const smsHref = `sms:${phone}?body=${encodeURIComponent(
    t("contact.defaultMessage")
  )}`;

  return (
    <div className="bg-[#0F0F0F] text-white overflow-hidden">

      <div className="w-full h-[6px] bg-gradient-to-r from-red-700 via-red-500 to-transparent animate-slideLight" />

      {/* HERO */}
      <section className="relative w-full h-[20vh] md:h-[25vh] flex items-center justify-center bg-[#111315] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(120,15,22,0.35),rgba(120,15,22,0.15)_45%,rgba(0,0,0,0.45)_85%)]"></div>

        <div className="text-center px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            {t("contact.sectionTitle")}
          </h1>

          <p className="mt-3 text-lg text-gray-300 max-w-2xl mx-auto">
            {t("contact.sectionText")}
          </p>
        </div>
      </section>

      {/* CAJA DE CONTACTO */}
      <section className="py-10 flex justify-center">
        <div className="bg-[#181818] border border-[#2a2a2a] p-10 rounded-2xl shadow-xl w-[90%] max-w-xl text-center">

          <div className="flex justify-center gap-14 mb-10">
            <a href={`tel:${phone}`} className="text-5xl hover:scale-125 transition cursor-pointer" title={t("contact.callButton")}>
              📞
            </a>

            <a href={smsHref} className="text-5xl hover:scale-125 transition cursor-pointer" title={t("contact.smsButton")}>
              ✉️
            </a>
          </div>

          <a href={`tel:${phone}`} className="block bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-md transition">
            {t("contact.callButton")}
          </a>

          <a href={smsHref} className="block mt-4 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-bold py-3 rounded-lg transition">
            {t("contact.smsButton")}
          </a>

          <p className="mt-6 text-gray-300 text-sm">{phone}</p>
          <p className="text-xs text-gray-500 mt-1">{t("contact.badge")}</p>
        </div>
      </section>

    </div>
  );
}
