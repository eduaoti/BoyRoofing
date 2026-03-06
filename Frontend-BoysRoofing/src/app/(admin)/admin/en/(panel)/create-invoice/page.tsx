// src/app/admin/en/(panel)/create-invoice/page.tsx
"use client";

import { FormEvent, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";

function getDefaultInvoiceMeta() {
  const today = new Date();
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  return { number: `INV-${datePart}`, date: today.toISOString().slice(0, 10) };
}

export default function CreateInvoiceEN() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const [email, setEmail] = useState("");
  const [billTo, setBillTo] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");
  const [propertyLocation, setPropertyLocation] = useState("");
  const [service, setService] = useState("Invoice");

  const [invoiceNumber, setInvoiceNumber] = useState(() => getDefaultInvoiceMeta().number);
  const [invoiceDate, setInvoiceDate] = useState(() => getDefaultInvoiceMeta().date);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("0");
  const [other, setOther] = useState<string>("0");

  const resetForm = useCallback(() => {
    const meta = getDefaultInvoiceMeta();
    setEmail("");
    setBillTo("");
    setPhone("");
    setAddress("");
    setCity("");
    setStateValue("");
    setZip("");
    setPropertyLocation("");
    setService("Invoice");
    setInvoiceNumber(meta.number);
    setInvoiceDate(meta.date);
    setDescription("");
    setPrice("0");
    setOther("0");
  }, []);

  const subtotal = Number(price || 0);
  const otherNumber = Number(other || 0);
  const total = subtotal + otherNumber;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const token = typeof window !== "undefined" ? localStorage.getItem("br_admin_token") : null;
    if (!token) {
      router.push("/admin/en/login");
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
        service: service || "Invoice",
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

      // Fallback: if backend on Railway doesn't have the new route yet (404), use POST /quotes
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
          router.push("/admin/en/login");
          setSubmitting(false);
          return;
        }
        console.error("Error creating quote for invoice:", quoteRes.status, text);
        try {
          const errJson = JSON.parse(text);
          setToast({ type: "error", message: errJson.message || "Could not create the quote. Please check the data." });
        } catch {
          setToast({ type: "error", message: `Could not create the quote (${quoteRes.status}). Make sure the backend is running and you are logged in.` });
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
          router.push("/admin/en/login");
          setSubmitting(false);
          return;
        }
        console.error("Error creating invoice:", res.status, text);
        try {
          const errJson = JSON.parse(text);
          setToast({ type: "error", message: errJson.message || "There was a problem creating the invoice." });
        } catch {
          setToast({ type: "error", message: `Error creating invoice (${res.status}). Check the console.` });
        }
        setSubmitting(false);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      resetForm();
      setToast({ type: "success", message: "Invoice created and sent to the email provided. PDF downloaded." });
    } catch (err) {
      console.error("Error submitting invoice:", err);
      setToast({ type: "error", message: "Unexpected error while creating the invoice." });
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
      <header>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-br-pearl">
          Create invoice
        </h1>
        <p className="mt-1 text-sm text-br-white/60">
          Fill out the form from scratch. The PDF invoice will be sent to the
          email you enter below.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-br-smoke-light bg-br-smoke/25 p-6 shadow-lg"
      >
        {/* EMAIL DESTINATION */}
        <section className="rounded-lg border border-br-red-main/40 bg-br-red-main/5 p-4">
          <h2 className="text-sm font-semibold text-br-pearl mb-2">
            Email address to send the invoice to
          </h2>
          <input
            type="email"
            className="w-full rounded bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="client@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </section>

        {/* BILLING INFO */}
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
                <label className="block text-br-white/70">ZIP code</label>
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
              <label className="block text-br-white/70">
                Property location
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

        {/* NUMBER AND SERVICE */}
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
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. new-roof, repair, Invoice"
            />
          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="space-y-2">
          <label className="block text-xs font-semibold text-br-pearl">
            Description of work / materials
          </label>
          <textarea
            className="min-h-[140px] w-full rounded-lg bg-br-carbon border border-br-smoke-light px-3 py-2 text-sm text-br-pearl"
            placeholder="Describe the work, materials, square footage, etc."
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

        <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-end">
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
