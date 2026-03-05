"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Period = {
  id: number;
  startDate: string;
  endDate: string;
  label: string | null;
  status: string;
  totalPaid: number | null;
  entries?: { total: number; amountPaid: number }[];
};

export default function NominaES() {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

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
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
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
    <div className="space-y-6 p-6 text-white">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-br-pearl">Nómina</h1>
          <p className="mt-1 text-sm text-br-white/60">
            Crea y gestiona periodos. Cada periodo incluye a los trabajadores activos.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/es/nomina/balances"
            className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
          >
            Balances
          </Link>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-lg bg-br-red-main px-4 py-2 text-sm font-medium hover:bg-br-red-light"
          >
            Nuevo periodo
          </button>
        </div>
      </header>

      {showNew && (
        <form
          onSubmit={createPeriod}
          className="rounded-xl border border-br-smoke-light bg-br-smoke/40 p-6"
        >
          <h2 className="text-lg font-semibold">Nuevo periodo de nómina</h2>
          <p className="mt-1 text-sm text-br-white/60">
            Se creará una fila por cada trabajador activo. Puedes editar días e importes en el detalle.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm text-br-white/70">Fecha inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Fecha fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                required
              />
            </div>
            <div>
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
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-br-red-main px-4 py-2 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Creando…" : "Crear periodo"}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-br-smoke-light">
        <h2 className="border-b border-br-smoke-light px-4 py-3 text-lg font-semibold">
          Historial de nóminas
        </h2>
        <ul className="divide-y divide-br-smoke-light">
          {periods.length === 0 ? (
            <li className="px-4 py-8 text-center text-br-white/60">
              No hay periodos. Crea uno para empezar.
            </li>
          ) : (
            periods.map((p) => {
              const totalPaid = p.totalPaid ?? p.entries?.reduce((s, e) => s + e.amountPaid, 0) ?? 0;
              return (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                  <div className="flex items-center gap-4">
                    <Link
                      href={`/admin/es/nomina/periodos/${p.id}`}
                      className="font-medium text-br-pearl hover:text-br-red-main hover:underline"
                    >
                      {p.label || `${p.startDate} – ${p.endDate}`}
                    </Link>
                    {statusBadge(p.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-br-white/70">
                    <span>{new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}</span>
                    <span>Pagado: ${Number(totalPaid).toFixed(2)}</span>
                    <Link
                      href={`/admin/es/nomina/periodos/${p.id}`}
                      className="text-br-red-main hover:underline"
                    >
                      Ver
                    </Link>
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
