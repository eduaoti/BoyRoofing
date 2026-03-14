"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAllReceipts,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getNextReceiptNumber,
  getJobBalance,
  type PaymentReceipt,
} from "@/lib/receipts";
import { ReceiptPrintView } from "@/components/ReceiptPrintView";
import { DocumentCheckIcon, PlusIcon, PencilSquareIcon, PrinterIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CONCEPT_SUGGESTIONS = [
  "Materials advance",
  "Materials - partial payment",
  "Labor - deposit",
  "Roof repair - partial",
  "Full payment - job completion",
  "Other",
];
const OTHER_CONCEPT = "Other";

export default function ReceiptsENPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nextNumber, setNextNumber] = useState("REC-0001");
  const [editingReceipt, setEditingReceipt] = useState<PaymentReceipt | null>(null);
  const [viewing, setViewing] = useState<PaymentReceipt | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState(CONCEPT_SUGGESTIONS[0]);
  const [customConcept, setCustomConcept] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const list = await getAllReceipts();
      setReceipts(list);
    } catch (e: unknown) {
      if ((e as Error & { status?: number })?.status === 401) {
        localStorage.removeItem("br_admin_token");
        router.push("/admin/en/login");
        return;
      }
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (showForm && !editingReceipt) {
      getNextReceiptNumber().then(setNextNumber).catch(() => setNextNumber("REC-0001"));
    }
  }, [showForm, editingReceipt]);

  function openEditForm(r: PaymentReceipt) {
    setEditingReceipt(r);
    setClientName(r.clientName);
    setClientEmail(r.clientEmail ?? "");
    setAmount(String(r.amount));
    const isSuggestion = CONCEPT_SUGGESTIONS.includes(r.concept);
    setConcept(isSuggestion ? r.concept : OTHER_CONCEPT);
    setCustomConcept(isSuggestion ? "" : r.concept);
    setDate(r.date.slice(0, 10));
    setNotes(r.notes ?? "");
    setTotalPrice(r.totalPrice != null ? String(r.totalPrice) : "");
    setJobReference(r.jobReference ?? "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingReceipt(null);
    setClientName("");
    setClientEmail("");
    setAmount("");
    setConcept(CONCEPT_SUGGESTIONS[0]);
    setCustomConcept("");
    setDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setTotalPrice("");
    setJobReference("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = parseFloat(amount.replace(/,/g, "."));
    const totalNum = totalPrice.trim() ? parseFloat(totalPrice.replace(/,/g, ".")) : undefined;
    const conceptText = concept === OTHER_CONCEPT ? customConcept.trim() : concept.trim();
    if (!clientName.trim() || Number.isNaN(num) || num <= 0 || !conceptText) return;
    setSaving(true);
    try {
      const payload = {
        date,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        amount: num,
        concept: conceptText,
        notes: notes.trim() || undefined,
        totalPrice: totalNum != null && !Number.isNaN(totalNum) && totalNum > 0 ? totalNum : undefined,
        jobReference: jobReference.trim() || undefined,
      };
      if (editingReceipt) {
        await updateReceipt(editingReceipt.id, payload);
      } else {
        await createReceipt(payload);
      }
      await load();
      closeForm();
    } catch (err: unknown) {
      if ((err as Error & { status?: number })?.status === 401) {
        localStorage.removeItem("br_admin_token");
        router.push("/admin/en/login");
        return;
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this receipt? This cannot be undone.")) return;
    const ok = await deleteReceipt(id);
    if (ok) {
      await load();
      if (viewing?.id === id) setViewing(null);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-extrabold admin-page-title tracking-tight">Payment receipts</h1>
        <button
          type="button"
          onClick={() => { setEditingReceipt(null); setClientName(""); setClientEmail(""); setAmount(""); setConcept(CONCEPT_SUGGESTIONS[0]); setCustomConcept(""); setDate(new Date().toISOString().slice(0, 10)); setNotes(""); setTotalPrice(""); setJobReference(""); setShowForm(true); }}
          className="admin-btn-primary text-white inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          <PlusIcon className="h-5 w-5" />
          New receipt
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-modal-fade"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
        >
          <div className="admin-card-glow w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col animate-modal-zoom">
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
              <h2 id="receipt-modal-title" className="text-lg font-semibold text-br-red-main">
                {editingReceipt ? `Edit receipt · ${editingReceipt.receiptNumber}` : `Create receipt · Next: ${nextNumber}`}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="p-2 rounded-lg text-br-pearl hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto overflow-x-hidden min-w-0 flex-1">
          <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
            <div>
              <label className="block text-sm font-medium text-br-pearl/80 mb-1">Client name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-br-pearl/80 mb-1">Client email (optional, for sending receipt)</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                placeholder="client@example.com"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-br-pearl/80 mb-1">Amount (USD)</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full min-w-0 rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                  placeholder="5000"
                  required
                />
              </div>
              <div className="min-w-0 receipt-date-wrap">
                <label className="block text-sm font-medium text-br-pearl/80 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full min-w-0 max-w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white focus:border-br-red-main focus:ring-1 focus:ring-br-red-main [&::-webkit-date-and-time-value]:text-left"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-br-pearl/80 mb-1">Concept</label>
              <select
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
              >
                {CONCEPT_SUGGESTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {concept === OTHER_CONCEPT && (
              <div>
                <label className="block text-sm font-medium text-br-pearl/80 mb-1">Specify concept</label>
                <input
                  type="text"
                  value={customConcept}
                  onChange={(e) => setCustomConcept(e.target.value)}
                  className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                  placeholder="e.g. Extra materials for porch"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-br-pearl/80 mb-1">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main resize-none"
                placeholder="e.g. Check #1234"
              />
            </div>
            <div className="border-t border-white/10 pt-4 space-y-3">
              <p className="text-sm font-medium text-br-pearl/80">Balance / job total (optional)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-br-pearl/60 mb-1">Total job price (USD)</label>
                  <input
                    type="text"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                    placeholder="e.g. 14900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-br-pearl/60 mb-1">Job reference (to group receipts)</label>
                  <input
                    type="text"
                    value={jobReference}
                    onChange={(e) => setJobReference(e.target.value)}
                    className="w-full rounded-xl bg-br-carbon/80 border border-white/10 px-4 py-2.5 text-white placeholder-br-pearl/40 focus:border-br-red-main focus:ring-1 focus:ring-br-red-main"
                    placeholder="e.g. Smith roof 2026"
                  />
                </div>
              </div>
              <p className="text-xs text-br-pearl/50">Set total price and same job reference on related receipts to see balance due and send balance/thank-you receipts.</p>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="admin-btn-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
                {editingReceipt ? "Save changes" : "Save receipt"}
              </button>
              <button type="button" onClick={closeForm} className="admin-btn-secondary px-4 py-2.5 rounded-xl text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card-glow overflow-hidden animate-fade-up" style={{ animationDelay: "50ms" }}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent receipts</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-br-pearl/70">Loading receipts…</div>
        ) : receipts.length === 0 ? (
          <div className="p-8 text-center text-br-pearl/70">
            <DocumentCheckIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No receipts yet. Create one to give to your client (e.g. for materials or advance payment).</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {receipts.map((r, i) => {
              const jobRef = r.jobReference;
              const balance = jobRef ? getJobBalance(receipts, jobRef) : null;
              return (
              <li
                key={r.id}
                className="admin-list-item flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition"
                style={{ animationDelay: `${60 + i * 40}ms` }}
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-br-red-main">{r.receiptNumber}</p>
                  <p className="font-medium text-white truncate">{r.clientName}</p>
                  <p className="text-sm text-br-pearl/80">{r.concept} · {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.amount)}</p>
                  {balance != null && balance.totalPrice > 0 && (
                    <p className="text-xs text-br-pearl/70 mt-1">
                      Total: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance.totalPrice)} · Paid: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance.totalPaid)} · <span className={balance.balanceDue > 0 ? "text-amber-400" : "text-green-400"}>Balance: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(balance.balanceDue)}</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditForm(r)}
                    className="inline-flex items-center gap-1.5 admin-btn-secondary px-3 py-2 rounded-lg text-sm"
                    title="Edit receipt"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewing(r)}
                    className="inline-flex items-center gap-1.5 admin-btn-secondary px-3 py-2 rounded-lg text-sm"
                  >
                    <PrinterIcon className="h-4 w-4" />
                    View / Print
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg text-br-pearl/70 hover:text-red-400 hover:bg-red-400/10 transition"
                    title="Delete receipt"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ); })}
          </ul>
        )}
      </div>

      {viewing && (
        <ReceiptPrintView
          receipt={viewing}
          allReceipts={receipts}
          onClose={() => setViewing(null)}
          locale="en"
        />
      )}
    </div>
  );
}
