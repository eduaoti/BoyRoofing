// src/app/admin/es/(panel)/invoices/[quoteId]/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type QuoteStatus = "PENDING" | "IN_REVIEW" | "SENT" | "CLOSED" | string;

type Quote = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyLocation: string;
  status: QuoteStatus;
  createdAt?: string;
};

export default function InvoiceCreateES() {
  const { quoteId } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---- campos del formulario ----
  const [billTo, setBillTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [other, setOther] = useState<string>("0");

  // calculados
  const subtotal = Number(price || 0);
  const otherNumber = Number(other || 0);
  const total = subtotal + otherNumber;

  // Cargar la quote y rellenar campos
  useEffect(() => {
    async function loadQuote() {
      try {
        const token = typeof window !== "undefined"
          ? localStorage.getItem("br_admin_token")
          : null;

        if (!token) {
          router.push("/admin/es/login");
          return;
        }

        const res = await apiFetch(`/quotes/${quoteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("br_admin_token");
          }
          router.push("/admin/es/login");
          return;
        }

        if (!res.ok) {
          console.error(
            "No se pudo cargar la cotización para la factura:",
            await res.text()
          );
          setLoading(false);
          return;
        }

        const data: Quote = await res.json();
        setQuote(data);

        // Prefill
        setBillTo(data.name);
        setPhone(data.phone);
        setAddress(data.address);
        setCity(data.city);
        setStateValue(data.state);
        setZip(data.zip);
        setPropertyLocation(data.propertyLocation);

        // Número sugerido
        const today = new Date();
        const datePart = `${today.getFullYear()}${String(
          today.getMonth() + 1
        ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        setInvoiceNumber(`FAC-${data.id}-${datePart}`);

        // Fecha de hoy en formato YYYY-MM-DD
        setInvoiceDate(today.toISOString().slice(0, 10));

        setDescription("");
      } catch (err) {
        console.error("Error al cargar cotización para factura:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuote();
  }, [quoteId, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!quote) return;

    try {
      setSubmitting(true);

      const token = typeof window !== "undefined"
        ? localStorage.getItem("br_admin_token")
        : null;

      if (!token) {
        router.push("/admin/es/login");
        return;
      }

      const body = {
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
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Error al crear la factura:", await res.text());
        alert("Hubo un problema al crear la factura.");
        setSubmitting(false);
        return;
      }

      // Recibimos el PDF como blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert(
        "Factura creada, enviada al cliente por correo y descargada en PDF."
      );
      router.push(`/admin/es/quotes/${quote.id}`);
    } catch (err) {
      console.error("Error enviando factura:", err);
      alert("Error inesperado al crear la factura.");
      setSubmitting(false);
    }
  }

  if (loading || !quote) {
    return (
      <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-br-smoke-light bg-br-smoke/30 p-6 text-sm text-br-white/70">
        {loading ? "Cargando datos de la cotización..." : "Cotización no encontrada."}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            onClick={() => router.push(`/admin/es/quotes/${quote.id}`)}
            className="mb-2 text-xs font-medium text-br-white/60 hover:text-br-pearl underline underline-offset-4"
          >
            ← Volver a la cotización
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-br-pearl">
            Crear factura
          </h1>
          <p className="mt-1 text-xs text-br-white/60">
            Llena el siguiente formulario para generar una factura en PDF y
            enviarla al cliente.
          </p>
        </div>

        <div className="text-xs text-br-white/60 text-right">
          <p>
            ID de cotización:{" "}
            <span className="font-mono text-br-pearl">#{quote.id}</span>
          </p>
          <p>
            Cliente:{" "}
            <span className="font-semibold text-br-pearl">{quote.name}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-br-smoke-light bg-br-smoke/25 p-6 shadow-lg"
      >
        {/* BILLING / CONTACT */}
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

        {/* INVOICE META */}
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
              value={quote.service}
              disabled
            />
          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold text-br-pearl">
            Descripción del trabajo / materiales
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-lg bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="Describe el trabajo, materiales, metros cuadrados, cumbreras, láminas, impermeabilización, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </section>

        {/* PRICES */}
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

        {/* ACTIONS */}
        <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-between sm:items-center">
          <button
            type="button"
            onClick={() => router.push(`/admin/es/quotes/${quote.id}`)}
            className="inline-flex items-center justify-center rounded-full border border-br-smoke-light bg-br-smoke/40 px-5 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-br-red-main px-6 py-2 text-xs font-semibold text-white hover:bg-br-red-light disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting
              ? "Creando factura..."
              : "Crear y enviar factura"}
          </button>
        </div>
      </form>
    </div>
  );
}
