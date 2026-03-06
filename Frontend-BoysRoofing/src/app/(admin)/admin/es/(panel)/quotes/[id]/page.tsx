// src/app/admin/es/(panel)/quotes/[id]/page.tsx
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

export default function QuoteDetailES() {
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
        router.push("/admin/es/login");
        return;
      }

      const res = await apiFetch(`/quotes/${id}`);

      if (res.status === 401) {
        if (hasWindow) {
          localStorage.removeItem("br_admin_token");
        }
        router.push("/admin/es/login");
        return;
      }

      if (!res.ok) {
        console.error("No se pudo cargar la cotización:", await res.text());
        setQuote(null);
        setLoading(false);
        return;
      }

      const data: Quote = await res.json();
      setQuote(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar la cotización:", err);
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
        router.push("/admin/es/login");
        return;
      }
      const res = await apiFetch(`/quotes/${id}`, { method: "DELETE" });
      if (res.status === 401) {
        if (hasWindow) localStorage.removeItem("br_admin_token");
        router.push("/admin/es/login");
        return;
      }
      if (!res.ok) {
        console.error("Error al eliminar la cotización:", await res.text());
        setToast({ type: "error", message: "Hubo un problema al eliminar la cotización. Intenta de nuevo." });
        return;
      }
      setShowDeleteConfirm(false);
      router.push("/admin/es/quotes");
    } catch (err) {
      console.error("Error al eliminar la cotización:", err);
      setToast({ type: "error", message: "Hubo un problema al eliminar la cotización. Intenta de nuevo." });
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
          Cotización no encontrada o ya no está disponible.
        </p>
        <button
          onClick={() => router.push("/admin/es/quotes")}
          className="inline-flex items-center rounded-full bg-br-red-main px-5 py-2 text-xs font-semibold text-white hover:bg-br-red-light transition"
        >
          Volver a cotizaciones
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
        title="Eliminar cotización"
        message={`¿Seguro que deseas eliminar la cotización de "${quote?.name ?? ""}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={doDeleteQuote}
        loading={deleting}
        danger
      />
      {/* BREADCRUMB / HEADER */}
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <div>
          <button
            onClick={() => router.push("/admin/es/quotes")}
            className="mb-2 text-xs font-medium text-br-white/60 hover:text-br-pearl underline underline-offset-4"
          >
            ← Volver a cotizaciones
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight admin-page-title">
            Detalle de cotización
          </h1>
          <p className="mt-1 text-xs text-br-white/50">
            Revisa la información, estado y mensaje enviado por el cliente.
          </p>
        </div>

        <div className="text-right space-y-1">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
          >
            {quote.status}
          </span>
          <p className="text-[11px] text-br-white/50">
            ID de cotización:{" "}
            <span className="font-mono text-br-pearl">#{quote.id}</span>
          </p>
        </div>
      </div>

      {/* TOP INFO CARDS */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact info */}
        <div className="admin-card-glow p-5">
          <h2 className="text-sm font-semibold text-br-pearl mb-3">
            Información del cliente
          </h2>
          <div className="space-y-2 text-sm text-br-white/80">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Nombre
              </p>
              <p className="font-medium">{quote.name}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Correo electrónico
              </p>
              <p className="font-medium break-all">{quote.email}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Teléfono
              </p>
              <p className="font-medium">{quote.phone}</p>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="admin-card-glow p-5">
          <h2 className="text-sm font-semibold text-br-pearl mb-3">
            Detalles de la cotización
          </h2>
          <div className="space-y-2 text-sm text-br-white/80">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Servicio
              </p>
              <p className="font-medium">{quote.service}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Fecha de creación
              </p>
              <p className="font-medium">{createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGE CARD */}
      <div className="admin-card-glow p-5">
        <h2 className="text-sm font-semibold text-br-pearl mb-2">
          Mensaje del cliente
        </h2>
        {quote.message ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-br-white/80">
            {quote.message}
          </p>
        ) : (
          <p className="text-sm text-br-white/50">
            El cliente no proporcionó un mensaje.
          </p>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/admin/es/quotes")}
            className="admin-btn-secondary"
          >
            Volver a la lista
          </button>

          {quote.status === "PENDING" && (
            <button
              onClick={() => router.push(`/admin/es/invoices/${quote.id}`)}
              className="admin-btn-primary"
            >
              Crear factura
            </button>
          )}
        </div>

        <button
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {deleting ? "Eliminando…" : "Eliminar cotización"}
        </button>
      </div>
    </div>
  );
}
