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

export default function PayrollEN() {
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
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    apiFetch("/payroll/periods")
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("br_admin_token");
          router.push("/admin/en/login");
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
        router.push(`/admin/en/payroll/periods/${period.id}`);
      })
      .catch((err) => setToast({ type: "error", message: err?.message || "Failed to create period" }))
      .finally(() => setSaving(false));
  }

  function confirmDeletePeriod() {
    if (deletePeriodId == null) return;
    setDeleting(true);
    apiFetch(`/payroll/periods/${deletePeriodId}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return r.text().then((t) => Promise.reject(new Error(t)));
        setDeletePeriodId(null);
        load();
        setToast({ type: "success", message: "Period deleted." });
      })
      .catch((err) => setToast({ type: "error", message: err?.message || "Failed to delete period" }))
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
    return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{s}</span>;
  };

  return (
    <div className="space-y-8 p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold admin-page-title tracking-tight">Payroll</h1>
          <p className="mt-2 text-sm text-br-white/60">
            Create and manage payroll periods. Each period includes all active workers.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/en/payroll/balances"
            className="admin-btn-secondary rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            Balances
          </Link>
          <button
            onClick={() => setShowNew(true)}
            className="admin-btn-primary rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            New period
          </button>
        </div>
      </header>

      {/* Modal: New period */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-fade" onClick={() => !saving && setShowNew(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-br-smoke/95 backdrop-blur-xl shadow-2xl animate-modal-zoom" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={createPeriod} className="p-6">
              <h2 className="text-lg font-semibold text-br-pearl">New payroll period</h2>
              <p className="mt-1 text-sm text-br-white/60">
                A row will be created for each active worker. You can edit days and amounts in the period view.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm text-br-white/70">Start date</label>
                  <div className="mt-1 flex rounded border border-br-smoke-light bg-br-carbon overflow-hidden">
                    <input
                      ref={startInputRef}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                      className="flex-1 min-w-0 bg-transparent px-3 py-2 text-white text-sm [color-scheme:dark]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => startInputRef.current?.showPicker?.() ?? startInputRef.current?.click()}
                      className="px-3 py-2 text-br-pearl/80 hover:text-br-red-main transition shrink-0"
                      aria-label="Open calendar"
                    >
                      <CalendarDaysIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-br-white/70">End date</label>
                  <div className="mt-1 flex rounded border border-br-smoke-light bg-br-carbon overflow-hidden">
                    <input
                      ref={endInputRef}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="flex-1 min-w-0 bg-transparent px-3 py-2 text-white text-sm [color-scheme:dark]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => endInputRef.current?.showPicker?.() ?? endInputRef.current?.click()}
                      className="px-3 py-2 text-br-pearl/80 hover:text-br-red-main transition shrink-0"
                      aria-label="Open calendar"
                    >
                      <CalendarDaysIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-br-white/70">Label (optional)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Week of Mar 2"
                    className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create period"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  disabled={saving}
                  className="admin-btn-secondary rounded-xl px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete period */}
      {deletePeriodId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-fade" onClick={() => !deleting && setDeletePeriodId(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-br-smoke/95 backdrop-blur-xl p-6 shadow-2xl animate-modal-zoom" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-br-pearl">Delete payroll period</h2>
            <p className="mt-2 text-sm text-br-white/70">
              This will permanently delete this period and all its entries. This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={confirmDeletePeriod}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeletePeriodId(null)}
                disabled={deleting}
                className="rounded-lg border border-br-smoke-light px-4 py-2 text-sm hover:bg-br-carbon/60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-card-glow overflow-hidden">
        <h2 className="border-b border-white/10 px-5 py-4 text-lg font-semibold text-br-pearl">
          Payroll history
        </h2>
        <ul className="divide-y divide-white/5">
          {periods.length === 0 ? (
            <li className="px-5 py-10 text-center text-br-white/50">
              No periods yet. Create one to get started.
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
                      href={`/admin/en/payroll/periods/${p.id}`}
                      className="font-medium text-br-pearl hover:text-br-red-main transition-colors"
                    >
                      {p.label || `${p.startDate} – ${p.endDate}`}
                    </Link>
                    {statusBadge(p.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-br-white/70">
                    <span>{new Date(p.startDate).toLocaleDateString()} – {new Date(p.endDate).toLocaleDateString()}</span>
                    <span>Paid: ${Number(totalPaid).toFixed(2)}</span>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/en/payroll/periods/${p.id}`}
                        className="text-br-red-main hover:text-br-red-light font-medium transition-colors"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeletePeriodId(p.id)}
                        className="text-br-white/50 hover:text-red-400 text-xs transition-colors"
                      >
                        Delete
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
