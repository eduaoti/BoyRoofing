"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { apiFetch } from "@/lib/api";
import { ToastMessage, type ToastType } from "@/components/ToastMessage";
import {
  buildMonthlyPayrollReport,
  defaultPayrollPeriodLabel,
  displayPayrollPeriodTitle,
  formatPayrollPeriodRange,
  groupPayrollPeriodsByMonth,
  isTechnicalPayrollLabel,
  periodAmountPaid,
} from "@/lib/payroll-display";
import { buildPayrollReportCsv, downloadPayrollReportCsv } from "@/lib/payroll-report-csv";
import { PayrollPeriodRangeCalendar } from "@/components/PayrollPeriodRangeCalendar";

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
  const [rangeOpen, setRangeOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState<string | null>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const [pickerView, setPickerView] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

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

  useEffect(() => {
    if (!rangeOpen) return;
    function onDocClick(e: MouseEvent) {
      if (rangeRef.current && !rangeRef.current.contains(e.target as Node)) setRangeOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [rangeOpen]);

  function createPeriod(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    apiFetch("/payroll/periods", {
      method: "POST",
      body: JSON.stringify({
        startDate,
        endDate,
        label: label.trim() || defaultPayrollPeriodLabel(startDate, endDate, "en-US"),
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

  function formatRangeLabel(s: string, e: string) {
    if (!s || !e) return "Select start and end date";
    const start = new Date(s + "T12:00:00");
    const end = new Date(e + "T12:00:00");
    return start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) + " – " + end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function handleRangeDayClick(dayStr: string) {
    if (!pendingStart) {
      setStartDate(dayStr);
      setEndDate(dayStr);
      setPendingStart(dayStr);
    } else {
      const a = pendingStart;
      const b = dayStr;
      if (a <= b) {
        setStartDate(a);
        setEndDate(b);
      } else {
        setStartDate(b);
        setEndDate(a);
      }
      setPendingStart(null);
      setRangeOpen(false);
    }
  }

  function toggleRangePicker() {
    setRangeOpen((o) => {
      const next = !o;
      if (next) {
        const base = startDate ? new Date(startDate + "T12:00:00") : new Date();
        setPickerView({ y: base.getFullYear(), m: base.getMonth() });
      }
      setPendingStart(null);
      return next;
    });
  }

  function pickerPrevMonth() {
    setPickerView(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }));
  }

  function pickerNextMonth() {
    setPickerView(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }));
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

  const locale = "en-US";
  const monthlyReport = useMemo(() => buildMonthlyPayrollReport(periods, locale), [periods]);
  const periodsByMonth = useMemo(() => groupPayrollPeriodsByMonth(periods, locale), [periods]);

  function exportPayrollCsv() {
    const csv = buildPayrollReportCsv(periods, locale, {
      monthKeyHeader: "Month key (YYYY-MM)",
      monthLabelHeader: "Month",
      totalPaidHeader: "Total paid",
      periodCountHeader: "Payroll periods",
      idHeader: "Period ID",
      nameHeader: "Name",
      startHeader: "Start date",
      endHeader: "End date",
      statusHeader: "Status",
      amountPaidHeader: "Amount paid",
    });
    const stamp = new Date().toISOString().slice(0, 10);
    downloadPayrollReportCsv(`payroll-report-${stamp}.csv`, csv);
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
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="relative sm:col-span-2" ref={rangeRef}>
                  <label className="block text-sm text-br-white/70">Date range</label>
                  <button
                    type="button"
                    onClick={toggleRangePicker}
                    className="mt-1 flex w-full items-center justify-between rounded border border-br-smoke-light bg-br-carbon px-3 py-2.5 text-left text-sm text-white"
                  >
                    <span className={startDate && endDate ? "" : "text-br-white/50"}>{formatRangeLabel(startDate, endDate)}</span>
                    <CalendarDaysIcon className="h-5 w-5 shrink-0 text-br-pearl/80" />
                  </button>
                  {rangeOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-white/10 bg-br-carbon p-3 shadow-xl">
                      <PayrollPeriodRangeCalendar
                        locale="en-US"
                        weekDayLabels={["S", "M", "T", "W", "T", "F", "S"]}
                        helperText="Choose start date, then end date. Use arrows to change month (ranges can span two months)."
                        prevMonthAria="Previous month"
                        nextMonthAria="Next month"
                        viewYear={pickerView.y}
                        viewMonth={pickerView.m}
                        onPrevMonth={pickerPrevMonth}
                        onNextMonth={pickerNextMonth}
                        startDate={startDate}
                        endDate={endDate}
                        pendingStart={pendingStart}
                        onDayClick={handleRangeDayClick}
                      />
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-br-white/70">Label (optional)</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Week 3 – crew A (defaults to date range)"
                    className="mt-1 w-full rounded border border-br-smoke-light bg-br-carbon px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !startDate || !endDate}
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

      {monthlyReport.length > 0 && (
        <div className="admin-card-glow overflow-hidden animate-fade-up">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-br-pearl">Monthly totals (paid)</h2>
            <button
              type="button"
              onClick={exportPayrollCsv}
              className="shrink-0 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-br-pearl hover:bg-white/10 transition"
            >
              Download CSV
            </button>
          </div>
          <p className="px-5 pt-3 text-xs text-br-white/50">
            Sum of “Paid” per payroll period, grouped by the period start month.
          </p>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {monthlyReport.map((row) => (
              <div
                key={row.monthKey}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-br-carbon/70 to-br-smoke/40 px-4 py-4 shadow-lg shadow-black/20"
              >
                <div className="text-sm font-medium capitalize text-br-pearl">{row.heading}</div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-white">
                  ${row.totalPaid.toFixed(2)}
                </div>
                <div className="mt-1 text-xs text-br-white/45">
                  {row.periodCount} period{row.periodCount !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-br-pearl">Payroll history</h2>
        {periods.length === 0 ? (
          <div className="admin-card-glow rounded-2xl px-5 py-12 text-center text-br-white/50">
            No periods yet. Create one to get started.
          </div>
        ) : (
          periodsByMonth.map((group) => (
            <section
              key={group.monthKey}
              className="admin-card-glow overflow-hidden rounded-2xl border border-white/10"
            >
              <div className="border-b border-white/10 bg-gradient-to-r from-br-carbon/90 via-br-smoke/50 to-br-carbon/80 px-5 py-3.5">
                <h3 className="text-base font-semibold capitalize text-br-pearl">{group.heading}</h3>
                <p className="mt-0.5 text-xs text-br-white/45">
                  {group.periods.length} period{group.periods.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="p-4 md:p-5">
                <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-2">
                  {group.periods.map((p, idx) => {
                    const totalPaid = periodAmountPaid(p);
                    const title = displayPayrollPeriodTitle(p.label, p.startDate, p.endDate, locale);
                    const rangeLine = formatPayrollPeriodRange(p.startDate, p.endDate, locale);
                    const showRangeUnderTitle =
                      Boolean(p.label?.trim()) &&
                      !isTechnicalPayrollLabel(p.label) &&
                      rangeLine !== title;
                    return (
                      <article
                        key={p.id}
                        className="admin-list-item flex flex-col gap-3 rounded-xl border border-white/10 bg-gradient-to-br from-br-carbon/50 to-br-smoke/30 p-4 shadow-md shadow-black/10 transition-colors hover:border-br-red-main/25"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/en/payroll/periods/${p.id}`}
                              className="font-semibold text-br-pearl hover:text-br-red-main transition-colors"
                            >
                              {title}
                            </Link>
                            {statusBadge(p.status)}
                          </div>
                          {showRangeUnderTitle ? (
                            <p className="mt-1.5 text-xs text-br-white/45">{rangeLine}</p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3 text-sm">
                          <span className="tabular-nums font-medium text-br-white/85">
                            Paid: ${Number(totalPaid).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/admin/en/payroll/periods/${p.id}`}
                              className="text-br-red-main hover:text-br-red-light text-sm font-medium transition-colors"
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
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
