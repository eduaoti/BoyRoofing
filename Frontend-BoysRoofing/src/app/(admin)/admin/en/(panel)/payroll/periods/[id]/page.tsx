"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";
import { ConfirmModal } from "@/components/ConfirmModal";

type Entry = {
  id: number;
  workerType: string;
  workerId: number | null;
  workerName: string | null;
  worker?: { name: string } | null;
  fullDays: number;
  halfDays: number;
  dayRate: number;
  halfDayRate: number;
  bonuses: number;
  deductions: number;
  notes: string | null;
  total: number;
  prevBalance: number;
  amountPaid: number;
  balanceAfter: number;
  paymentStatus: string;
};

type Period = {
  id: number;
  startDate: string;
  endDate: string;
  label: string | null;
  status: string;
  entries: Entry[];
};

function calcTotal(
  full: number,
  half: number,
  dayR: number,
  halfR: number,
  bon: number,
  ded: number
) {
  return full * dayR + half * halfR + bon - ded;
}

export default function PayrollPeriodDetailEN() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [period, setPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showAddOccasional, setShowAddOccasional] = useState(false);
  const [occName, setOccName] = useState("");
  const [occPhone, setOccPhone] = useState("");
  const [occFull, setOccFull] = useState(0);
  const [occHalf, setOccHalf] = useState(0);
  const [occDayRate, setOccDayRate] = useState("");
  const [occBonuses, setOccBonuses] = useState("");
  const [occDeductions, setOccDeductions] = useState("");
  const [occNotes, setOccNotes] = useState("");
  const [partialPayId, setPartialPayId] = useState<number | null>(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [workersList, setWorkersList] = useState<{ id: number; name: string }[]>([]);
  const [addingWorkerId, setAddingWorkerId] = useState<number | null>(null);
  const [confirmDeleteEntryId, setConfirmDeleteEntryId] = useState<number | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/payroll/periods/${id}`)
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/en/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        setPeriod(data);
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    load();
  }, [load]);

  function updateEntry(entryId: number, payload: Record<string, unknown>) {
    setSavingId(entryId);
    apiFetch(`/payroll/entries/${entryId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error" }))
      .finally(() => setSavingId(null));
  }

  function handleSaveEntry(e: Entry, field: string, value: number | string) {
    const halfDayRate = field === "dayRate" ? (Number(value) || 0) / 2 : e.halfDayRate;
    const total = calcTotal(
      field === "fullDays" ? Number(value) : e.fullDays,
      field === "halfDays" ? Number(value) : e.halfDays,
      field === "dayRate" ? Number(value) : e.dayRate,
      field === "halfDayRate" ? Number(value) : halfDayRate,
      field === "bonuses" ? Number(value) : e.bonuses,
      field === "deductions" ? Number(value) : e.deductions
    );
    updateEntry(e.id, {
      fullDays: field === "fullDays" ? value : e.fullDays,
      halfDays: field === "halfDays" ? value : e.halfDays,
      dayRate: field === "dayRate" ? value : e.dayRate,
      halfDayRate: field === "halfDayRate" ? value : field === "dayRate" ? Number(value) / 2 : halfDayRate,
      bonuses: field === "bonuses" ? value : e.bonuses,
      deductions: field === "deductions" ? value : e.deductions,
      notes: field === "notes" ? value : e.notes,
    });
  }

  function markFullPaid(entryId: number) {
    setSavingId(entryId);
    apiFetch(`/payroll/entries/${entryId}/mark-full-paid`, { method: "POST" })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error" }))
      .finally(() => setSavingId(null));
  }

  function submitPartialPay(entryId: number) {
    const amt = Number(partialAmount);
    if (isNaN(amt) || amt < 0) {
      setToast({ type: "error", message: "Enter a valid amount" });
      return;
    }
    setSavingId(entryId);
    apiFetch(`/payroll/entries/${entryId}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({ amountPaid: amt }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setPartialPayId(null);
        setPartialAmount("");
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error" }))
      .finally(() => setSavingId(null));
  }

  function addOccasional(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(occDayRate) || 0;
    setSavingId(-1);
    apiFetch("/payroll/entries/occasional", {
      method: "POST",
      body: JSON.stringify({
        payrollPeriodId: id,
        workerName: occName.trim(),
        phone: occPhone.trim() || undefined,
        fullDays: occFull,
        halfDays: occHalf,
        dayRate: rate,
        halfDayRate: rate / 2,
        bonuses: Number(occBonuses) || 0,
        deductions: Number(occDeductions) || 0,
        notes: occNotes.trim() || undefined,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setShowAddOccasional(false);
        setOccName("");
        setOccPhone("");
        setOccFull(0);
        setOccHalf(0);
        setOccDayRate("");
        setOccBonuses("");
        setOccDeductions("");
        setOccNotes("");
        load();
      })
      .catch((err) => setToast({ type: "error", message: err?.message || "Error" }))
      .finally(() => setSavingId(null));
  }

  function openDeleteEntryConfirm(entryId: number) {
    setConfirmDeleteEntryId(entryId);
  }

  async function doDeleteEntry() {
    if (confirmDeleteEntryId == null) return;
    setDeletingEntryId(confirmDeleteEntryId);
    try {
      const r = await apiFetch(`/payroll/entries/${confirmDeleteEntryId}`, { method: "DELETE" });
      if (r.ok) {
        setConfirmDeleteEntryId(null);
        load();
      } else {
        const text = await r.text();
        setToast({ type: "error", message: text || "Error" });
      }
    } catch (err) {
      setToast({ type: "error", message: (err as Error)?.message || "Error" });
    } finally {
      setDeletingEntryId(null);
    }
  }

  function openAddWorkerModal() {
    setShowAddWorker(true);
    apiFetch("/workers")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { id: number; name: string; isActive?: boolean }[]) => {
        const inPeriod = new Set((period?.entries ?? []).map((e) => e.workerId).filter(Boolean));
        setWorkersList(
          (Array.isArray(data) ? data : [])
            .filter((w) => w.isActive !== false && !inPeriod.has(w.id))
            .map((w) => ({ id: w.id, name: w.name })),
        );
      })
      .catch(() => setWorkersList([]));
  }

  function addWorkerToPeriod(workerId: number) {
    setAddingWorkerId(workerId);
    apiFetch(`/payroll/periods/${id}/add-worker`, {
      method: "POST",
      body: JSON.stringify({ workerId }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setShowAddWorker(false);
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error" }))
      .finally(() => setAddingWorkerId(null));
  }

  if (loading && !period) {
    return (
      <div className="p-6">
        <div className="h-8 w-64 rounded bg-br-smoke/60 animate-pulse" />
        <div className="mt-4 h-96 rounded bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  if (!period) {
    return (
      <div className="p-6 text-white">
        <p>Period not found.</p>
        <Link href="/admin/en/payroll" className="mt-2 inline-block text-br-red-main hover:underline">
          Back to Payroll
        </Link>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const styles =
      s === "PAID" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
      s === "PARTIAL" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
      "bg-white/10 text-br-white/80 border border-white/10";
    const label = s === "UNPAID" ? "Unpaid" : s === "PARTIAL" ? "Partial" : "Paid";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
  };

  const periodStatusLabel = (s: string) => (s === "DRAFT" ? "Draft" : s === "PAID" ? "Paid" : s === "CLOSED" ? "Closed" : s);

  const displayName = (entry: Entry) => entry.worker?.name || entry.workerName || "—";

  return (
    <div className="space-y-6 p-4 md:p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <ConfirmModal
        open={confirmDeleteEntryId != null}
        onClose={() => setConfirmDeleteEntryId(null)}
        title="Remove row"
        message="Remove this row? Worker balance will be reverted for this period."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={doDeleteEntry}
        loading={deletingEntryId != null}
        danger
      />
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-br-smoke/90 to-br-carbon/80 p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/en/payroll" className="inline-flex items-center gap-1 text-sm text-br-pearl/80 hover:text-br-red-main transition">
              ← Back to Payroll
            </Link>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-br-pearl">
              {period.label || `${period.startDate} – ${period.endDate}`}
            </h1>
            <p className="mt-1 text-sm text-br-white/60">
              {new Date(period.startDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} – {new Date(period.endDate).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </p>
            <span className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-semibold ${period.status === "DRAFT" ? "bg-amber-500/20 text-amber-400" : period.status === "PAID" ? "bg-green-500/20 text-green-400" : "bg-br-smoke text-br-pearl/80"}`}>
              {periodStatusLabel(period.status)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openAddWorkerModal}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-br-pearl hover:bg-white/10 transition"
            >
              + From crew
            </button>
            <button
              onClick={() => setShowAddOccasional(true)}
              className="rounded-xl border border-br-red-main/50 bg-br-red-main/10 px-4 py-2.5 text-sm font-medium text-br-red-main hover:bg-br-red-main hover:text-white transition"
            >
              + Occasional
            </button>
          </div>
        </div>
      </div>

      {/* Modal: add worker from crew */}
      {showAddWorker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAddWorker(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-add-worker-title"
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-br-carbon shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 id="modal-add-worker-title" className="text-lg font-semibold text-br-pearl">
                Add from crew
              </h2>
              <button
                type="button"
                onClick={() => setShowAddWorker(false)}
                className="rounded-lg p-2 text-br-white/60 hover:bg-white/10 hover:text-white transition"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-4">
              {workersList.length === 0 ? (
                <p className="text-sm text-br-white/60">No more crew workers to add.</p>
              ) : (
                <ul className="space-y-1">
                  {workersList.map((w) => (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() => addWorkerToPeriod(w.id)}
                        disabled={addingWorkerId === w.id}
                        className="w-full rounded-lg border border-white/10 bg-br-smoke/40 px-4 py-2.5 text-left text-sm font-medium text-br-pearl hover:bg-white/10 disabled:opacity-50 transition"
                      >
                        {w.name}
                        {addingWorkerId === w.id ? " …" : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddOccasional && (
        <form
          onSubmit={addOccasional}
          className="rounded-2xl border border-white/10 bg-br-smoke/60 p-6 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-br-pearl">Add occasional worker</h2>
          <p className="mt-1 text-sm text-br-white/60">For someone not on the regular crew who worked this period only.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm text-br-white/70">Name *</label>
              <input type="text" value={occName} onChange={(e) => setOccName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" required />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Phone</label>
              <input type="text" value={occPhone} onChange={(e) => setOccPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Full days</label>
              <input type="number" min="0" value={occFull} onChange={(e) => setOccFull(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Half days</label>
              <input type="number" min="0" value={occHalf} onChange={(e) => setOccHalf(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Day rate ($)</label>
              <input type="number" step="0.01" min="0" value={occDayRate} onChange={(e) => setOccDayRate(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Bonuses</label>
              <input type="number" step="0.01" value={occBonuses} onChange={(e) => setOccBonuses(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Deductions</label>
              <input type="number" step="0.01" value={occDeductions} onChange={(e) => setOccDeductions(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Notes</label>
              <input type="text" value={occNotes} onChange={(e) => setOccNotes(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50" />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={savingId === -1} className="rounded-xl bg-br-red-main px-5 py-2.5 text-sm font-medium text-white hover:bg-br-red-light disabled:opacity-60 transition">
              {savingId === -1 ? "Adding…" : "Add"}
            </button>
            <button type="button" onClick={() => setShowAddOccasional(false)} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-br-pearl hover:bg-white/5 transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Workers in this period */}
      <div className="rounded-2xl border border-white/10 bg-br-smoke/40 overflow-hidden shadow-xl">
        <div className="px-4 py-3 border-b border-white/10 bg-br-carbon/60">
          <h2 className="text-base font-semibold text-br-pearl">Workers in this period</h2>
          <p className="text-xs text-br-white/60 mt-0.5">Edit days and rates. Total = (full days × $/day) + (half days × $/½ day) + bonuses − deductions.</p>
        </div>

        {/* Mobile: card per worker */}
        <div className="md:hidden divide-y divide-white/5">
          {period.entries.map((entry) => (
            <div key={entry.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-br-pearl">{displayName(entry)}</p>
                <span className={entry.workerType === "OCCASIONAL" ? "text-amber-400 text-xs" : "text-br-white/60 text-xs"}>
                  {entry.workerType === "REGULAR" ? "Crew" : "Occasional"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <label className="text-br-white/60 text-xs">Full</label>
                  <input
                    key={`m-${entry.id}-fd-${entry.fullDays}`}
                    type="number"
                    min="0"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1.5 text-center text-white focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.fullDays}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0 && v !== entry.fullDays) handleSaveEntry(entry, "fullDays", v);
                    }}
                  />
                </div>
                <div>
                  <label className="text-br-white/60 text-xs">Half</label>
                  <input
                    key={`m-${entry.id}-hd-${entry.halfDays}`}
                    type="number"
                    min="0"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1.5 text-center text-white focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.halfDays}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v >= 0 && v !== entry.halfDays) handleSaveEntry(entry, "halfDays", v);
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-br-white/60 text-xs">$/day</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-0.5 w-full rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1.5 text-right text-white focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.dayRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.dayRate) handleSaveEntry(entry, "dayRate", v);
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-br-white/60">Total</span>
                <span className="font-semibold text-br-pearl">${Number(entry.total).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{statusBadge(entry.paymentStatus)}</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => markFullPaid(entry.id)}
                    disabled={savingId === entry.id}
                    className="rounded-lg bg-green-500/20 text-green-400 px-2 py-1 text-xs font-medium"
                  >
                    Mark paid
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPartialPayId(entry.id); setPartialAmount(String(entry.amountPaid)); }}
                    className="rounded-lg border border-amber-500/40 text-amber-400 px-2 py-1 text-xs"
                  >
                    Partial
                  </button>
                  {entry.workerType === "OCCASIONAL" && (
                    <button
                      type="button"
                      onClick={() => openDeleteEntryConfirm(entry.id)}
                      className="rounded-lg border border-red-400/40 text-red-400 px-2 py-1 text-xs"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {partialPayId === entry.id && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="$"
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                    className="w-24 rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1 text-white text-sm"
                  />
                  <button type="button" onClick={() => submitPartialPay(entry.id)} className="rounded-lg bg-br-red-main/20 text-br-red-main px-2 py-1 text-xs">Apply</button>
                  <button type="button" onClick={() => { setPartialPayId(null); setPartialAmount(""); }} className="rounded-lg border border-white/20 px-2 py-1 text-xs">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0 md:rounded-b-2xl">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="bg-br-carbon/80 text-br-white/90">
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider">Name</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider w-20">Type</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-center w-20" title="Full days">Full</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-center w-20" title="Half days">Half</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">$/day</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">$/½ day</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-20">Bonus</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-20">Ded.</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Total</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Prev bal</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Paid</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Balance</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider w-24">Status</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {period.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-white/5 hover:bg-white/5 transition">
                  <td className="px-3 py-2.5 font-medium text-br-pearl">{displayName(entry)}</td>
                  <td className="px-3 py-2.5">
                    <span className={entry.workerType === "OCCASIONAL" ? "text-amber-400" : "text-br-white/80"}>{entry.workerType === "REGULAR" ? "Crew" : "Occasional"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input
                      key={`${entry.id}-fd-${entry.fullDays}`}
                      type="number"
                      min="0"
                      className="w-14 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-center text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                      defaultValue={entry.fullDays}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v) && v >= 0 && v !== entry.fullDays) handleSaveEntry(entry, "fullDays", v);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <input
                      key={`${entry.id}-hd-${entry.halfDays}`}
                      type="number"
                      min="0"
                      className="w-14 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-center text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                      defaultValue={entry.halfDays}
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!isNaN(v) && v >= 0 && v !== entry.halfDays) handleSaveEntry(entry, "halfDays", v);
                      }}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input type="number" step="0.01" className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40" defaultValue={entry.dayRate} onBlur={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v !== entry.dayRate) handleSaveEntry(entry, "dayRate", v); }} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input type="number" step="0.01" className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40" defaultValue={entry.halfDayRate} onBlur={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v !== entry.halfDayRate) handleSaveEntry(entry, "halfDayRate", v); }} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input type="number" step="0.01" className="w-16 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40" defaultValue={entry.bonuses} onBlur={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v !== entry.bonuses) handleSaveEntry(entry, "bonuses", v); }} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <input type="number" step="0.01" className="w-16 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40" defaultValue={entry.deductions} onBlur={(e) => { const v = Number(e.target.value); if (!isNaN(v) && v !== entry.deductions) handleSaveEntry(entry, "deductions", v); }} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-br-pearl">${Number(entry.total).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right text-br-white/80">${Number(entry.prevBalance).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right text-br-white/80">${Number(entry.amountPaid).toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-medium ${entry.balanceAfter > 0 ? "text-amber-400" : entry.balanceAfter < 0 ? "text-green-400" : "text-br-white/80"}`}>${Number(entry.balanceAfter).toFixed(2)}</span>
                  </td>
                  <td className="px-3 py-2.5">{statusBadge(entry.paymentStatus)}</td>
                  <td className="px-3 py-2.5">
                    {partialPayId === entry.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input type="number" step="0.01" placeholder="$" value={partialAmount} onChange={(e) => setPartialAmount(e.target.value)} className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1 text-white text-sm focus:ring-2 focus:ring-br-red-main/40" />
                        <button type="button" onClick={() => submitPartialPay(entry.id)} className="rounded-lg bg-br-red-main/20 text-br-red-main px-2 py-1 text-xs font-medium hover:bg-br-red-main hover:text-white transition">Apply</button>
                        <button type="button" onClick={() => { setPartialPayId(null); setPartialAmount(""); }} className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/5 transition">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" onClick={() => markFullPaid(entry.id)} disabled={savingId === entry.id} className="rounded-lg bg-green-500/20 text-green-400 px-2.5 py-1 text-xs font-medium hover:bg-green-500/30 disabled:opacity-50 transition">Mark paid</button>
                        <button type="button" onClick={() => { setPartialPayId(entry.id); setPartialAmount(String(entry.amountPaid)); }} className="rounded-lg border border-amber-500/40 text-amber-400 px-2.5 py-1 text-xs font-medium hover:bg-amber-500/20 transition">Partial</button>
                        {entry.workerType === "OCCASIONAL" && (
                          <button type="button" onClick={() => openDeleteEntryConfirm(entry.id)} className="rounded-lg border border-red-400/40 text-red-400 px-2.5 py-1 text-xs font-medium hover:bg-red-500/20 transition">Remove</button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
