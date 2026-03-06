// src/app/admin/en/(panel)/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Quote = {
  id: number | string;
  name: string;
  status: "PENDING" | "IN_REVIEW" | "SENT" | "CLOSED" | string;
  createdAt?: string;
};

export default function AdminENDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const res = await apiFetch("/quotes");

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
  }, []);

  const stats = useMemo(() => {
    const total = quotes.length;

    const pending = quotes.filter((q) => q.status === "PENDING").length;
    const inReview = quotes.filter((q) => q.status === "IN_REVIEW").length;
    const sent = quotes.filter((q) => q.status === "SENT").length;
    const closed = quotes.filter((q) => q.status === "CLOSED").length;

    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;

    const recent = [...quotes]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .slice(0, 5);

    return {
      total,
      pending,
      inReview,
      sent,
      closed,
      pendingPercent,
      recent,
    };
  }, [quotes]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-br-white/70 text-sm tracking-wide">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between animate-fade-up">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight admin-page-title">
            Admin Dashboard
          </h1>
          <p className="text-sm text-br-white/60 mt-2">
            Overview of incoming quotes and their current status.
          </p>
        </div>

        <p className="text-xs text-br-white/50">
          Last update:{" "}
          <span className="font-medium text-br-pearl">
            {new Date().toLocaleString()}
          </span>
        </p>
      </header>

      {/* TOP STATS */}
      <section className="grid gap-5 md:grid-cols-3">
        {/* Total */}
        <div className="admin-card-glow relative overflow-hidden px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Total Quotes
              </p>
              <p className="mt-2 text-4xl font-extrabold text-br-red-main">
                {stats.total}
              </p>
            </div>
            <span className="rounded-full bg-br-red-main/10 px-3 py-1 text-xs font-medium text-br-red-main">
              All time
            </span>
          </div>
        </div>

        {/* Pending */}
        <div className="admin-card-glow relative overflow-hidden px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
                Pending
              </p>
              <p className="mt-2 text-3xl font-extrabold text-br-red-light">
                {stats.pending}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-br-white/60 mb-1">
                {stats.pendingPercent}% of total
              </p>
              {/* progress bar */}
              <div className="h-2 w-24 rounded-full bg-br-smoke-light/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-br-red-main transition-all"
                  style={{ width: `${stats.pendingPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="admin-card-glow relative overflow-hidden px-5 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-br-white/50">
            Status breakdown
          </p>
          <div className="mt-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-br-pearl">In review</span>
              <span className="text-br-white/80 font-semibold">
                {stats.inReview}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-br-pearl">Sent</span>
              <span className="text-br-white/80 font-semibold">
                {stats.sent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-br-pearl">Closed</span>
              <span className="text-br-white/80 font-semibold">
                {stats.closed}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT QUOTES */}
      <section className="admin-card-glow overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-br-pearl">
              Recent Quotes
            </h2>
            <p className="text-xs text-br-white/60">
              The last 5 submissions received by the system.
            </p>
          </div>
          <a
            href="/admin/en/quotes"
            className="text-xs font-medium text-br-red-main hover:text-br-red-light underline underline-offset-4 transition-colors"
          >
            View all
          </a>
        </div>

        {stats.recent.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-br-white/60">
            No quotes have been created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-1 px-4 py-3 text-sm">
              <thead className="text-xs uppercase tracking-wide text-br-white/50">
                <tr>
                  <th className="px-6 py-2 text-left">Customer</th>
                  <th className="px-6 py-2 text-left hidden md:table-cell">
                    Created at
                  </th>
                  <th className="px-6 py-2 text-left">Status</th>
                  <th className="px-6 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((q, idx) => {
                  const badgeClass =
                    q.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                      : q.status === "IN_REVIEW"
                      ? "bg-sky-500/10 text-sky-300 border border-sky-500/40"
                      : q.status === "SENT"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40"
                      : "bg-zinc-500/10 text-zinc-300 border border-zinc-500/40"; // CLOSED / otros

                  return (
                    <tr
                      key={q.id}
                      className="admin-list-item rounded-lg bg-br-smoke/40 hover:bg-br-smoke/70 transition-colors"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <td className="px-6 py-3 text-br-pearl">
                        <div className="font-medium">{q.name}</div>
                        <div className="text-xs text-br-white/50">
                          #{q.id}
                        </div>
                      </td>

                      <td className="px-6 py-3 text-xs text-br-white/60 hidden md:table-cell">
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleString()
                          : "—"}
                      </td>

                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}
                        >
                          {q.status}
                        </span>
                      </td>

                      <td className="px-6 py-3 text-right">
                        <a
                          href={`/admin/en/quotes/${q.id}`}
                          className="text-xs font-medium text-br-red-main hover:text-br-red-light underline underline-offset-4"
                        >
                          View details
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
