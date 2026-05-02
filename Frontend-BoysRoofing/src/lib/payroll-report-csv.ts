import {
  buildMonthlyPayrollReport,
  displayPayrollPeriodTitle,
  periodAmountPaid,
  type PayrollPeriodLike,
} from "./payroll-display";

function csvCell(v: string | number): string {
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export type PayrollReportCsvLabels = {
  monthKeyHeader: string;
  monthLabelHeader: string;
  totalPaidHeader: string;
  periodCountHeader: string;
  idHeader: string;
  nameHeader: string;
  startHeader: string;
  endHeader: string;
  statusHeader: string;
  amountPaidHeader: string;
};

export type PayrollPeriodForExport = PayrollPeriodLike & { id?: number; status?: string };

function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

/** CSV con resumen mensual y listado de periodos (UTF-8 con BOM para Excel). */
export function buildPayrollReportCsv(
  periods: PayrollPeriodForExport[],
  locale: string,
  labels: PayrollReportCsvLabels,
): string {
  const lines: string[] = [];
  lines.push(
    [
      labels.monthKeyHeader,
      labels.monthLabelHeader,
      labels.totalPaidHeader,
      labels.periodCountHeader,
    ]
      .map(csvCell)
      .join(","),
  );
  for (const row of buildMonthlyPayrollReport(periods, locale)) {
    lines.push(
      [row.monthKey, row.heading, row.totalPaid.toFixed(2), String(row.periodCount)]
        .map((x) => csvCell(x))
        .join(","),
    );
  }
  lines.push("");
  lines.push(
    [
      labels.idHeader,
      labels.nameHeader,
      labels.startHeader,
      labels.endHeader,
      labels.statusHeader,
      labels.amountPaidHeader,
    ]
      .map(csvCell)
      .join(","),
  );
  const sorted = [...periods].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  for (const p of sorted) {
    const id = p.id != null ? String(p.id) : "";
    const name = displayPayrollPeriodTitle(p.label, p.startDate, p.endDate, locale);
    lines.push(
      [id, name, dateOnly(p.startDate), dateOnly(p.endDate), p.status ?? "", periodAmountPaid(p).toFixed(2)]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\r\n");
}

export function downloadPayrollReportCsv(filename: string, csvContent: string): void {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
