"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

type Worker = {
  id: number;
  name: string;
  phone: string | null;
  role: string | null;
  defaultDayRate: number;
  isActive: boolean;
  balance: number;
};

export default function NominaTrabajadoresES() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [defaultDayRate, setDefaultDayRate] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    apiFetch("/workers")
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
  }, []);

  function openAdd() {
    setEditingId(null);
    setName("");
    setPhone("");
    setRole("");
    setDefaultDayRate("");
    setShowForm(true);
  }

  function openEdit(w: Worker) {
    setEditingId(w.id);
    setName(w.name);
    setPhone(w.phone || "");
    setRole(w.role || "");
    setDefaultDayRate(String(w.defaultDayRate));
    setShowForm(true);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      role: role.trim() || undefined,
      defaultDayRate: Number(defaultDayRate) || 0,
      isActive: true,
    };
    const url = editingId ? `/workers/${editingId}` : "/workers";
    const method = editingId ? "PATCH" : "POST";
    apiFetch(url, { method, body: JSON.stringify(body) })
      .then((r) => {
        if (r.ok) {
          setShowForm(false);
          load();
        } else return r.text().then((t) => Promise.reject(new Error(t)));
      })
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
  }

  function toggleActive(w: Worker) {
    apiFetch(`/workers/${w.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !w.isActive }),
    })
      .then((r) => r.ok && load())
      .catch((e) => alert(e.message));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="h-8 w-48 rounded bg-br-smoke/60 animate-pulse" />
        <div className="mt-4 h-64 rounded bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 text-white">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-br-pearl">Trabajadores de plantilla</h1>
          <p className="mt-1 text-sm text-br-white/60">
            Se añaden automáticamente al crear un periodo de nómina.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/es/nomina/balances"
            className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
          >
            Balances
          </Link>
          <button
            onClick={openAdd}
            className="rounded-lg bg-br-red-main px-4 py-2 text-sm font-medium hover:bg-br-red-light"
          >
            Añadir trabajador
          </button>
        </div>
      </header>

      {/* Modal nuevo / editar trabajador */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-worker-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-br-carbon shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <h2 id="modal-worker-title" className="text-lg font-semibold text-br-pearl">
                {editingId ? "Editar trabajador" : "Nuevo trabajador"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-br-white/60 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submit} className="p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-br-white/70">Nombre *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-br-smoke/60 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-br-white/70">Teléfono</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-br-smoke/60 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-br-white/70">Rol</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-br-smoke/60 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-br-white/70">Pago por día ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={defaultDayRate}
                    onChange={(e) => setDefaultDayRate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-br-smoke/60 px-3 py-2 text-white focus:ring-2 focus:ring-br-red-main/50 focus:border-br-red-main/50"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/20 px-4 py-2 text-sm text-br-pearl hover:bg-white/5 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-br-red-main px-4 py-2 text-sm font-medium text-white hover:bg-br-red-light disabled:opacity-60 transition"
                >
                  {saving ? "Guardando…" : editingId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vista móvil: cards */}
      <div className="md:hidden space-y-3">
        {workers.length === 0 ? (
          <div className="rounded-xl border border-br-smoke-light bg-br-smoke/40 px-4 py-8 text-center text-br-white/60">
            No hay trabajadores. Añade uno para empezar.
          </div>
        ) : (
          workers.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-br-smoke-light bg-br-smoke/40 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-br-pearl">{w.name}</p>
                  <p className="text-sm text-br-white/60">{w.phone || "—"}</p>
                  {w.role ? <p className="text-sm text-br-white/70">{w.role}</p> : null}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    w.isActive ? "bg-green-900/50 text-green-300" : "bg-br-smoke text-br-white/60"
                  }`}
                >
                  {w.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span>Pago/día: ${Number(w.defaultDayRate).toFixed(2)}</span>
                <span className={w.balance !== 0 ? "font-medium" : ""}>Saldo: ${Number(w.balance).toFixed(2)}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => openEdit(w)}
                  className="rounded-lg border border-br-smoke-light px-3 py-1.5 text-sm text-br-red-main hover:bg-br-carbon/60"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(w)}
                  className="rounded-lg border border-br-smoke-light px-3 py-1.5 text-sm text-br-red-main hover:bg-br-carbon/60"
                >
                  {w.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vista escritorio: tabla */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-br-smoke-light">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-br-smoke/80">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Teléfono</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold text-right">Pago/día</th>
              <th className="px-4 py-3 font-semibold text-right">Saldo</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-br-white/60">
                  No hay trabajadores. Añade uno para empezar.
                </td>
              </tr>
            ) : (
              workers.map((w) => (
                <tr key={w.id} className="border-t border-br-smoke-light">
                  <td className="px-4 py-3">{w.name}</td>
                  <td className="px-4 py-3">{w.phone || "—"}</td>
                  <td className="px-4 py-3">{w.role || "—"}</td>
                  <td className="px-4 py-3 text-right">${Number(w.defaultDayRate).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={w.balance !== 0 ? "font-medium" : ""}>
                      ${Number(w.balance).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        w.isActive ? "bg-green-900/50 text-green-300" : "bg-br-smoke text-br-white/60"
                      }`}
                    >
                      {w.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(w)}
                      className="text-br-red-main hover:underline"
                    >
                      Editar
                    </button>
                    {" · "}
                    <button
                      onClick={() => toggleActive(w)}
                      className="text-br-red-main hover:underline"
                    >
                      {w.isActive ? "Desactivar" : "Activar"}
                    </button>
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
