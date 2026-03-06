"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";

type Period = {
  id: number;
  startDate: string;
  endDate: string;
  label: string | null;
  status: string;
  totalPaid: number | null;
  entries?: { total: number; amountPaid: number }[];
};

function DateRangeCalendarES({
  startDate,
  endDate,
  pendingStart,
  onDayClick,
}: {
  startDate: string;
  endDate: string;
  pendingStart: string | null;
  onDayClick: (dayStr: string) => void;
}) {
  const base = startDate ? new Date(startDate + "T12:00:00") : new Date();
  const year = base.getFullYear();
  const month = base.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const offset = first.getDay();
  const daysInMonth = last.getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dateStr);
  }
  const weekDays = ["D", "L", "M", "M", "J", "V", "S"];
  const isInRange = (d: string | null) => {
    if (!d || !startDate || !endDate) return false;
    return d >= startDate && d <= endDate;
  };
  const isSelected = (d: string | null) => d === startDate || d === endDate || d === pendingStart;

  return (
    <div className="min-w-[280px]">
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {weekDays.map((w) => (
          <div key={w} className="py-1 font-medium text-br-white/50">
            {w}
          </div>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={d}
              type="button"
              onClick={() => onDayClick(d)}
              className={`h-8 rounded text-sm transition ${
                isSelected(d)
                  ? "bg-br-red-main text-white"
                  : isInRange(d)
                  ? "bg-br-red-main/30 text-white"
                  : "text-br-pearl hover:bg-white/10"
              }`}
            >
              {new Date(d + "T12:00:00").getDate()}
            </button>
          ) : (
            <div key={`e-${i}`} />
          )
        )}
      </div>
    </div>
  );
}

