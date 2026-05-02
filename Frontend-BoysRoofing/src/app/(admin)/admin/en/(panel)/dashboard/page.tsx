// src/app/admin/en/(panel)/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChartPieIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "@/lib/api";
import { quoteStatusLabel } from "@/lib/quote-status-label";

type Quote = {
  id: number | string;
  name: string;
  status: "PENDING" | "IN_REVIEW" | "SENT" | "CLOSED" | string;
  createdAt?: string;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35";
    case "IN_REVIEW":
      return "bg-sky-500/15 text-sky-200 ring-1 ring-sky-500/35";
    case "SENT":
      return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/35";
    case "CLOSED":
      return "bg-zinc-500/15 text-zinc-200 ring-1 ring-zinc-500/35";
    default:
      return "bg-white/10 text-br-white/80 ring-1 ring-white/15";
  }
}

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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div
          className="h-11 w-11 rounded-full border-2 border-br-red-main/25 border-t-br-red-main animate-spin"
          aria-hidden
        />
        <p className="text-sm text-br-white/55 tracking-wide">Loading dashboard…</p>
      </div>
    );
  }

  const t = stats.total || 0;
  const breakdownRows = [
    { key: "inReview", label: "In review", value: stats.inReview, bar: "bg-sky-400" },
    { key: "sent", label: "Sent", value: stats.sent, bar: "bg-emerald-400" },
    { key: "closed", label: "Closed", value: stats.closed, bar: "bg-zinc-400" },
  ] as const;

  return (
    <div className="space-y-8 p-1 text-white">
      <header className="animate-fade-up rounded-2xl border border-white/10 bg-gradient-to-br from-br-smoke/80 via-br-carbon/50 to-br-smoke/40 p-6 shadow-xl shadow-black/25 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-br-red-main/90">
              Overview
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-br-pearl md:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-br-white/60">
              High-level view of incoming quotes and their status. Figures include your full
              history.
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-br-white/45">
              Last updated
            </p>
            <p className="mt-1 text-sm font-medium tabular-nums text-br-pearl">
              {new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-br-carbon/90 to-br-smoke/35 p-5 shadow-lg shadow-black/20 transition hover:border-white/15">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-br-red-main/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="rounded-xl bg-br-red-main/15 p-2.5 text-br-red-main ring-1 ring-br-red-main/25">
              <DocumentTextIcon className="h-6 w-6" aria-hidden />
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-br-white/50">
              All time
            </span>
          </div>
          <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-br-white/45">
            Total quotes
          </p>
          <p className="relative mt-1 text-4xl font-extrabold tabular-nums text-br-red-main">
            {stats.total}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-br-carbon/90 to-br-smoke/35 p-5 shadow-lg shadow-black/20 transition hover:border-white/15">
          <div className="pointer-events-none absolute -right-6 top-6 h-24 w-24 rounded-full bg-br-red-main/5 blur-xl" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-300 ring-1 ring-amber-500/25">
              <ClockIcon className="h-6 w-6" aria-hidden />
            </div>
          </div>
          <p className="relative mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-br-white/45">
            Pending
          </p>
          <p className="relative mt-1 text-4xl font-extrabold tabular-nums text-br-pearl">
            {stats.pending}
          </p>
          <div className="relative mt-4">
            <div className="mb-1 flex justify-between text-xs text-br-white/55">
              <span>Of total</span>
              <span className="tabular-nums font-medium text-br-white/75">
                {stats.pendingPercent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-br-red-main to-br-red-light transition-all"
                style={{ width: `${stats.pendingPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-br-carbon/90 to-br-smoke/35 p-5 shadow-lg shadow-black/20 transition hover:border-white/15">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl bg-white/10 p-2.5 text-br-pearl ring-1 ring-white/15">
              <ChartPieIcon className="h-6 w-6" aria-hidden />
            </div>
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-br-white/45">
            Status breakdown
          </p>
          <div className="mt-3 space-y-3">
            {breakdownRows.map((row) => {
              const pct = t > 0 ? Math.round((row.value / t) * 100) : 0;
              return (
                <div key={row.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-br-pearl/90">{row.label}</span>
                    <span className="tabular-nums font-semibold text-br-white">{row.value}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${row.bar} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-br-smoke/50 to-br-carbon/30 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-3 border-b border-white/10 bg-gradient-to-r from-br-carbon/80 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6 md:py-5">
          <div>
            <h2 className="text-lg font-semibold text-br-pearl md:text-xl">Recent quotes</h2>
            <p className="mt-1 text-xs text-br-white/55 md:text-sm">
              The five latest submissions, newest first.
            </p>
          </div>
          <Link
            href="/admin/en/quotes"
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-br-red-main/40 bg-br-red-main/10 px-4 py-2 text-sm font-medium text-br-red-main transition hover:bg-br-red-main hover:text-white sm:self-auto"
          >
            View all
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-br-white/55">
            No quotes yet.
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 md:p-6">
            {stats.recent.map((q, idx) => {
              const created = q.createdAt
                ? new Date(q.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—";
              return (
                <article
                  key={q.id}
                  className="admin-list-item flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-br-carbon/55 to-br-smoke/25 p-4 shadow-md shadow-black/15 transition hover:border-br-red-main/25 hover:shadow-lg md:p-5"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-br-pearl">{q.name}</p>
                      <p className="mt-0.5 text-xs text-br-white/45">Quote #{q.id}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(q.status)}`}
                    >
                      {quoteStatusLabel(q.status, "en")}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-br-white/50">
                    <span className="text-br-white/40">Created · </span>
                    {created}
                  </p>
                  <Link
                    href={`/admin/en/quotes/${q.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-br-red-main transition hover:text-br-red-light"
                  >
                    View details
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
