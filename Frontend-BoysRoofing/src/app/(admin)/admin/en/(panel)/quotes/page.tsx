// src/app/admin/en/(panel)/quotes/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";
import { ConfirmModal } from "@/components/ConfirmModal";

type QuoteStatus = "PENDING" | "IN_REVIEW" | "SENT" | "CLOSED" | string;

type Quote = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: QuoteStatus;
  createdAt?: string;
  invoice?: { id: number } | null;
};

const STATUS_OPTIONS = ["ALL", "PENDING", "IN_REVIEW", "SENT", "CLOSED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function QuotesEN() {
  const router = useRouter();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [confirmDeleteInvoiceId, setConfirmDeleteInvoiceId] = useState<number | string | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const hasWindow = typeof window !== "undefined";
        const token = hasWindow ? localStorage.getItem("br_admin_token") : null;

        // Si no hay token -> fuera
        if (!token) {
          router.push("/admin/en/login");
          return;
        }

        // apiFetch ya agrega Authorization automáticamente
        const res = await apiFetch("/quotes");

        // Si el token ya no es válido
        if (res.status === 401) {
          if (hasWindow) {
            localStorage.removeItem("br_admin_token");
          }
          router.push("/admin/en/login");
          return;
        }

        if (!res.ok) {
          console.error("Error loading quotes:", await res.text());
          setQuotes([]);
          return;
        }

        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading quotes:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, [router]);

  function openDeleteInvoiceConfirm(quoteId: number | string) {
    setConfirmDeleteInvoiceId(quoteId);
  }

  async function doDeleteInvoice() {
    if (confirmDeleteInvoiceId == null) return;
    const quoteId = confirmDeleteInvoiceId;
    setDeletingId(quoteId);
    try {
      const res = await apiFetch(`/invoices/quote/${quoteId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setToast({ type: "error", message: err?.message || "Failed to delete invoice" });
        return;
      }
      setQuotes((prev) =>
        prev.map((q) =>
          q.id === quoteId ? { ...q, invoice: null, status: "PENDING" as QuoteStatus } : q
        )
      );
      setToast({ type: "success", message: "Invoice deleted. Quote is back to PENDING." });
      setConfirmDeleteInvoiceId(null);
    } catch (e) {
      console.error(e);
      setToast({ type: "error", message: "Failed to delete invoice" });
    } finally {
      setDeletingId(null);
    }
  }

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    // filtro por status
    if (statusFilter !== "ALL") {
      result = result.filter((q) => q.status === statusFilter);
    }

    // filtro por búsqueda
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.email.toLowerCase().includes(term)
      );
    }

    // ordena del más reciente al más antiguo
    result.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return db - da;
    });

    return result;
  }, [quotes, statusFilter, search]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="h-6 w-40 rounded bg-br-smoke/60 animate-pulse" />
        <div className="h-10 w-full max-w-xl rounded bg-br-smoke/40 animate-pulse" />
        <div className="h-40 rounded-2xl bg-br-smoke/40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 text-white">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <ConfirmModal
        open={confirmDeleteInvoiceId != null}
        onClose={() => setConfirmDeleteInvoiceId(null)}
        title="Delete invoice"
        message="Delete the invoice for this quote? The quote will go back to PENDING. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDeleteInvoice}
        loading={deletingId === confirmDeleteInvoiceId}
        danger
      />
      {/* HEADER */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight admin-page-title">
            Quotes
          </h1>
          <p className="mt-2 text-sm text-br-white/60">
            Manage all customer quote requests from this panel.
          </p>
        </div>

        <div className="text-right text-xs text-br-white/60">
          <p>
            Total quotes:{" "}
            <span className="font-semibold text-br-pearl">
              {quotes.length}
            </span>
          </p>
        </div>
      </header>

      {/* FILTERS */}
      <section className="admin-card-glow flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <label className="text-xs font-medium text-br-white/70">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 rounded-full border border-br-smoke-light bg-br-carbon/80 px-4 py-2 text-xs text-br-pearl placeholder:text-br-white/40 focus:outline-none focus:ring-1 focus:ring-br-red-main"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-br-white/70">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-full border border-br-smoke-light bg-br-carbon/80 px-3 py-2 text-xs text-br-pearl focus:outline-none focus:ring-1 focus:ring-br-red-main"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL"
                  ? "All"
                  : s
                      .toLowerCase()
                      .split("_")
                      .map((w) => w[0].toUpperCase() + w.slice(1))
                      .join(" ")}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* LIST / TABLE */}
      <section className="admin-card-glow overflow-hidden">
        {filteredQuotes.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-br-white/60">
            No quotes found with the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 px-4 py-3 text-sm">
              <thead className="text-xs uppercase tracking-wide text-br-white/50">
                <tr>
                  <th className="px-6 py-2 text-left">Customer</th>
                  <th className="px-6 py-2 text-left hidden sm:table-cell">
                    Contact
                  </th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Service
                  </th>
                  <th className="px-6 py-2 text-left">Status</th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Created at
                  </th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q, idx) => {
                  const createdAt = q.createdAt
                    ? new Date(q.createdAt).toLocaleString()
                    : "—";

                  const statusClasses =
                    q.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                      : q.status === "IN_REVIEW"
                      ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
                      : q.status === "SENT"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-500/10 text-zinc-300 border border-zinc-500/40";

                  return (
                    <tr
                      key={q.id}
                      className="admin-list-item rounded-lg bg-br-smoke/40 hover:bg-br-smoke/70 transition-colors"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="px-6 py-3 align-middle">
                        <div className="font-medium text-br-pearl">
                          {q.name}
                        </div>
                        <div className="text-xs text-br-white/50 break-all">
                          {q.email}
                        </div>
                      </td>

                      <td className="px-6 py-3 align-middle text-xs text-br-white/70 hidden sm:table-cell">
                        <div>{q.phone}</div>
                      </td>

                      <td className="px-6 py-3 align-middle text-xs text-br-white/80 hidden md:table-cell">
                        {q.service}
                      </td>

                      <td className="px-6 py-3 align-middle">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses}`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="px-6 py-3 align-middle text-xs text-br-white/60 hidden md:table-cell">
                        {createdAt}
                      </td>

                      <td className="px-6 py-3 align-middle text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <Link
                            href={`/admin/en/quotes/${q.id}`}
                            className="text-xs font-semibold text-br-red-main hover:text-br-red-light underline underline-offset-4"
                          >
                            View details
                          </Link>
                          {q.invoice && (
                            <button
                              type="button"
                              disabled={deletingId === q.id}
                              onClick={() => openDeleteInvoiceConfirm(q.id)}
                              className="text-xs font-medium text-br-white/70 hover:text-red-400 underline underline-offset-4 disabled:opacity-50"
                            >
                              {deletingId === q.id ? "Deleting…" : "Delete invoice"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
