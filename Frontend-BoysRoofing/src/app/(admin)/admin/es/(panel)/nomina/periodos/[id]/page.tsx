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

/* Iniciales días: D, L, M, M, J, V, S (getDay 0=domingo) */
const DAY_INITIALS = ["D", "L", "M", "M", "J", "V", "S"];

function getDaysInPeriod(startDate: string, endDate: string): { dateStr: string; initial: string }[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: { dateStr: string; initial: string }[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    days.push({ dateStr, initial: DAY_INITIALS[d.getDay()] });
  }
  return days;
}

function initEntryDayStates(
  entries: Entry[],
  startDate: string,
  endDate: string
): Record<string, Record<string, 0 | 1 | 2>> {
  const days = getDaysInPeriod(startDate, endDate);
  const state: Record<string, Record<string, 0 | 1 | 2>> = {};
  entries.forEach((entry) => {
    const dayState: Record<string, 0 | 1 | 2> = {};
    days.forEach((day) => {
      dayState[day.dateStr] = 0;
    });
    let full = entry.fullDays;
    let half = entry.halfDays;
    days.forEach((day) => {
      if (full > 0) {
        dayState[day.dateStr] = 1;
        full--;
      } else if (half > 0) {
        dayState[day.dateStr] = 2;
        half--;
      }
    });
    state[String(entry.id)] = dayState;
  });
  return state;
}

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

