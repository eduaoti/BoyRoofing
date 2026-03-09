"use client";

import useTranslation from "@/hooks/useTranslation";
import useReveal from "@/hooks/useReveal";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";

export default function QuotePage() {
  const { t } = useTranslation();
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    propertyLocation: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = { ...form, status: "PENDING" };

    try {
      const res = await apiFetch("/quotes", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        console.error("Error backend:", await res.text());
        throw new Error("Error al enviar la cotización");
      }

      setToast({ type: "success", message: "¡Cotización enviada con éxito!" });

      setForm({
        name: "",
        phone: "",
        email: "",
        service: "",
        message: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        propertyLocation: "",
      });
    } catch (error) {
      console.error("Error:", error);
      setToast({ type: "error", message: "Hubo un error al enviar tu solicitud. Inténtalo más tarde." });
    }
  };

  const refForm = useReveal();

  const inputBase =
    "w-full rounded-lg bg-br-smoke/80 px-4 py-3 text-br-white border border-br-smoke-light/70 " +
    "focus:outline-none focus:ring-2 focus:ring-br-red-main focus:border-br-red-main " +
    "placeholder:text-br-stone text-sm";

  const labelBase = "block text-xs font-medium tracking-wide text-br-stone mb-1.5";

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-br-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      {/* Hero */}
      <section className="relative w-full min-h-[32vh] md:min-h-[38vh] flex items-center justify-center overflow-hidden page-hero">
        <div className="absolute inset-0 page-hero-overlay" />
        <div className="absolute inset-0 page-hero-glow" />
        <div className="absolute top-0 left-0 w-full page-hero-accent animate-slideLight" />
        <div className="text-center px-6 relative z-10 max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-br-red-main/20 px-3 py-1 text-xs font-semibold text-br-red-light uppercase tracking-wide border border-br-red-main/30">
            {t("navbar.quote")}
          </span>
          <h1 className="page-h1 mt-4 text-white page-hero-title">
            {t("quote.title")}
          </h1>
          <p className="mt-3 page-tagline">
            {t("quote.subtitle")}
          </p>
        </div>
      </section>

      {/* Formulario */}
      <section className="home-section-dark py-16 md:py-24">
        <div ref={refForm} className="reveal mx-auto max-w-4xl px-6">
          <div className="home-card rounded-2xl border border-white/10 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Datos de contacto */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-br-white/90">
                {t("quote.sectionContact") ?? "Contact information"}
              </h2>

              <div className="grid md:grid-cols-2 gap-5">
                {/* NAME */}
                <div>
                  <label className={labelBase}>{t("quote.name")}</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={inputBase}
                    required
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className={labelBase}>{t("quote.phone")}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="md:w-2/3">
                <label className={labelBase}>{t("quote.email")}</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <hr className="border-t border-[#2a2a2a]" />

            {/* Servicio */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-br-white/90">
                {t("quote.sectionService") ?? "Service details"}
              </h2>

              {/* SERVICE */}
              <div className="md:w-2/3">
                <label className={labelBase}>{t("quote.service")}</label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  className={inputBase}
                  required
                >
                  <option value="">{t("quote.select")}</option>
                  <option value="new-roof">{t("quote.services.newRoof")}</option>
                  <option value="repair">{t("quote.services.repair")}</option>
                  <option value="cleaning">{t("quote.services.cleaning")}</option>
                </select>
              </div>
            </div>

            <hr className="border-t border-[#2a2a2a]" />

            {/* Dirección / ubicación */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-br-white/90">
                {t("quote.sectionLocation") ?? "Property location"}
              </h2>

              {/* ADDRESS */}
              <div>
                <label className={labelBase}>{t("quote.address")}</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {/* CITY */}
                <div>
                  <label className={labelBase}>{t("quote.city")}</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    className={inputBase}
                    required
                  />
                </div>

                {/* STATE */}
                <div>
                  <label className={labelBase}>{t("quote.state")}</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className={inputBase}
                    required
                  />
                </div>

                {/* ZIP */}
                <div>
                  <label className={labelBase}>{t("quote.zip")}</label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    className={inputBase}
                    required
                  />
                </div>
              </div>

              {/* PROPERTY LOCATION EXTRA */}
              <div>
                <label className={labelBase}>
                  {t("quote.propertyLocation")}
                </label>
                <input
                  name="propertyLocation"
                  value={form.propertyLocation}
                  onChange={handleChange}
                  className={inputBase}
                  required
                />
              </div>
            </div>

            <hr className="border-t border-[#2a2a2a]" />

            {/* Mensaje / descripción */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-br-white/90">
                {t("quote.sectionDetails") ?? "Additional details"}
              </h2>

              <div>
                <label className={labelBase}>{t("quote.message")}</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className={inputBase + " resize-none"}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="btn-pulse w-full md:w-auto px-8 py-3.5 rounded-xl bg-br-red-main font-semibold text-sm md:text-base hover:bg-br-red-light shadow-lg hover:shadow-red-900/30 transition-all"
              >
                {t("quote.submit")}
              </button>
            </div>
          </form>
          </div>
        </div>
      </section>
    </div>
  );
}
