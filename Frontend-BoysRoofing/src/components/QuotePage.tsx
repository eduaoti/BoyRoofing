"use client";

import useTranslation from "@/hooks/useTranslation";
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

  const inputBase =
    "w-full rounded-lg bg-br-smoke/80 px-4 py-3 text-br-white border border-br-smoke-light/70 " +
    "focus:outline-none focus:ring-2 focus:ring-br-red-main focus:border-br-red-main " +
    "placeholder:text-br-stone text-sm";

  const labelBase = "block text-xs font-medium tracking-wide text-br-stone mb-1.5";

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-br-white py-20">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <div className="mx-auto max-w-4xl px-4">
        {/* Encabezado */}
        <div className="mb-10">
          <span className="inline-flex items-center rounded-full bg-br-red-main/10 px-3 py-1 text-xs font-semibold text-br-red-main uppercase tracking-wide">
            {t("navbar.quote")}
          </span>

          <h1 className="mt-4 text-4xl md:text-5xl font-bold text-br-red-main">
            {t("quote.title")}
          </h1>

          <p className="mt-4 text-sm md:text-base text-br-stone max-w-2xl">
            {t("quote.subtitle")}
          </p>
        </div>

        {/* Card del formulario */}
        <div className="rounded-2xl bg-[#111315] border border-[#2a2a2a] shadow-2xl shadow-black/40 p-6 md:p-8">
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

            {/* Botón */}
            <div className="pt-4">
              <button
                type="submit"
                className="btn-pulse w-full md:w-auto px-8 py-3 rounded-lg bg-br-red-main font-semibold text-sm md:text-base hover:bg-br-red-light shadow-md hover:shadow-red-700/40 transition-all"
              >
                {t("quote.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
