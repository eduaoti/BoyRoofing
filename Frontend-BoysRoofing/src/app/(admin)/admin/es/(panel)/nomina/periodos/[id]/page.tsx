"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

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
      .catch((e) => alert(e.message))
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
      .catch((e) => alert(e.message))
      .finally(() => setSavingId(null));
  }

  function submitPartialPay(entryId: number) {
    const amt = Number(partialAmount);
    if (isNaN(amt) || amt < 0) {
      alert("Ingresa un monto válido");
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
      .catch((e) => alert(e.message))
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
      .catch((err) => alert(err.message))
      .finally(() => setSavingId(null));
  }

  function deleteEntry(entryId: number) {
    if (!confirm("¿Quitar esta fila? El saldo del trabajador se revertirá para este periodo.")) return;
    apiFetch(`/payroll/entries/${entryId}`, { method: "DELETE" })
      .then((r) => r.ok && load())
      .catch((err) => alert(err.message));
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
    const c =
      s === "PAID" ? "bg-green-900/50 text-green-300" :
      s === "PARTIAL" ? "bg-amber-900/50 text-amber-300" :
      "bg-br-smoke text-br-white/70";
    const label = s === "UNPAID" ? "Sin pagar" : s === "PARTIAL" ? "Parcial" : "Pagado";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{label}</span>;
  };

  const periodStatusLabel = (s: string) => (s === "DRAFT" ? "Borrador" : s === "PAID" ? "Pagado" : s === "CLOSED" ? "Cerrado" : s);

  const displayName = (entry: Entry) => entry.worker?.name || entry.workerName || "—";

  return (
    <div className="space-y-6 p-6 text-white">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/es/nomina" className="text-sm text-br-white/60 hover:underline">
            ← Nómina
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {period.label || `${period.startDate} – ${period.endDate}`}
          </h1>
          <p className="text-sm text-br-white/60">
            {new Date(period.startDate).toLocaleDateString()} – {new Date(period.endDate).toLocaleDateString()}
            {" · "}
            <span className="inline-flex rounded-full bg-br-smoke/80 px-2 py-0.5 text-xs font-medium">{periodStatusLabel(period.status)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddOccasional(true)}
          className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
        >
          Añadir ocasional
        </button>
      </header>

      {showAddOccasional && (
        <form
          onSubmit={addOccasional}
          className="rounded-xl border border-br-smoke-light bg-br-smoke/40 p-6"
        >
          <h2 className="text-lg font-semibold">Añadir trabajador ocasional</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm text-br-white/70">Nombre *</label>
              <input
                type="text"
                value={occName}
                onChange={(e) => setOccName(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Teléfono</label>
              <input
                type="text"
                value={occPhone}
                onChange={(e) => setOccPhone(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Días completos</label>
              <input
                type="number"
                min="0"
                value={occFull}
                onChange={(e) => setOccFull(Number(e.target.value))}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Medios días</label>
              <input
                type="number"
                min="0"
                value={occHalf}
                onChange={(e) => setOccHalf(Number(e.target.value))}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
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
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Bonos</label>
              <input
                type="number"
                step="0.01"
                value={occBonuses}
                onChange={(e) => setOccBonuses(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Deducciones</label>
              <input
                type="number"
                step="0.01"
                value={occDeductions}
                onChange={(e) => setOccDeductions(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Notas</label>
              <input
                type="text"
                value={occNotes}
                onChange={(e) => setOccNotes(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={savingId === -1}
              className="rounded-lg bg-br-red-main px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {savingId === -1 ? "Añadiendo…" : "Añadir"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddOccasional(false)}
              className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-br-smoke-light">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-br-smoke/80">
            <tr>
              <th className="px-3 py-2 font-semibold">Nombre</th>
              <th className="px-3 py-2 font-semibold">Tipo</th>
              <th className="px-3 py-2 font-semibold text-center w-20">Compl.</th>
              <th className="px-3 py-2 font-semibold text-center w-20">½</th>
              <th className="px-3 py-2 font-semibold text-right w-24">Día $</th>
              <th className="px-3 py-2 font-semibold text-right w-24">½ $</th>
              <th className="px-3 py-2 font-semibold text-right w-20">Bono</th>
              <th className="px-3 py-2 font-semibold text-right w-20">Ded.</th>
              <th className="px-3 py-2 font-semibold text-right w-24">Total</th>
              <th className="px-3 py-2 font-semibold text-right w-20">Saldo ant.</th>
              <th className="px-3 py-2 font-semibold text-right w-24">Pagado $</th>
              <th className="px-3 py-2 font-semibold text-right w-24">Saldo</th>
              <th className="px-3 py-2 font-semibold w-20">Estado</th>
              <th className="px-3 py-2 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {period.entries.map((entry) => (
              <tr key={entry.id} className="border-t border-br-smoke-light">
                <td className="px-3 py-2 font-medium">{displayName(entry)}</td>
                <td className="px-3 py-2">
                  <span className={entry.workerType === "OCCASIONAL" ? "text-amber-400" : ""}>
                    {entry.workerType === "REGULAR" ? "Plantilla" : "Ocasional"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-14 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-center text-white"
                    value={entry.fullDays}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.fullDays) handleSaveEntry(entry, "fullDays", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    className="w-14 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-center text-white"
                    value={entry.halfDays}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.halfDays) handleSaveEntry(entry, "halfDays", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-20 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-right text-white"
                    defaultValue={entry.dayRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.dayRate) handleSaveEntry(entry, "dayRate", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-20 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-right text-white"
                    defaultValue={entry.halfDayRate}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.halfDayRate) handleSaveEntry(entry, "halfDayRate", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-right text-white"
                    defaultValue={entry.bonuses}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.bonuses) handleSaveEntry(entry, "bonuses", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    step="0.01"
                    className="w-16 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-right text-white"
                    defaultValue={entry.deductions}
                    onBlur={(e) => {
                      const v = Number(e.target.value);
                      if (!isNaN(v) && v !== entry.deductions) handleSaveEntry(entry, "deductions", v);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right font-medium">${Number(entry.total).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">${Number(entry.prevBalance).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">${Number(entry.amountPaid).toFixed(2)}</td>
                <td className="px-3 py-2 text-right">
                  <span className={entry.balanceAfter > 0 ? "text-amber-400" : entry.balanceAfter < 0 ? "text-green-400" : ""}>
                    ${Number(entry.balanceAfter).toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2">{statusBadge(entry.paymentStatus)}</td>
                <td className="px-3 py-2">
                  {partialPayId === entry.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Monto"
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                        className="w-20 rounded border border-br-smoke-light bg-br-carbon px-1 py-0.5 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => submitPartialPay(entry.id)}
                        className="text-xs text-br-red-main hover:underline"
                      >
                        Ok
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPartialPayId(null); setPartialAmount(""); }}
                        className="text-xs hover:underline"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => markFullPaid(entry.id)}
                        disabled={savingId === entry.id}
                        className="text-xs text-br-red-main hover:underline disabled:opacity-50"
                      >
                        Marcar pagado
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPartialPayId(entry.id); setPartialAmount(String(entry.amountPaid)); }}
                        className="text-xs text-br-red-main hover:underline"
                      >
                        Parcial
                      </button>
                      {entry.workerType === "OCCASIONAL" && (
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-xs text-red-400 hover:underline"
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
  );
}
