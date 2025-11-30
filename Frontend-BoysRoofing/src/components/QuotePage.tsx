"use client";

import useTranslation from "@/hooks/useTranslation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function QuotePage() {
  const { t } = useTranslation();

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

      alert("¡Cotización enviada con éxito!");

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
      alert("Hubo un error al enviar tu solicitud. Inténtalo más tarde.");
    }
  };

  return (
    <div className="bg-br-carbon min-h-screen text-br-white py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="text-4xl font-bold text-br-red-main">
          {t("quote.title")}
        </h1>

        <p className="mt-4 text-br-stone">{t("quote.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          {/* NAME */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.name")}</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.phone")}</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.email")}</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* SERVICE */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.service")}</label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            >
              <option value="">{t("quote.select")}</option>
              <option value="new-roof">{t("quote.services.newRoof")}</option>
              <option value="repair">{t("quote.services.repair")}</option>
              <option value="cleaning">{t("quote.services.cleaning")}</option>
            </select>
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.address")}</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* CITY */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.city")}</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* STATE */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.state")}</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* ZIP */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.zip")}</label>
            <input
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* PROPERTY LOCATION */}
          <div>
            <label className="block text-sm text-br-stone">
              {t("quote.propertyLocation")}
            </label>
            <input
              name="propertyLocation"
              value={form.propertyLocation}
              onChange={handleChange}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
              required
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block text-sm text-br-stone">{t("quote.message")}</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md bg-br-smoke px-4 py-3 text-br-white border border-br-smoke-light"
            />
          </div>

          <button
            type="submit"
            className="btn-pulse w-full bg-br-red-main px-6 py-3 rounded-md font-semibold hover:bg-br-red-light shadow-md transition-all"
          >
            {t("quote.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
