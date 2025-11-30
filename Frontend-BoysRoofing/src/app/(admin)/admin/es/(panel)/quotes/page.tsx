"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Quote = {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  service: string;
  status: string;
  createdAt?: string;
};

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

export default function QuotesES() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");

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

  const filteredQuotes = useMemo(() => {
    let result = [...quotes];

    if (statusFilter !== "ALL") {
      result = result.filter((q) => q.status === statusFilter);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.email.toLowerCase().includes(term)
      );
    }

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
      {/* HEADER */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-br-pearl">
            Cotizaciones
          </h1>
          <p className="mt-1 text-sm text-br-white/60">
            Administra todas las solicitudes de cotización de tus clientes.
          </p>
        </div>

        <div className="text-right text-xs text-br-white/60">
          <p>
            Total de cotizaciones:{" "}
            <span className="font-semibold text-br-pearl">
              {quotes.length}
            </span>
          </p>
        </div>
      </header>

      {/* FILTROS */}
      <section className="flex flex-col gap-3 rounded-2xl border border-br-smoke-light bg-br-smoke/40 p-4 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <label className="text-xs font-medium text-br-white/70">
            Buscar
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="flex-1 rounded-full border border-br-smoke-light bg-br-carbon/80 px-4 py-2 text-xs text-br-pearl placeholder:text-br-white/40 focus:outline-none focus:ring-1 focus:ring-br-red-main"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-br-white/70">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-full border border-br-smoke-light bg-br-carbon/80 px-3 py-2 text-xs text-br-pearl focus:outline-none focus:ring-1 focus:ring-br-red-main"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "ALL"
                  ? "Todos"
                  : s === "PENDING"
                  ? "Pendiente"
                  : s === "APPROVED"
                  ? "Aprobada"
                  : "Rechazada"}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* TABLA / LISTADO */}
      <section className="rounded-2xl border border-br-smoke-light bg-br-smoke/30 shadow-lg">
        {filteredQuotes.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-br-white/60">
            No se encontraron cotizaciones con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 px-4 py-3 text-sm">
              <thead className="text-xs uppercase tracking-wide text-br-white/50">
                <tr>
                  <th className="px-6 py-2 text-left">Cliente</th>
                  <th className="px-6 py-2 text-left hidden sm:table-cell">
                    Contacto
                  </th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Servicio
                  </th>
                  <th className="px-6 py-2 text-left">Estado</th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Fecha
                  </th>
                  <th className="px-6 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => {
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
                        <Link
                          href={`/admin/es/quotes/${q.id}`}
                          className="text-xs font-semibold text-br-red-main hover:text-br-red-light underline underline-offset-4"
                        >
                          Ver detalle
                        </Link>
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
