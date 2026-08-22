"use client";

// A single animated calendar component used everywhere the app needs a
// date (or month) picker, replacing the browser's plain native
// <input type="date">/<input type="month"> — per the client's reference
// screenshot: a popover calendar with month/year navigation chevrons and
// explicit Cancel / Apply buttons, rather than the OS's own date widget
// (which looks and behaves differently on every browser/OS and can't be
// themed to match the rest of the app).
import { useEffect, useRef, useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function parseYmd(value: string): Date | null {
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseYm(value: string): Date | null {
  const parts = value.split("-");
  if (parts.length !== 2) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatYm(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function ChevronIcon({ double, flip }: { double?: boolean; flip?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-4 w-4 ${flip ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      {double ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 19l-7-7 7-7M11 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      )}
    </svg>
  );
}

type Props = {
  value: string; // "yyyy-mm-dd" for mode="date", "yyyy-mm" for mode="month"
  onChange: (val: string) => void;
  mode?: "date" | "month";
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function CustomDatePicker({ value, onChange, mode = "date", placeholder, className = "", required }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (mode === "date" ? parseYmd(value) : parseYm(value)) ?? new Date());
  const [tempDay, setTempDay] = useState<Date | null>(mode === "date" ? parseYmd(value) : null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const current = (mode === "date" ? parseYmd(value) : parseYm(value)) ?? new Date();
    setViewDate(current);
    setTempDay(mode === "date" ? parseYmd(value) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const gotoMonth = (delta: number) => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  const gotoYear = (delta: number) => setViewDate((d) => new Date(d.getFullYear() + delta, d.getMonth(), 1));

  const displayValue = () => {
    if (!value) return placeholder ?? (mode === "date" ? "dd-mm-yyyy" : "Select month");
    if (mode === "month") {
      const d = parseYm(value);
      return d ? `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}` : value;
    }
    const d = parseYmd(value);
    return d ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` : value;
  };

  const handleApplyMonth = () => {
    onChange(formatYm(viewDate));
    setIsOpen(false);
  };

  const handleApplyDay = () => {
    if (tempDay) onChange(formatYmd(tempDay));
    setIsOpen(false);
  };

  // Day grid for mode="date"
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const adjustedStartDay = startDay === 0 ? 6 : startDay - 1;
  const prevMonthDays = new Date(viewDate.getFullYear(), viewDate.getMonth(), 0).getDate();
  const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
  for (let i = adjustedStartDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, prevMonthDays - i) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false, date: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i) });
  }
  const today = new Date();

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        aria-required={required}
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-left focus:ring-2 focus:ring-orange-500 outline-none transition-colors text-sm"
      >
        <span className={value ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>{displayValue()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => gotoYear(-1)} className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" title="Previous year">
              <ChevronIcon double />
            </button>
            {mode === "date" && (
              <button type="button" onClick={() => gotoMonth(-1)} className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" title="Previous month">
                <ChevronIcon />
              </button>
            )}
            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              {mode === "date" ? `${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getFullYear()}` : viewDate.getFullYear()}
            </span>
            {mode === "date" && (
              <button type="button" onClick={() => gotoMonth(1)} className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" title="Next month">
                <ChevronIcon flip />
              </button>
            )}
            <button type="button" onClick={() => gotoYear(1)} className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800" title="Next year">
              <ChevronIcon double flip />
            </button>
          </div>

          {mode === "date" ? (
            <>
              <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
                {DAY_NAMES.map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => {
                  const isSelected = tempDay && tempDay.getDate() === d.date.getDate() && tempDay.getMonth() === d.date.getMonth() && tempDay.getFullYear() === d.date.getFullYear();
                  const isToday = today.getDate() === d.date.getDate() && today.getMonth() === d.date.getMonth() && today.getFullYear() === d.date.getFullYear();
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setTempDay(d.date)}
                      className={`h-9 rounded-lg text-sm transition-colors ${
                        isSelected
                          ? "bg-orange-600 text-white font-semibold"
                          : !d.isCurrentMonth
                          ? "text-gray-300 dark:text-gray-700"
                          : isToday
                          ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {MONTH_NAMES.map((name, i) => {
                const isSelected = value && parseYm(value)?.getMonth() === i && parseYm(value)?.getFullYear() === viewDate.getFullYear();
                return (
                  <button
                    type="button"
                    key={name}
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), i, 1))}
                    className={`py-2.5 rounded-lg text-sm transition-colors ${
                      isSelected ? "bg-orange-600 text-white font-semibold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={mode === "date" ? handleApplyDay : handleApplyMonth}
              className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-semibold text-sm hover:bg-orange-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
