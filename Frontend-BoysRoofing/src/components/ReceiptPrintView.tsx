"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { PaymentReceipt } from "@/lib/receipts";
import { updateReceipt } from "@/lib/receipts";
import { apiFetch } from "@/lib/api";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

type Props = {
  receipt: PaymentReceipt;
  onClose: () => void;
  locale: "en" | "es";
};

const copy = {
  en: {
    title: "Payment receipt",
    receivedFrom: "Received from",
    theSumOf: "the sum of",
    forConcept: "for",
    notes: "Notes",
    signature: "Signature",
    close: "Close",
    print: "Print",
    sendEmail: "Send by email",
    sendTo: "Send to",
    emailPlaceholder: "Client email",
    sending: "Sending…",
    sendSuccess: "Receipt sent by email.",
    sendError: "Could not send email. Try again.",
  },
  es: {
    title: "Recibo de pago",
    receivedFrom: "Recibí de",
    theSumOf: "la cantidad de",
    forConcept: "por concepto de",
    notes: "Notas",
    signature: "Firma",
    close: "Cerrar",
    print: "Imprimir",
    sendEmail: "Enviar por correo",
    sendTo: "Enviar a",
    emailPlaceholder: "Correo del cliente",
    sending: "Enviando…",
    sendSuccess: "Recibo enviado por correo.",
    sendError: "No se pudo enviar. Intenta de nuevo.",
  },
};

function formatAmount(amount: number, locale: "en" | "es"): string {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string, locale: "en" | "es"): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr + "T12:00:00"));
}

export function ReceiptPrintView({ receipt, onClose, locale }: Props) {
  const t = copy[locale];
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [sendTo, setSendTo] = useState(receipt.clientEmail ?? "");
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<"success" | "error" | null>(null);

  function handlePrint() {
    window.print();
  }

  async function handleSendEmail() {
    const email = sendTo.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSendMessage("error");
      return;
    }
    setSending(true);
    setSendMessage(null);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const res = await apiFetch("/receipts/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: email,
          receipt: {
            receiptNumber: receipt.receiptNumber,
            date: receipt.date,
            clientName: receipt.clientName,
            amount: receipt.amount,
            concept: receipt.concept,
            notes: receipt.notes,
          },
          locale,
          logoUrl: `${baseUrl}/gallery/LOGO.png`,
        }),
      });
      if (res.status === 401) {
        window.location.href = locale === "es" ? "/admin/es/login" : "/admin/en/login";
        return;
      }
      if (res.ok) {
        setSendMessage("success");
        updateReceipt(receipt.id, { clientEmail: email });
        setShowSendEmail(false);
      } else {
        setSendMessage("error");
      }
    } catch {
      setSendMessage("error");
    } finally {
      setSending(false);
    }
  }

  const printContent = (
    <div className="hidden print:block p-8 text-black bg-white min-h-screen">
      <ReceiptContent receipt={receipt} locale={locale} t={t} formatAmount={formatAmount} formatDate={formatDate} />
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden">
        <div className="bg-br-smoke border border-white/10 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
          <div className="p-4 border-b border-white/10 flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-br-red-main">{t.title}</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setSendTo(receipt.clientEmail ?? ""); setSendMessage(null); setShowSendEmail(true); }}
                className="admin-btn-secondary px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1.5"
              >
                <EnvelopeIcon className="h-4 w-4" />
                {t.sendEmail}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="admin-btn-primary text-white px-4 py-2 rounded-xl text-sm font-medium"
              >
                {t.print}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="admin-btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
              >
                {t.close}
              </button>
            </div>
          </div>
          {showSendEmail && (
            <div className="p-4 border-b border-white/10 bg-br-carbon/50 space-y-2">
              <label className="block text-sm font-medium text-br-pearl/80">{t.sendTo}</label>
              <input
                type="email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main text-sm"
              />
              {sendMessage === "error" && (
                <p className="text-sm text-red-400">{t.sendError}</p>
              )}
              {sendMessage === "success" && (
                <p className="text-sm text-green-400">{t.sendSuccess}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={sending}
                  className="admin-btn-primary text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60"
                >
                  {sending ? t.sending : t.sendEmail}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowSendEmail(false); setSendMessage(null); }}
                  className="admin-btn-secondary px-4 py-2 rounded-xl text-sm font-medium"
                >
                  {t.close}
                </button>
              </div>
            </div>
          )}
          <div id="receipt-content" className="p-6 text-br-pearl">
            <ReceiptContent receipt={receipt} locale={locale} t={t} formatAmount={formatAmount} formatDate={formatDate} />
          </div>
        </div>
      </div>

      {typeof document !== "undefined" && createPortal(printContent, document.body)}
    </>
  );
}

const LOGO_SRC = "/gallery/LOGO.png";

function ReceiptContent({
  receipt,
  locale,
  t,
  formatAmount,
  formatDate,
}: {
  receipt: PaymentReceipt;
  locale: "en" | "es";
  t: (typeof copy.en);
  formatAmount: (n: number, l: "en" | "es") => string;
  formatDate: (d: string, l: "en" | "es") => string;
}) {
  return (
    <div className="space-y-6 print:text-black">
      <div className="text-center border-b border-br-red-main/30 pb-4">
        <img
          src={LOGO_SRC}
          alt="Boy's Roofing"
          className="mx-auto h-14 w-auto object-contain print:h-16 print:max-w-[200px]"
        />
        <h1 className="text-2xl font-bold text-br-red-main mt-2">Boy&apos;s Roofing</h1>
        <p className="text-sm text-br-pearl/80 mt-1 print:text-gray-600">{t.title}</p>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-br-pearl/70 print:text-gray-500">{t.title} #</span>
        <span className="font-mono font-semibold">{receipt.receiptNumber}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-br-pearl/70 print:text-gray-500">{locale === "es" ? "Fecha" : "Date"}</span>
        <span>{formatDate(receipt.date, locale)}</span>
      </div>
      <p className="text-br-pearl leading-relaxed print:text-gray-800">
        {t.receivedFrom} <strong className="text-white print:text-black">{receipt.clientName}</strong> {t.theSumOf}{" "}
        <strong className="text-br-red-main print:text-gray-900">{formatAmount(receipt.amount, locale)}</strong> {t.forConcept}{" "}
        <strong>{receipt.concept}</strong>.
      </p>
      {receipt.notes && (
        <div>
          <p className="text-xs text-br-pearl/70 print:text-gray-500 uppercase tracking-wide">{t.notes}</p>
          <p className="text-br-pearl text-sm mt-1 print:text-gray-700">{receipt.notes}</p>
        </div>
      )}
      <div className="pt-8 mt-8 border-t border-white/10">
        <p className="text-xs text-br-pearl/60 print:text-gray-500 uppercase tracking-wide">{t.signature}</p>
        <div className="h-12 mt-2 border-b border-br-pearl/30 print:border-gray-400" />
      </div>
    </div>
  );
}
