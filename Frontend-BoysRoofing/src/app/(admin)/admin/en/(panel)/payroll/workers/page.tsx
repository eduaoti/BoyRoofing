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

export default function PayrollWorkersEN() {
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
          router.push("/admin/en/login");
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
      <div className="p-6">
        <div className="h-8 w-48 rounded bg-br-smoke/60 animate-pulse" />
        <div className="mt-4 h-64 rounded bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-white">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-br-pearl">Workers (crew)</h1>
          <p className="mt-1 text-sm text-br-white/60">
            Regular workers. They appear automatically when you create a payroll period.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/en/payroll/balances"
            className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
          >
            Balances
          </Link>
          <button
            onClick={openAdd}
            className="rounded-lg bg-br-red-main px-4 py-2 text-sm font-medium hover:bg-br-red-light"
          >
            Add worker
          </button>
        </div>
      </header>

      {showForm && (
        <form
          onSubmit={submit}
          className="rounded-xl border border-br-smoke-light bg-br-smoke/40 p-6"
        >
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit worker" : "New worker"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-br-white/70">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-br-white/70">Default day rate ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={defaultDayRate}
                onChange={(e) => setDefaultDayRate(e.target.value)}
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
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-br-smoke-light">
        <table className="w-full text-left text-sm">
          <thead className="bg-br-smoke/80">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold text-right">Day rate</th>
              <th className="px-4 py-3 font-semibold text-right">Balance</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-br-white/60">
                  No workers yet. Add one to get started.
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
                      {w.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openEdit(w)}
                      className="text-br-red-main hover:underline"
                    >
                      Edit
                    </button>
                    {" · "}
                    <button
                      onClick={() => toggleActive(w)}
                      className="text-br-red-main hover:underline"
                    >
                      {w.isActive ? "Deactivate" : "Activate"}
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
