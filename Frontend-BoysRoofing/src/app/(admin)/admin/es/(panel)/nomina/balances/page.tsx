"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";

type Worker = {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
};

type Filter = "all" | "i_owe" | "owe_me";

export default function NominaBalancesES() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [adjustValue, setAdjustValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  function load() {
    setLoading(true);
    const q = filter === "all" ? "" : `?filter=${filter}`;
    apiFetch(`/workers/with-balance${q}`)
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/es/login");
          return [];
        }
        return r.json();
      })
      .then((data) => {
        setWorkers(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [filter]);

  function submitAdjust(workerId: number) {
    const v = Number(adjustValue);
    if (isNaN(v)) {
      setToast({ type: "error", message: "Ingresa un número válido" });
      return;
    }
    setSaving(true);
    apiFetch(`/workers/${workerId}`, {
      method: "PATCH",
      body: JSON.stringify({ balance: v }),
    })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setAdjustId(null);
        setAdjustValue("");
        load();
      })
      .catch((e) => setToast({ type: "error", message: e?.message || "Error al guardar" }))
      .finally(() => setSaving(false));
  }

  if (loading && workers.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="h-8 w-48 rounded bg-br-smoke/60 animate-pulse" />
        <div className="mt-4 h-64 rounded bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold admin-page-title">Balances / Deudas</h1>
          <p className="mt-2 text-sm text-br-white/60">
            Trabajadores con saldo distinto de cero. Positivo = les debes; negativo = te deben.
          </p>
        </div>
        <Link href="/admin/es/nomina" className="admin-btn-secondary">
          Nómina
        </Link>
      </header>

      <div className="admin-card-glow flex flex-wrap gap-2 p-4">
        {(["all", "i_owe", "owe_me"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? "admin-btn-primary" : "admin-btn-secondary"}
          >
            {f === "all" ? "Todos" : f === "i_owe" ? "Yo debo" : "Me deben"}
          </button>
        ))}
      </div>

      {/* Vista móvil: cards */}
      <div className="md:hidden space-y-3">
        {workers.length === 0 ? (
          <div className="admin-card-glow px-4 py-8 text-center text-br-white/60">
            No hay trabajadores con saldo con este filtro.
          </div>
        ) : (
          workers.map((w, idx) => (
            <div
              key={w.id}
              className="admin-list-item admin-card-glow p-4"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-br-pearl">{w.name}</p>
                  <p className="text-sm text-br-white/60">{w.phone || "—"}</p>
                </div>
                <span className={`shrink-0 font-semibold ${w.balance > 0 ? "text-amber-400" : "text-green-400"}`}>
                  ${Number(w.balance).toFixed(2)}
                </span>
              </div>
              <div className="mt-3">
                {adjustId === w.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={adjustValue}
                      onChange={(e) => setAdjustValue(e.target.value)}
                      className="w-28 rounded-lg border border-white/10 bg-br-carbon px-2 py-1.5 text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => submitAdjust(w.id)}
                      disabled={saving}
                      className="rounded-lg bg-br-red-main px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdjustId(null); setAdjustValue(""); }}
                      className="rounded-lg border border-br-smoke-light px-3 py-1.5 text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustId(w.id);
                      setAdjustValue(String(w.balance));
                    }}
                    className="rounded-lg border border-br-red-main/50 text-br-red-main px-3 py-1.5 text-sm"
                  >
                    Ajustar
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista escritorio: tabla */}
      <div className="admin-card-glow hidden md:block overflow-x-auto">
        <table className="w-full min-w-[400px] border-separate border-spacing-y-1 text-left text-sm">
          <thead className="text-br-white/70">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold text-right">Saldo</th>
              <th className="px-4 py-3 font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-br-white/60">
                  No hay trabajadores con saldo con este filtro.
                </td>
              </tr>
            ) : (
              workers.map((w, idx) => (
                <tr
                  key={w.id}
                  className="admin-list-item border-t border-white/10 rounded-lg bg-br-smoke/40 hover:bg-br-smoke/70 transition-colors"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3">{w.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={w.balance > 0 ? "text-amber-400" : "text-green-400"}>
                      ${Number(w.balance).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {adjustId === w.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={adjustValue}
                          onChange={(e) => setAdjustValue(e.target.value)}
                          className="w-28 rounded border border-br-smoke-light bg-br-carbon px-2 py-1 text-white"
                        />
                        <button
                          type="button"
                          onClick={() => submitAdjust(w.id)}
                          disabled={saving}
                          className="text-sm text-br-red-main hover:underline disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAdjustId(null); setAdjustValue(""); }}
                          className="text-sm hover:underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustId(w.id);
                          setAdjustValue(String(w.balance));
                        }}
                        className="text-br-red-main hover:underline"
                      >
                        Ajustar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
