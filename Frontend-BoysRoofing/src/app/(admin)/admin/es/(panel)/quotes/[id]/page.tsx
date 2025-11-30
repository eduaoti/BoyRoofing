"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Quote = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: string;
  createdAt?: string;
};

export default function QuoteDetailES() {
  const { id } = useParams();
  const router = useRouter();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  async function loadQuote() {
    try {
      const token = localStorage.getItem("br_admin_token");

      if (!token) {
        router.push("/admin/es/login");
        return;
      }

      const res = await fetch(`http://localhost:3200/quotes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("br_admin_token");
        router.push("/admin/es/login");
        return;
      }

      if (!res.ok) {
        console.error("Error al cargar cotización:", await res.text());
        setQuote(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setQuote(data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar cotización:", err);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function deleteQuote() {
    if (!quote) return;

    const confirmed = confirm(
      `¿Seguro que deseas eliminar la cotización de "${quote.name}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("br_admin_token");

      await fetch(`http://localhost:3200/quotes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      router.push("/admin/es/quotes");
    } catch (err) {
      console.error("Error al eliminar cotización:", err);
      setDeleting(false);
      alert("Ocurrió un problema al eliminar la cotización. Intenta de nuevo.");
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl animate-pulse space-y-4 rounded-2xl border border-br-smoke-light bg-br-smoke/20 p-8">
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
      <div className="max-w-xl rounded-2xl border border-br-smoke-light bg-br-smoke/30 p-8 text-center text-sm text-br-white/70">
        <p className="mb-4 font-semibold text-br-pearl">
          La cotización no existe o ya no está disponible.
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
      : quote.status === "APPROVED"
      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
      : "bg-red-500/10 text-red-300 border border-red-500/40";

  return (
    <div className="max-w-4xl space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <button
            onClick={() => router.push("/admin/es/quotes")}
            className="mb-2 text-xs font-medium text-br-white/60 hover:text-br-pearl underline underline-offset-4"
          >
            ← Volver a cotizaciones
          </button>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-br-pearl">
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

      {/* INFO PRINCIPAL */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cliente */}
        <div className="rounded-2xl border border-br-smoke-light bg-br-smoke/30 p-5 shadow-lg">
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
                Correo
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

        {/* Metadatos */}
        <div className="rounded-2xl border border-br-smoke-light bg-br-smoke/30 p-5 shadow-lg">
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

      {/* MENSAJE */}
      <div className="rounded-2xl border border-br-smoke-light bg-br-smoke/35 p-5 shadow-lg">
        <h2 className="text-sm font-semibold text-br-pearl mb-2">
          Mensaje del cliente
        </h2>
        {quote.message ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-br-white/80">
            {quote.message}
          </p>
        ) : (
          <p className="text-sm text-br-white/50">Sin mensaje adicional.</p>
        )}
      </div>

      {/* ACCIONES */}
      <div className="flex flex-col gap-3 border-t border-br-smoke-light pt-4 sm:flex-row sm:justify-between sm:items-center">
        <button
          onClick={() => router.push("/admin/es/quotes")}
          className="inline-flex items-center justify-center rounded-full border border-br-smoke-light bg-br-smoke/40 px-5 py-2 text-xs font-medium text-br-pearl hover:bg-br-smoke-light/60 transition"
        >
          Volver al listado
        </button>

        <button
          onClick={deleteQuote}
          disabled={deleting}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {deleting ? "Eliminando..." : "Eliminar cotización"}
        </button>
      </div>
    </div>
  );
}