export default function NominaES() {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deletePeriodId, setDeletePeriodId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const rangeRef = useRef<HTMLDivElement>(null);

  function load() {
    setLoading(true);
    apiFetch("/payroll/periods")
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/es/login");
          return [];
        }
        return r.json();
      })
      .then((data) => {
        setPeriods(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!rangeOpen) return;
    function onDocClick(e: MouseEvent) {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [rangeOpen]);

  function createPeriod(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    apiFetch("/payroll/periods", {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        label: label.trim() || undefined,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        return r.json();
      })
      .then((period) => {
        setShowNew(false);
        router.push(`/admin/es/nomina/periodos/${period.id}`);
      })
      .catch((err) => setToast({ type: "error", message: err?.message || "Error al crear el periodo" }))
      .finally(() => setSaving(false));
  }

  function formatRangeLabel(s: string, e: string) {
    if (!s || !e) return "Elige fecha de inicio y fin";
    const start = new Date(s + "T12:00:00");
    const end = new Date(e + "T12:00:00");
    return start.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" }) + " – " + end.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "numeric" });
  }

  function handleRangeDayClick(dayStr: string) {
    if (!pendingStart) {
      setStartDate(dayStr);
      setEndDate(dayStr);
      setPendingStart(dayStr);
    } else {
      const a = pendingStart;
      const b = dayStr;
      if (a <= b) {
        setStartDate(a);
        setEndDate(b);
      } else {
        setStartDate(b);
        setEndDate(a);
      }
      setPendingStart(null);
      setRangeOpen(false);
    }
  }

  function confirmDeletePeriod() {
    if (deletePeriodId == null) return;
    setDeleting(true);
    apiFetch(`/payroll/periods/${deletePeriodId}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setDeletePeriodId(null);
        load();
        setToast({ type: "success", message: "Periodo eliminado." });
      })
      .catch((err) => setToast({ type: "error", message: err?.message || "Error al eliminar el periodo" }))
      .finally(() => setDeleting(false));
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-8 w-48 rounded bg-br-smoke/60 animate-pulse" />
        <div className="mt-4 h-64 rounded bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  const statusBadge = (s: string) => {
    const c =
      s === "PAID" ? "bg-green-900/50 text-green-300" :
      s === "CLOSED" ? "bg-br-smoke text-br-white/80" :
      "bg-amber-900/50 text-amber-300";
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{s === "DRAFT" ? "Borrador" : s}</span>;
  };

  return (
    <div className="space-y-8 p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold admin-page-title tracking-tight">Nómina</h1>
          <p className="mt-2 text-sm text-br-white/60">
            Crea y gestiona periodos. Cada periodo incluye a los trabajadores activos.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/es/nomina/balances"
            className="admin-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Balances
          </Link>
          <button
            onClick={() => setShowNew(true)}
            className="admin-btn-primary rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            Nuevo periodo
          </button>
        </div>
      </header>

      {/* Modal: Nuevo periodo */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-fade" onClick={() => !saving && setShowNew(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-br-smoke/95 backdrop-blur-xl shadow-2xl animate-modal-zoom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={createPeriod} className="p-6">
              <h2 className="text-lg font-semibold text-br-pearl">Nuevo periodo de nómina</h2>
              <p className="mt-1 text-sm text-br-white/60">
                Se creará una fila por cada trabajador activo. Puedes editar días e importes en el detalle.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="relative sm:col-span-2" ref={rangeRef}>
                  <label className="block text-sm text-br-white/70">Rango de fechas</label>
                  <button
                    type="button"
                    onClick={() => { setRangeOpen((o) => !o); setPendingStart(null); }}
                    className="mt-1 flex w-full items-center justify-between rounded border border-br-smoke-light bg-br-carbon px-3 py-2.5 text-left text-sm text-white"
                  >
                    <span className={startDate && endDate ? "" : "text-br-white/50"}>{formatRangeLabel(startDate, endDate)}</span>
                    <CalendarDaysIcon className="h-5 w-5 shrink-0 text-br-pearl/80" />
                  </button>
                  {rangeOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-white/10 bg-br-carbon p-3 shadow-xl">
                      <p className="mb-2 text-xs text-br-white/60">Clic en fecha de inicio, luego en fecha de fin (mismo calendario)</p>
                      <DateRangeCalendarES
                        startDate={startDate}
                        endDate={endDate}
                        pendingStart={pendingStart}
                        onDayClick={handleRangeDayClick}
                      />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-br-white/70">Etiqueta (opcional)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="ej. Semana 2 mar"
                    className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !startDate || !endDate}
                  className="admin-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {saving ? "Creando…" : "Crear periodo"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  disabled={saving}
                  className="admin-btn-secondary rounded-xl px-4 py-2.5 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Eliminar periodo */}
      {deletePeriodId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-fade" onClick={() => !deleting && setDeletePeriodId(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-br-smoke/95 backdrop-blur-xl p-6 shadow-2xl animate-modal-zoom" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-br-pearl">Eliminar periodo de nómina</h2>
            <p className="mt-2 text-sm text-br-white/70">
              Se eliminará este periodo y todas sus filas de forma permanente. No se puede deshacer.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={confirmDeletePeriod}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Eliminando…" : "Eliminar"}
              </button>
              <button
                type="button"
                onClick={() => setDeletePeriodId(null)}
                disabled={deleting}
                className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card-glow overflow-hidden">
        <h2 className="border-b border-white/10 px-5 py-4 text-lg font-semibold text-br-pearl">
          Historial de nóminas
        </h2>
        <ul className="divide-y divide-white/5">
          {periods.length === 0 ? (
            <li className="px-5 py-10 text-center text-br-white/50">
              No hay periodos. Crea uno para empezar.
            </li>
          ) : (
            periods.map((p, idx) => {
              const totalPaid = p.totalPaid ?? p.entries?.reduce((s, e) => s + e.amountPaid, 0) ?? 0;
              return (
                <li
                  key={p.id}
                  className="admin-list-item flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/es/nomina/periodos/${p.id}`}
                      className="font-medium text-br-pearl hover:text-br-red-main transition-colors"
                    >
                      {p.label || `${p.startDate} – ${p.endDate}`}
                    </Link>
                    {statusBadge(p.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-br-white/70">
                    <span>{new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}</span>
                    <span>Pagado: ${Number(totalPaid).toFixed(2)}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/es/nomina/periodos/${p.id}`}
                        className="text-br-red-main hover:text-br-red-light font-medium transition-colors"
                      >
                        Ver
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletePeriodId(p.id)}
                        className="text-br-white/50 hover:text-red-400 text-xs transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
