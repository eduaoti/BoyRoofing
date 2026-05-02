"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export type PayrollPeriodRangeCalendarProps = {
  locale: string;
  weekDayLabels: string[];
  helperText: string;
  prevMonthAria: string;
  nextMonthAria: string;
  viewYear: number;
  viewMonth: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  startDate: string;
  endDate: string;
  pendingStart: string | null;
  onDayClick: (isoDay: string) => void;
};

export function PayrollPeriodRangeCalendar({
  locale,
  weekDayLabels,
  helperText,
  prevMonthAria,
  nextMonthAria,
  viewYear,
  viewMonth,
  onPrevMonth,
  onNextMonth,
  startDate,
  endDate,
  pendingStart,
  onDayClick,
}: PayrollPeriodRangeCalendarProps) {
  const first = new Date(viewYear, viewMonth, 1);
  const last = new Date(viewYear, viewMonth + 1, 0);
  const offset = first.getDay();
  const daysInMonth = last.getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dateStr);
  }

  const isInRange = (d: string | null) => {
    if (!d || !startDate || !endDate) return false;
    return d >= startDate && d <= endDate;
  };
  const isSelected = (d: string | null) => d === startDate || d === endDate || d === pendingStart;

  const monthTitle = first.toLocaleDateString(locale, { month: "long", year: "numeric" });

  return (
    <div className="min-w-[280px]">
      <p className="mb-2 text-xs text-br-white/60">{helperText}</p>
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrevMonth();
          }}
          className="rounded-lg p-1.5 text-br-pearl hover:bg-white/10 transition"
          aria-label={prevMonthAria}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <span className="min-w-0 flex-1 text-center text-sm font-semibold capitalize text-br-pearl">
          {monthTitle}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNextMonth();
          }}
          className="rounded-lg p-1.5 text-br-pearl hover:bg-white/10 transition"
          aria-label={nextMonthAria}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
        {weekDayLabels.map((w, i) => (
          <div key={`${w}-${i}`} className="py-1 font-medium text-br-white/50">
            {w}
          </div>
        ))}
        {cells.map((d, i) =>
          d ? (
            <button
              key={d}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDayClick(d);
              }}
              className={`h-8 rounded text-sm transition ${
                isSelected(d)
                  ? "bg-br-red-main text-white"
                  : isInRange(d)
                    ? "bg-br-red-main/30 text-white"
                    : "text-br-pearl hover:bg-white/10"
              }`}
            >
              {new Date(d + "T12:00:00").getDate()}
            </button>
          ) : (
            <div key={`e-${i}`} />
          ),
        )}
      </div>
    </div>
  );
}
