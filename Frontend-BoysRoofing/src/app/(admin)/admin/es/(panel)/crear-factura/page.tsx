// src/app/admin/es/(panel)/crear-factura/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

function getDefaultInvoiceMeta() {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  return { number: `FAC-${datePart}`, date: today.toISOString().slice(0, 10) };
}

export default function CrearFacturaES() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [billTo, setBillTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [service, setService] = useState("Factura");

  const [invoiceNumber, setInvoiceNumber] = useState(() => getDefaultInvoiceMeta().number);
  const [invoiceDate, setInvoiceDate] = useState(() => getDefaultInvoiceMeta().date);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [other, setOther] = useState<string>("0");

  const subtotal = Number(price || 0);
  const otherNumber = Number(other || 0);
  const total = subtotal + otherNumber;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
    if (!token) {
      router.push("/admin/es/login");
      return;
    }

    try {
      setSubmitting(true);

      const quoteBody = {
        email: email.trim(),
        name: billTo,
        phone,
        address,
        city,
        state: stateValue,
        zip,
        propertyLocation,
        service: service || "Factura",
        message: description || "",
      };

      let quoteRes = await apiFetch("/quotes/for-invoice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteBody),
      });

      // Fallback: si el backend en Railway aún no tiene la ruta (404), usar POST /quotes
      if (quoteRes.status === 404) {
        quoteRes = await apiFetch("/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(quoteBody),
        });
      }

      if (!quoteRes.ok) {
        const text = await quoteRes.text();
        if (quoteRes.status === 401) {
          if (typeof window !== "undefined") localStorage.removeItem("br_admin_token");
          router.push("/admin/es/login");
          setSubmitting(false);
          return;
        }
        console.error("Error creando cotización para factura:", quoteRes.status, text);
        try {
          const errJson = JSON.parse(text);
          alert(errJson.message || "No se pudo crear la cotización. Revisa los datos.");
        } catch {
          alert(`No se pudo crear la cotización (${quoteRes.status}). Revisa que el backend esté en marcha y que hayas iniciado sesión.`);
        }
        setSubmitting(false);
        return;
      }

      const quote = await quoteRes.json();

      const invoiceBody = {
        quoteId: Number(quote.id),
        billTo,
        phone,
        address,
        city,
        state: stateValue,
        zip,
        propertyLocation,
        invoiceNumber,
        invoiceDate,
        description,
        price: subtotal,
        subtotal,
        other: otherNumber,
        total,
      };

      const res = await apiFetch("/invoices", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceBody),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 401) {
          if (typeof window !== "undefined") localStorage.removeItem("br_admin_token");
          router.push("/admin/es/login");
          setSubmitting(false);
          return;
        }
        console.error("Error al crear la factura:", res.status, text);
        try {
          const errJson = JSON.parse(text);
          alert(errJson.message || "Hubo un problema al crear la factura.");
        } catch {
          alert(`Error al crear la factura (${res.status}). Revisa la consola.`);
        }
        setSubmitting(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert("Factura creada y enviada al correo indicado. PDF descargado.");
      router.push("/admin/es/crear-factura");
    } catch (err) {
      console.error("Error enviando factura:", err);
      alert("Error inesperado al crear la factura.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-br-pearl">
          Crear factura
        </h1>
        <p className="mt-1 text-sm text-br-white/60">
          Llena el formulario desde cero. La factura en PDF se enviará al correo
          que indiques abajo.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-br-smoke-light bg-br-smoke/25 p-6 shadow-lg"
      >
        {/* CORREO DESTINO */}
        <section className="rounded-lg border border-br-red-main/40 bg-br-red-main/5 p-4">
          <h2 className="text-sm font-semibold text-br-pearl mb-2">
            Correo al que se enviará la factura
          </h2>
          <input
            type="email"
            className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="cliente@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </section>

        {/* INFORMACIÓN DE FACTURACIÓN */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-br-pearl">
              Información de facturación
            </h2>
            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Facturar a</label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Teléfono</label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Dirección</label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-br-pearl">
              Ubicación / meta
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-br-white/70">Ciudad</label>
                <input
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-br-white/70">Estado</label>
                <input
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={stateValue}
                  onChange={(e) => setStateValue(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-br-white/70">Código postal</label>
                <input
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-br-white/70">
                  Fecha de factura (AAAA-MM-DD)
                </label>
                <input
                  type="date"
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">
                Ubicación de la propiedad
              </label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={propertyLocation}
                onChange={(e) => setPropertyLocation(e.target.value)}
                required
              />
            </div>
          </div>
        </section>

        {/* NÚMERO Y SERVICIO */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Número de factura</label>
            <input
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl font-mono"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Servicio</label>
            <input
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="Ej: new-roof, repair, Factura"
            />
          </div>
        </section>

        {/* DESCRIPCIÓN */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold text-br-pearl">
            Descripción del trabajo / materiales
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-lg bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="Describe el trabajo, materiales, metros cuadrados, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </section>

        {/* PRECIOS */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Precio</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Otros cargos</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Total</label>
            <input
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl font-semibold"
              value={total.toFixed(2)}
              readOnly
            />
          </div>
        </section>

        <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-br-red-main px-6 py-2 text-xs font-semibold text-white hover:bg-br-red-light disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Creando factura..." : "Crear y enviar factura"}
          </button>
        </div>
      </form>
    </div>
  );
}
