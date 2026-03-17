"use client";

import { useState, useMemo, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { PaymentReceipt } from "@/lib/receipts";
import { updateReceipt, getJobBalance } from "@/lib/receipts";
import { apiFetch } from "@/lib/api";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

type Props = {
  receipt: PaymentReceipt;
  allReceipts?: PaymentReceipt[];
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
    sendNormal: "Normal receipt",
    sendBalanceDue: "Send balance due receipt",
    sendThankYou: "Send thank you (paid in full)",
    totalAgreed: "Total agreed",
    totalPaid: "Total paid",
    balanceDue: "Balance due",
    youOwe: "You have a balance due of",
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
    sendNormal: "Recibo normal",
    sendBalanceDue: "Enviar recibo de saldo pendiente",
    sendThankYou: "Enviar recibo de agradecimiento (saldo saldado)",
    totalAgreed: "Total acordado",
    totalPaid: "Total pagado",
    balanceDue: "Saldo pendiente",
    youOwe: "Usted me queda a deber",
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

export function ReceiptPrintView({ receipt, allReceipts = [], onClose, locale }: Props) {
  const t = copy[locale];
  const [showSendEmail, setShowSendEmail] = useState(false);
  const [sendTo, setSendTo] = useState(receipt.clientEmail ?? "");
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<"success" | "error" | null>(null);
  const [emailReceiptType, setEmailReceiptType] = useState<"payment" | "balance_due" | "thank_you">("payment");

  const balanceInfo = useMemo(() => {
    if (!receipt.jobReference || !allReceipts.length) return null;
    return getJobBalance(allReceipts, receipt.jobReference);
  }, [receipt.jobReference, allReceipts]);

  const canSendBalanceOrThankYou = balanceInfo != null && balanceInfo.totalPrice > 0;

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
      const websiteLink = "https://www.boysroofing.company" + (locale === "es" ? "/es" : "/en");
      const body: Record<string, unknown> = {
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
        signatureUrl: `${baseUrl}/firma.png`,
        websiteLink,
      };
      if (emailReceiptType === "balance_due" && balanceInfo && balanceInfo.balanceDue > 0) {
        body.receiptType = "balance_due";
        body.balanceInfo = balanceInfo;
      } else if (emailReceiptType === "thank_you" && balanceInfo) {
        body.receiptType = "thank_you";
        body.balanceInfo = { ...balanceInfo, balanceDue: 0 };
      }
      const res = await apiFetch("/receipts/send-email", {
        method: "POST",
        body: JSON.stringify(body),
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
      <ReceiptContent receipt={receipt} locale={locale} t={t} formatAmount={formatAmount} formatDate={formatDate} balanceInfo={balanceInfo ?? undefined} />
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
            <div className="p-4 border-b border-white/10 bg-br-carbon/50 space-y-3">
              <label className="block text-sm font-medium text-br-pearl/80">{t.sendTo}</label>
              <input
                type="email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main text-sm"
              />
              {canSendBalanceOrThankYou && (
                <div className="space-y-2">
                  <p className="text-xs text-br-pearl/70">{locale === "es" ? "Tipo de recibo a enviar:" : "Receipt type to send:"}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEmailReceiptType("payment")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${emailReceiptType === "payment" ? "bg-br-red-main text-white" : "bg-white/10 text-br-pearl"}`}
                    >
                      {t.sendNormal}
                    </button>
                    {balanceInfo && balanceInfo.balanceDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setEmailReceiptType("balance_due")}
                        className={`px-3 py-1.5 rounded-lg text-sm ${emailReceiptType === "balance_due" ? "bg-amber-600 text-white" : "bg-white/10 text-br-pearl"}`}
                      >
                        {t.sendBalanceDue}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEmailReceiptType("thank_you")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${emailReceiptType === "thank_you" ? "bg-green-600 text-white" : "bg-white/10 text-br-pearl"}`}
                    >
                      {t.sendThankYou}
                    </button>
                  </div>
                </div>
              )}
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
            <ReceiptContent receipt={receipt} locale={locale} t={t} formatAmount={formatAmount} formatDate={formatDate} balanceInfo={balanceInfo ?? undefined} />
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
  balanceInfo,
}: {
  receipt: PaymentReceipt;
  locale: "en" | "es";
  t: (typeof copy.en);
  formatAmount: (n: number, l: "en" | "es") => string;
  formatDate: (d: string, l: "en" | "es") => string;
  balanceInfo?: { totalPrice: number; totalPaid: number; balanceDue: number };
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
      {balanceInfo != null && balanceInfo.totalPrice > 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 print:bg-gray-100 print:border-gray-300">
          <p className="text-xs text-br-pearl/70 print:text-gray-500 uppercase tracking-wide mb-2">{t.totalAgreed}: {formatAmount(balanceInfo.totalPrice, locale)}</p>
          <p className="text-xs text-br-pearl/70 print:text-gray-500 uppercase tracking-wide mb-2">{t.totalPaid}: {formatAmount(balanceInfo.totalPaid, locale)}</p>
          <p className={`text-sm font-semibold ${balanceInfo.balanceDue > 0 ? "text-amber-400 print:text-amber-700" : "text-green-400 print:text-green-700"}`}>
            {t.balanceDue}: {formatAmount(balanceInfo.balanceDue, locale)}
          </p>
          {balanceInfo.balanceDue > 0 && (
            <p className="text-sm text-br-pearl mt-2 print:text-gray-700">{t.youOwe} {formatAmount(balanceInfo.balanceDue, locale)}.</p>
          )}
        </div>
      )}
      {receipt.notes && (
        <div>
          <p className="text-xs text-br-pearl/70 print:text-gray-500 uppercase tracking-wide">{t.notes}</p>
          <p className="text-br-pearl text-sm mt-1 print:text-gray-700">{receipt.notes}</p>
        </div>
      )}
      <div className="pt-8 mt-8 border-t border-white/10">
        <p className="text-xs text-br-pearl/60 print:text-gray-500 uppercase tracking-wide">{t.signature}</p>
        <div
          className="mt-2 h-12 w-[140px] select-none print:select-none inline-block"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            WebkitUserDrag: "none",
          } as CSSProperties}
          onContextMenu={(e) => e.preventDefault()}
        >
          <img
            src="/firma.png"
            alt=""
            className="h-full w-auto max-w-[140px] object-contain pointer-events-none"
            draggable={false}
            style={{ userSelect: "none", WebkitUserDrag: "none" } as CSSProperties}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
