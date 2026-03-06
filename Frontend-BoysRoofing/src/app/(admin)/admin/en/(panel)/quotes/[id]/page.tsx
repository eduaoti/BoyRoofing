// src/app/admin/en/(panel)/quotes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  message: string;
  status: QuoteStatus;
  createdAt?: string;
};

export default function QuoteDetailEN() {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  async function loadQuote() {
    try {
      const hasWindow = typeof window !== "undefined";
      const token = hasWindow ? localStorage.getItem("br_admin_token") : null;

      if (!token) {
        router.push("/admin/en/login");
        return;
      }

      // apiFetch ya agrega Authorization y Content-Type
      const res = await apiFetch(`/quotes/${id}`);

      if (res.status === 401) {
        if (hasWindow) {
          localStorage.removeItem("br_admin_token");
        }
        router.push("/admin/en/login");
        return;
      }

      if (!res.ok) {
        console.error("Failed to load quote:", await res.text());
        setQuote(null);
        setLoading(false);
        return;
      }

      const data: Quote = await res.json();
      setQuote(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading quote:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadQuote();
    }
  }, [id, router]);

  function openDeleteConfirm() {
    setShowDeleteConfirm(true);
  }

  async function doDeleteQuote() {
    if (!quote) return;
    try {
      setDeleting(true);
      const hasWindow = typeof window !== "undefined";
      const token = hasWindow ? localStorage.getItem("br_admin_token") : null;
      if (!token) {
        router.push("/admin/en/login");
        return;
      }
      const res = await apiFetch(`/quotes/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        if (hasWindow) localStorage.removeItem("br_admin_token");
        router.push("/admin/en/login");
        return;
      }
      if (!res.ok) {
        console.error("Error deleting quote:", await res.text());
        setToast({ type: "error", message: "There was a problem deleting this quote. Please try again." });
        return;
      }
      setShowDeleteConfirm(false);
      router.push("/admin/en/quotes");
    } catch (err) {
      console.error("Error deleting quote:", err);
      setToast({ type: "error", message: "There was a problem deleting this quote. Please try again." });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-card-glow max-w-4xl animate-pulse space-y-4 p-8">
        <div className="h-6 w-40 rounded bg-br-smoke/60" />
        <div className="h-4 w-64 rounded bg-br-smoke/60" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-32 rounded-xl bg-br-smoke/40" />
          <div className="h-32 rounded-xl bg-br-smoke/40" />
        </div>
        <div className="h-40 rounded-xl bg-br-smoke/40" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="admin-card-glow max-w-xl p-8 text-center text-sm text-br-white/70">
        <p className="mb-4 font-semibold text-br-pearl">
          Quote not found or no longer available.
        </p>
        <button
          onClick={() => router.push("/admin/en/quotes")}
          className="inline-flex items-center rounded-full bg-br-red-main px-5 py-2 text-xs font-semibold text-white hover:bg-br-red-light transition"
        >
          Back to quotes
        </button>
      </div>
    );
  }

  const createdAt = quote.createdAt
    ? new Date(quote.createdAt).toLocaleString()
    : "—";

  const statusClasses =
    quote.status === "PENDING"
      ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
      : quote.status === "IN_REVIEW"
      ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
      : quote.status === "SENT"
      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
      : "bg-zinc-500/10 text-zinc-300 border border-zinc-500/40";

  return (
    <div className="max-w-4xl space-y-6">
      {toast && (
        <ToastMessage type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}
      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete quote"
        message={`Are you sure you want to delete quote from "${quote?.name ?? ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={doDeleteQuote}
        loading={deleting}
        danger
      />
      {/* BREADCRUMB / HEADER */}
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <div>
          <button
            onClick={() => router.push("/admin/en/quotes")}
            className="mb-2 text-xs font-medium text-br-white/60 hover:text-br-pearl underline underline-offset-4"
          >
            ← Back to quotes
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight admin-page-title">
            Quote detail
          </h1>
          <p className="mt-1 text-xs text-br-white/50">
            Review information, status and message sent by the customer.
          </p>
        </div>

        <div className="text-right space-y-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
          >
            {quote.status}
          </span>
          <p className="text-[11px] text-br-white/50">
            Quote ID:{" "}
            <span className="font-mono text-br-pearl">#{quote.id}</span>
          </p>
        </div>
      </div>

      {/* TOP INFO CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact info */}
        <div className="admin-card-glow p-5">
          <h2 className="text-sm font-semibold text-br-pearl mb-3">
            Customer information
          </h2>
          <div className="space-y-2 text-sm text-br-white/80">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Name
              </p>
              <p className="font-medium">{quote.name}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Email
              </p>
              <p className="font-medium break-all">{quote.email}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Phone
              </p>
              <p className="font-medium">{quote.phone}</p>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="admin-card-glow p-5">
          <h2 className="text-sm font-semibold text-br-pearl mb-3">
            Quote details
          </h2>
          <div className="space-y-2 text-sm text-br-white/80">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Service
              </p>
              <p className="font-medium">{quote.service}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Created at
              </p>
              <p className="font-medium">{createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGE CARD */}
      <div className="admin-card-glow p-5">
        <h2 className="text-sm font-semibold text-br-pearl mb-2">
          Customer message
        </h2>
        {quote.message ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-br-white/80">
            {quote.message}
          </p>
        ) : (
          <p className="text-sm text-br-white/50">No message provided.</p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/admin/en/quotes")}
            className="admin-btn-secondary"
          >
            Back to list
          </button>

          {quote.status === "PENDING" && (
            <button
              onClick={() => router.push(`/admin/en/invoices/${quote.id}`)}
              className="admin-btn-primary"
            >
              Create invoice
            </button>
          )}
        </div>

        <button
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {deleting ? "Deleting…" : "Delete quote"}
        </button>
      </div>
    </div>
  );
}