export default function NominaPeriodoDetalleES() {
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
  const [entryDayStates, setEntryDayStates] = useState<Record<string, Record<string, 0 | 1 | 2>>>({});

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    apiFetch(`/payroll/periods/${id}`)
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/es/login");
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

  useEffect(() => {
    if (period?.entries?.length && period.startDate && period.endDate) {
      setEntryDayStates(initEntryDayStates(period.entries, period.startDate, period.endDate));
    }
  }, [period]);

  function handleSaveDays(entry: Entry, fullDays: number, halfDays: number) {
    const halfDayRate = entry.dayRate / 2;
    setSavingId(entry.id);
    apiFetch(`/payroll/entries/${entry.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        fullDays,
        halfDays,
        dayRate: entry.dayRate,
        halfDayRate,
        bonuses: entry.bonuses,
        deductions: entry.deductions,
        notes: entry.notes,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error" }))
      .finally(() => setSavingId(null));
  }

  function handleDayCircleClick(entry: Entry, dateStr: string) {
    const key = String(entry.id);
    const current = entryDayStates[key]?.[dateStr] ?? 0;
    const next: 0 | 1 | 2 = current === 0 ? 1 : current === 1 ? 2 : 0;
    const newState = {
      ...entryDayStates,
      [key]: {
        ...(entryDayStates[key] || {}),
        [dateStr]: next,
      },
    };
    setEntryDayStates(newState);
    const days = getDaysInPeriod(period!.startDate, period!.endDate);
    let full = 0,
      half = 0;
    days.forEach((d) => {
      const v = newState[key]?.[d.dateStr] ?? 0;
      if (v === 1) full++;
      if (v === 2) half++;
    });
    handleSaveDays(entry, full, half);
  }

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
    updateEntry(e.id, {
      fullDays: field === "fullDays" ? Number(value) : e.fullDays,
      halfDays: field === "halfDays" ? Number(value) : e.halfDays,
      dayRate: field === "dayRate" ? Number(value) : e.dayRate,
      halfDayRate: field === "halfDayRate" ? Number(value) : field === "dayRate" ? Number(value) / 2 : halfDayRate,
      bonuses: field === "bonuses" ? Number(value) : e.bonuses,
      deductions: field === "deductions" ? Number(value) : e.deductions,
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
      setToast({ type: "error", message: "Ingresa un monto válido" });
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
        <p>Periodo no encontrado.</p>
        <Link href="/admin/es/nomina" className="mt-2 inline-block text-br-red-main hover:underline">
          Volver a Nómina
        </Link>
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const styles =
      s === "PAID" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
      s === "PARTIAL" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
      "bg-white/10 text-br-white/80 border border-white/10";
    const label = s === "UNPAID" ? "Sin pagar" : s === "PARTIAL" ? "Parcial" : "Pagado";
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{label}</span>;
  };

  const periodStatusLabel = (s: string) => (s === "DRAFT" ? "Borrador" : s === "PAID" ? "Pagado" : s === "CLOSED" ? "Cerrado" : s);

  const displayName = (entry: Entry) => entry.worker?.name || entry.workerName || "—";

  return (
    <div className="space-y-6 p-4 md:p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <ConfirmModal
        open={confirmDeleteEntryId != null}
        onClose={() => setConfirmDeleteEntryId(null)}
        title="Quitar fila"
        message="¿Quitar esta fila? El saldo del trabajador se revertirá para este periodo."
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        onConfirm={doDeleteEntry}
        loading={deletingEntryId != null}
        danger
      />
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-br-smoke/90 to-br-carbon/80 p-5 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/es/nomina" className="inline-flex items-center gap-1 text-sm text-br-pearl/80 hover:text-br-red-main transition">
              ← Volver a Nómina
            </Link>
            <h1 className="mt-2 text-2xl md:text-3xl font-bold text-br-pearl">
              {period.label || `${period.startDate} – ${period.endDate}`}
            </h1>
            <p className="mt-1 text-sm text-br-white/60">
              {new Date(period.startDate).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })} – {new Date(period.endDate).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
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
              + De plantilla
            </button>
            <button
              onClick={() => setShowAddOccasional(true)}
              className="rounded-xl border border-br-red-main/50 bg-br-red-main/10 px-4 py-2.5 text-sm font-medium text-br-red-main hover:bg-br-red-main hover:text-white transition"
            >
              + Ocasional
            </button>
          </div>
        </div>
      </div>

      {/* Resumen estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Trabajadores</p>
          <p className="mt-1 text-2xl font-bold text-br-pearl">{period.entries.length}</p>
        </div>
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Total a pagar</p>
          <p className="mt-1 text-2xl font-bold text-br-pearl">
            ${period.entries.reduce((s, e) => s + Number(e.total), 0).toFixed(2)}
          </p>
        </div>
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Total pagado</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">
            ${period.entries.reduce((s, e) => s + Number(e.amountPaid), 0).toFixed(2)}
          </p>
        </div>
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Saldo</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            ${period.entries.reduce((s, e) => s + Number(e.balanceAfter), 0).toFixed(2)}
          </p>
        </div>
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Días completos</p>
          <p className="mt-1 text-2xl font-bold text-br-pearl">
            {period.entries.reduce((s, e) => s + (e.fullDays || 0), 0)}
          </p>
        </div>
        <div className="admin-card-glow p-4 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <p className="text-xs uppercase tracking-wider text-br-white/50">Medios días</p>
          <p className="mt-1 text-2xl font-bold text-br-pearl">
            {period.entries.reduce((s, e) => s + (e.halfDays || 0), 0)}
          </p>
        </div>
      </div>

      {/* Modal: añadir trabajador de plantilla */}
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
                Añadir de plantilla
              </h2>
              <button
                type="button"
                onClick={() => setShowAddWorker(false)}
                className="rounded-lg p-2 text-br-white/60 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-4">
              {workersList.length === 0 ? (
                <p className="text-sm text-br-white/60">No hay más trabajadores de plantilla para añadir.</p>
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
          <h2 className="text-lg font-semibold text-br-pearl">Añadir trabajador ocasional</h2>
          <p className="mt-1 text-sm text-br-white/60">Para alguien que no está en plantilla y trabajó solo este periodo.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm text-br-white/70">Nombre *</label>
              <input
                type="text"
                value={occName}
                onChange={(e) => setOccName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Teléfono</label>
              <input
                type="text"
                value={occPhone}
                onChange={(e) => setOccPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Días completos</label>
              <input
                type="number"
                min="0"
                value={occFull}
                onChange={(e) => setOccFull(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Medios días</label>
              <input
                type="number"
                min="0"
                value={occHalf}
                onChange={(e) => setOccHalf(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Pago por día ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={occDayRate}
                onChange={(e) => setOccDayRate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Bonos</label>
              <input
                type="number"
                step="0.01"
                value={occBonuses}
                onChange={(e) => setOccBonuses(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Deducciones</label>
              <input
                type="number"
                step="0.01"
                value={occDeductions}
                onChange={(e) => setOccDeductions(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Notas</label>
              <input
                type="text"
                value={occNotes}
                onChange={(e) => setOccNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-br-carbon/80 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
              />
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={savingId === -1}
              className="rounded-xl bg-br-red-main px-5 py-2.5 text-sm font-medium text-white hover:bg-br-red-light disabled:opacity-60 transition"
            >
              {savingId === -1 ? "Añadiendo…" : "Añadir"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddOccasional(false)}
              className="rounded-xl border border-white/20 px-5 py-2.5 text-sm text-br-pearl hover:bg-white/5 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Trabajadores del periodo */}
      <div className="admin-card-glow overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h2 className="text-base font-semibold text-br-pearl">Trabajadores del periodo</h2>
          <p className="text-xs text-br-white/60 mt-0.5">Clic en círculos: una vez = día completo, dos = medio día, tres = borrar. Total = (completos × $/día) + (medios × $/½ día) + bonos − deducciones.</p>
        </div>

        {/* Vista móvil: tarjeta por trabajador */}
        <div className="md:hidden divide-y divide-white/5">
          {period.entries.map((entry) => {
            const days = getDaysInPeriod(period.startDate, period.endDate);
            const dayState = entryDayStates[String(entry.id)] || {};
            return (
            <div key={entry.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-br-pearl">{displayName(entry)}</p>
                <span className={entry.workerType === "OCCASIONAL" ? "text-amber-400 text-xs" : "text-br-white/60 text-xs"}>
                  {entry.workerType === "REGULAR" ? "Plantilla" : "Ocasional"}
                </span>
              </div>
              <div>
                <label className="text-br-white/60 text-xs block mb-1.5">Días (L–D)</label>
                <div className="flex flex-wrap gap-1.5">
                  {days.map((day) => {
                    const state = dayState[day.dateStr] ?? 0;
                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        disabled={savingId === entry.id}
                        onClick={() => handleDayCircleClick(entry, day.dateStr)}
                        title={`${day.dateStr}: ${state === 0 ? "vacío" : state === 1 ? "completo" : "medio"}`}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all shrink-0 ${
                          state === 0
                            ? "border-2 border-white/30 bg-br-carbon/60 text-br-white/70 hover:border-br-red-main/50"
                            : state === 1
                            ? "bg-br-red-main text-white border-2 border-br-red-main"
                            : "bg-br-red-main/50 text-white border-2 border-br-red-main/70"
                        }`}
                      >
                        {day.initial}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                  <label className="text-br-white/60 text-xs">$/día</label>
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
                    Pagado
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPartialPayId(entry.id); setPartialAmount(String(entry.amountPaid)); }}
                    className="rounded-lg border border-amber-500/40 text-amber-400 px-2 py-1 text-xs"
                  >
                    Parcial
                  </button>
                  {entry.workerType === "OCCASIONAL" && (
                    <button
                      type="button"
                      onClick={() => openDeleteEntryConfirm(entry.id)}
                      className="rounded-lg border border-red-400/40 text-red-400 px-2 py-1 text-xs"
                    >
                      Quitar
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
                  <button type="button" onClick={() => submitPartialPay(entry.id)} className="rounded-lg bg-br-red-main/20 text-br-red-main px-2 py-1 text-xs">Aplicar</button>
                  <button type="button" onClick={() => { setPartialPayId(null); setPartialAmount(""); }} className="rounded-lg border border-white/20 px-2 py-1 text-xs">Cancelar</button>
                </div>
              )}
            </div>
            );
          })}
        </div>

        {/* Vista escritorio: tabla */}
        <div className="hidden md:block overflow-x-auto -mx-4 md:mx-0 md:rounded-b-2xl">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="bg-br-carbon/80 text-br-white/90">
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider">Nombre</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider w-20">Tipo</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-center" title="Clic: 1=completo, 2=medio, 3=borrar">Días</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">$/día</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">$/½ día</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-20">Bono</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-20">Ded.</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Total</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Saldo ant.</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Pagado</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider text-right w-24">Saldo</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider w-24">Estado</th>
                <th className="px-3 py-3 font-semibold text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {period.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-white/5 hover:bg-white/5 transition">
                <td className="px-3 py-2.5 font-medium text-br-pearl">{displayName(entry)}</td>
                <td className="px-3 py-2.5">
                  <span className={entry.workerType === "OCCASIONAL" ? "text-amber-400" : ""}>
                    {entry.workerType === "REGULAR" ? "Plantilla" : "Ocasional"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {getDaysInPeriod(period.startDate, period.endDate).map((day) => {
                      const state = (entryDayStates[String(entry.id)] || {})[day.dateStr] ?? 0;
                      return (
                        <button
                          key={day.dateStr}
                          type="button"
                          disabled={savingId === entry.id}
                          onClick={() => handleDayCircleClick(entry, day.dateStr)}
                          title={`${day.dateStr}: ${state === 0 ? "vacío" : state === 1 ? "completo" : "medio"}`}
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all shrink-0 ${
                            state === 0
                              ? "border border-white/30 bg-br-carbon/60 text-br-white/70 hover:border-br-red-main/50"
                              : state === 1
                              ? "bg-br-red-main text-white border border-br-red-main"
                              : "bg-br-red-main/50 text-white border border-br-red-main/70"
                          }`}
                        >
                          {day.initial}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.dayRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.dayRate) handleSaveEntry(entry, "dayRate", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.halfDayRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.halfDayRate) handleSaveEntry(entry, "halfDayRate", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.bonuses}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.bonuses) handleSaveEntry(entry, "bonuses", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 rounded-lg border border-white/10 bg-br-carbon/60 px-1.5 py-1 text-right text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                    defaultValue={entry.deductions}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.deductions) handleSaveEntry(entry, "deductions", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2.5 text-right font-semibold text-br-pearl">${Number(entry.total).toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right text-br-white/80">${Number(entry.prevBalance).toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right text-br-white/80">${Number(entry.amountPaid).toFixed(2)}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`font-medium ${entry.balanceAfter > 0 ? "text-amber-400" : entry.balanceAfter < 0 ? "text-green-400" : "text-br-white/80"}`}>
                    ${Number(entry.balanceAfter).toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2.5">{statusBadge(entry.paymentStatus)}</td>
                <td className="px-3 py-2.5">
                  {partialPayId === entry.id ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="$"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="w-20 rounded-lg border border-white/10 bg-br-carbon/60 px-2 py-1 text-white text-sm focus:ring-2 focus:ring-br-red-main/40"
                      />
                      <button
                        type="button"
                        onClick={() => submitPartialPay(entry.id)}
                        className="rounded-lg bg-br-red-main/20 text-br-red-main px-2 py-1 text-xs font-medium hover:bg-br-red-main hover:text-white transition"
                      >
                        Aplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPartialPayId(null); setPartialAmount(""); }}
                        className="rounded-lg border border-white/20 px-2 py-1 text-xs hover:bg-white/5 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => markFullPaid(entry.id)}
                        disabled={savingId === entry.id}
                        className="rounded-lg bg-green-500/20 text-green-400 px-2.5 py-1 text-xs font-medium hover:bg-green-500/30 disabled:opacity-50 transition"
                      >
                        Marcar pagado
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPartialPayId(entry.id); setPartialAmount(String(entry.amountPaid)); }}
                        className="rounded-lg border border-amber-500/40 text-amber-400 px-2.5 py-1 text-xs font-medium hover:bg-amber-500/20 transition"
                      >
                        Parcial
                      </button>
                      {entry.workerType === "OCCASIONAL" && (
                        <button
                          type="button"
                          onClick={() => openDeleteEntryConfirm(entry.id)}
                          className="rounded-lg border border-red-400/40 text-red-400 px-2.5 py-1 text-xs font-medium hover:bg-red-500/20 transition"
                        >
                          Quitar
                        </button>
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
