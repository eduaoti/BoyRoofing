"use client";

import { useEffect, useMemo, useState } from "react";

type Quote = {
  id: number | string;
  name: string;
  status: string;
  createdAt?: string;
};

export default function DashboardES() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const token = localStorage.getItem("br_admin_token");

        const res = await fetch("http://localhost:3200/quotes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar cotizaciones:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  const stats = useMemo(() => {
    const total = quotes.length;
    const pending = quotes.filter((q) => q.status === "PENDING").length;
    const approved = quotes.filter((q) => q.status === "APPROVED").length;
    const rejected = quotes.filter((q) => q.status === "REJECTED").length;

    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

    const recent = [...quotes]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);

    return { total, pending, approved, rejected, pendingPercent, recent };
  }, [quotes]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-br-white/70 text-sm tracking-wide">
          Cargando datos del dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-br-pearl">
            Dashboard Admin
          </h1>
          <p className="text-sm text-br-white/60 mt-1">
            Resumen general de las cotizaciones recibidas y su estado actual.
          </p>
        </div>

        <p className="text-xs text-br-white/50">
          Última actualización:{" "}
          <span className="font-medium text-br-pearl">
            {new Date().toLocaleString()}
          </span>
        </p>
      </header>

      {/* TARJETAS PRINCIPALES */}
      <section className="grid gap-5 md:grid-cols-3">
        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl border border-br-smoke-light bg-br-smoke/40 px-5 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Cotizaciones totales
              </p>
              <p className="mt-2 text-4xl font-extrabold text-br-red-main">
                {stats.total}
              </p>
            </div>
            <span className="rounded-full bg-br-red-main/10 px-3 py-1 text-xs font-medium text-br-red-main">
              Histórico
            </span>
          </div>
        </div>

        {/* Pendientes */}
        <div className="relative overflow-hidden rounded-2xl border border-br-smoke-light bg-gradient-to-br from-br-smoke/80 to-br-carbon px-5 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-extrabold text-br-red-light">
                {stats.pending}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-br-white/60 mb-1">
                {stats.pendingPercent}% del total
              </p>
              <div className="h-2 w-24 rounded-full bg-br-smoke-light/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-br-red-main transition-all"
                  style={{ width: `${stats.pendingPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Aprobadas / Rechazadas */}
        <div className="relative overflow-hidden rounded-2xl border border-br-smoke-light bg-br-smoke/40 px-5 py-4 shadow-lg">
          <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
            Desglose por estado
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-br-pearl">Aprobadas</span>
              <span className="text-br-white/80 font-semibold">
                {stats.approved}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-br-pearl">Rechazadas</span>
              <span className="text-br-white/80 font-semibold">
                {stats.rejected}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RECIENTES */}
      <section className="rounded-2xl border border-br-smoke-light bg-br-smoke/30 shadow-lg">
        <div className="border-b border-br-smoke-light px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-br-pearl">
              Cotizaciones recientes
            </h2>
            <p className="text-xs text-br-white/60">
              Últimas 5 cotizaciones capturadas en el sistema.
            </p>
          </div>
          <a
            href="/admin/es/quotes"
            className="text-xs font-medium text-br-red-main hover:text-br-red-light underline underline-offset-4"
          >
            Ver todas
          </a>
        </div>

        {stats.recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-br-white/60">
            Aún no hay cotizaciones registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 px-4 py-3 text-sm">
              <thead className="text-xs uppercase tracking-wide text-br-white/50">
                <tr>
                  <th className="px-6 py-2 text-left">Cliente</th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="px-6 py-2 text-left">Estado</th>
                  <th className="px-6 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((q) => {
                  const createdAt = q.createdAt
                    ? new Date(q.createdAt).toLocaleString()
                    : "—";

                  const statusClasses =
                    q.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                      : q.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/10 text-red-300 border border-red-500/40";

                  return (
                    <tr
                      key={q.id}
                      className="rounded-lg bg-br-smoke/40 hover:bg-br-smoke/70 transition-colors"
                    >
                      <td className="px-6 py-3 text-br-pearl">
                        <div className="font-medium">{q.name}</div>
                        <div className="text-xs text-br-white/50">
                          #{q.id}
                        </div>
                      </td>

                      <td className="px-6 py-3 text-xs text-br-white/60 hidden md:table-cell">
                        {createdAt}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses}`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <a
                          href={`/admin/es/quotes/${q.id}`}
                          className="text-xs font-medium text-br-red-main hover:text-br-red-light underline underline-offset-4"
                        >
                          Ver detalle
                        </a>
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
