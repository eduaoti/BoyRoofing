// src/app/admin/en/(panel)/invoices/[quoteId]/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";

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

export default function InvoiceCreateEN() {
  const { quoteId } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

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
        const token = localStorage.getItem("br_admin_token");

        if (!token) {
          router.push("/admin/en/login");
          return;
        }

        const res = await apiFetch(`/quotes/${quoteId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/en/login");
          return;
        }

        if (!res.ok) {
          console.error("Failed to load quote for invoice:", await res.text());
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

        // Número de invoice sugerido
        const today = new Date();
        const datePart = `${today.getFullYear()}${String(
          today.getMonth() + 1
        ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
        setInvoiceNumber(`INV-${data.id}-${datePart}`);

        // Fecha de hoy en formato YYYY-MM-DD
        setInvoiceDate(today.toISOString().slice(0, 10));

        // descripción inicial vacía (la escribe el dueño)
        setDescription("");
      } catch (err) {
        console.error("Error loading quote for invoice:", err);
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

      const token = localStorage.getItem("br_admin_token");
      if (!token) {
        router.push("/admin/en/login");
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
        console.error("Error creating invoice:", await res.text());
        setToast({ type: "error", message: "There was a problem creating the invoice." });
        setSubmitting(false);
        return;
      }

      // Recibimos el PDF como blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ type: "success", message: "Invoice created, emailed to the customer and downloaded as PDF." });
      setTimeout(() => router.push(`/admin/en/quotes/${quote.id}`), 1500);
    } catch (err) {
      console.error("Error submitting invoice:", err);
      setToast({ type: "error", message: "Unexpected error while creating invoice." });
      setSubmitting(false);
    }
  }

  if (loading || !quote) {
    return (
      <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-br-smoke-light bg-br-smoke/30 p-6 text-sm text-br-white/70">
        {loading ? "Loading quote data..." : "Quote not found."}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            onClick={() => router.push(`/admin/en/quotes/${quote.id}`)}
            className="mb-2 text-xs font-medium text-br-white/60 hover:text-br-pearl underline underline-offset-4"
          >
            ← Back to quote
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-br-pearl">
            Create invoice
          </h1>
          <p className="mt-1 text-xs text-br-white/60">
            Fill the following form to generate a professional PDF invoice and
            send it to the customer.
          </p>
        </div>

        <div className="text-xs text-br-white/60 text-right">
          <p>
            Quote ID:{" "}
            <span className="font-mono text-br-pearl">#{quote.id}</span>
          </p>
          <p>
            Customer:{" "}
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
              Billing information
            </h2>

            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Bill to</label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={billTo}
                onChange={(e) => setBillTo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Phone</label>
              <input
                className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1 text-xs">
              <label className="block text-br-white/70">Address</label>
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
              Location / meta
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="block text-br-white/70">City</label>
                <input
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-br-white/70">State</label>
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
                <label className="block text-br-white/70">ZIP</label>
                <input
                  className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-br-white/70">
                  Invoice date (YYYY-MM-DD)
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
              <label className="block text-br-white/70">Property location</label>
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
            <label className="block text-br-white/70">Invoice number</label>
            <input
              className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl font-mono"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Service</label>
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
            Work / materials description
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-lg bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="Describe the work, materials, squares, ridge caps, flashing, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </section>

        {/* PRICES */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 text-xs">
            <label className="block text-br-white/70">Price</label>
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
            <label className="block text-br-white/70">Other charges</label>
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
            onClick={() => router.push(`/admin/en/quotes/${quote.id}`)}
            className="inline-flex items-center justify-center rounded-full border border-br-smoke-light bg-br-smoke/40 px-5 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-full bg-br-red-main px-6 py-2 text-xs font-semibold text-white hover:bg-br-red-light disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Creating invoice..." : "Create & send invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}
