/** Etiquetas guardadas como rango ISO o timestamps crudos: mostrar rango legible en su lugar. */
export function isTechnicalPayrollLabel(label: string | null | undefined): boolean {
  if (!label?.trim()) return false;
  const s = label.trim();
  if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(s)) return true;
  if (/^\d{4}-\d{2}-\d{2}\s*[–—-]\s*\d{4}-\d{2}-\d{2}/.test(s)) return true;
  return false;
}

export function formatPayrollPeriodRange(startDate: string, endDate: string, locale: string): string {
  if (!startDate || !endDate) return "";
  const start = new Date(startDate.includes("T") ? startDate : `${startDate}T12:00:00`);
  const end = new Date(endDate.includes("T") ? endDate : `${endDate}T12:00:00`);
  const o: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${start.toLocaleDateString(locale, o)} – ${end.toLocaleDateString(locale, o)}`;
}

export function displayPayrollPeriodTitle(
  label: string | null | undefined,
  startDate: string,
  endDate: string,
  locale: string,
): string {
  if (label?.trim() && !isTechnicalPayrollLabel(label)) return label.trim();
  return formatPayrollPeriodRange(startDate, endDate, locale);
}

export function defaultPayrollPeriodLabel(startDate: string, endDate: string, locale: string): string {
  return formatPayrollPeriodRange(startDate, endDate, locale);
}

export type PayrollPeriodLike = {
  startDate: string;
  endDate: string;
  label?: string | null;
  totalPaid?: number | null;
  entries?: { amountPaid: number }[];
};

export function periodAmountPaid(p: PayrollPeriodLike): number {
  return p.totalPaid ?? p.entries?.reduce((s, e) => s + e.amountPaid, 0) ?? 0;
}

function monthKeyFromStart(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthHeading(monthKey: string, locale: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export type MonthlyPayrollRow = {
  monthKey: string;
  heading: string;
  totalPaid: number;
  periodCount: number;
};

export function buildMonthlyPayrollReport(periods: PayrollPeriodLike[], locale: string): MonthlyPayrollRow[] {
  const byMonth = new Map<string, { total: number; count: number }>();
  for (const p of periods) {
    const key = monthKeyFromStart(p.startDate);
    const paid = periodAmountPaid(p);
    const cur = byMonth.get(key) ?? { total: 0, count: 0 };
    cur.total += paid;
    cur.count += 1;
    byMonth.set(key, cur);
  }
  const keys = [...byMonth.keys()].sort().reverse();
  return keys.map((monthKey) => ({
    monthKey,
    heading: formatMonthHeading(monthKey, locale),
    totalPaid: byMonth.get(monthKey)!.total,
    periodCount: byMonth.get(monthKey)!.count,
  }));
}

export function groupPayrollPeriodsByMonth<T extends PayrollPeriodLike>(
  periods: T[],
  locale: string,
): { monthKey: string; heading: string; periods: T[] }[] {
  const map = new Map<string, T[]>();
  for (const p of periods) {
    const key = monthKeyFromStart(p.startDate);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  const keys = [...map.keys()].sort().reverse();
  return keys.map((monthKey) => ({
    monthKey,
    heading: formatMonthHeading(monthKey, locale),
    periods: map.get(monthKey)!,
  }));
}
