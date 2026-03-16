"use client";

import { useState, useRef, useEffect } from "react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseDate(value: string): { y: number; m: number; d: number } | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return { y, m: m - 1, d };
}

function toValue(y: number, m: number, d: number): string {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function formatDisplay(value: string): string {
  const p = parseDate(value);
  if (!p) return "";
  return `${String(p.d).padStart(2, "0")}/${String(p.m + 1).padStart(2, "0")}/${p.y}`;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inline?: boolean;
  "aria-label"?: string;
};

export default function DatePickerField({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  id,
  name,
  required,
  disabled,
  className = "",
  inline,
  "aria-label": ariaLabel,
}: Props) {
  const inputName = name ?? id;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const p = parseDate(value);
    if (p) return { y: p.y, m: p.m };
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = parseDate(value);
    if (p) setView({ y: p.y, m: p.m });
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const current = parseDate(value);
  const first = new Date(view.y, view.m, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleSelect = (d: number) => {
    onChange(toValue(view.y, view.m, d));
    setOpen(false);
  };

  const prevMonth = () => {
    if (view.m === 0) setView({ y: view.y - 1, m: 11 });
    else setView({ y: view.y, m: view.m - 1 });
  };

  const nextMonth = () => {
    if (view.m === 11) setView({ y: view.y + 1, m: 0 });
    else setView({ y: view.y, m: view.m + 1 });
  };

  const displayVal = value ? formatDisplay(value) : "";
  const wrapClass = inline ? "mb-0 inline-block min-w-[140px] w-auto" : "mb-4 w-full";

  return (
    <div ref={wrapRef} className={`relative ${wrapClass} ${className}`}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? "Choose date"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="min-h-[46px] w-full cursor-pointer rounded-[14px] border border-[#d4c4a8] bg-[#fefcf8] px-[14px] py-[11px] pl-[44px] text-[15px] font-medium text-[var(--text-main)] shadow-[0_1px_2px_rgba(107,68,35,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[border-color,box-shadow] duration-200 ease-in-out hover:border-[#b8a078] hover:shadow-[0_2px_6px_rgba(107,68,35,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]"
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) setOpen((o) => !o);
          }
        }}
      >
        {displayVal || placeholder}
      </div>
      <input
        type="hidden"
        id={id}
        name={inputName}
        value={value}
        required={required}
        disabled={disabled}
        readOnly
        aria-hidden
      />
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--accent)]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[1000] min-w-[280px] rounded-[14px] border border-[#d4c4a8] bg-[#fffefc] p-4 shadow-[0_10px_40px_rgba(107,68,35,0.15),0_2px_12px_rgba(0,0,0,0.08)]"
          role="dialog"
          aria-modal="true"
          aria-label="Calendar"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f5f0e8] text-[18px] leading-none text-[#6b4423] transition-colors duration-200 hover:bg-[#e8dfd2] hover:text-[#5c3a1f]"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              &lsaquo;
            </button>
            <span className="text-[15px] font-semibold text-[#2d2a26]">
              {MONTHS[view.m]} {view.y}
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f5f0e8] text-[18px] leading-none text-[#6b4423] transition-colors duration-200 hover:bg-[#e8dfd2] hover:text-[#5c3a1f]"
              onClick={nextMonth}
              aria-label="Next month"
            >
              &rsaquo;
            </button>
          </div>
          <div className="mb-[6px] grid grid-cols-7 gap-[2px]">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 text-center text-[11px] font-semibold text-[#6b5b52]">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[2px]">
            {days.map((d, i) => {
              if (d === null) return <span key={`e-${i}`} />;
              const isToday =
                view.y === new Date().getFullYear() &&
                view.m === new Date().getMonth() &&
                d === new Date().getDate();
              const isSelected =
                current && current.y === view.y && current.m === view.m && current.d === d;
              return (
                <button
                  key={d}
                  type="button"
                  className={`flex h-9 w-9 items-center justify-center rounded-[10px] border-none text-[14px] text-[#2d2a26] transition-colors duration-150 ${isSelected ? "bg-[var(--accent)] font-semibold text-white hover:bg-[#5c3a1f]" : isToday ? "bg-[#f0ebe3] font-semibold text-[#6b4423]" : "bg-transparent hover:bg-[#f5f0e8] hover:text-[#6b4423]"}`}
                  onClick={() => handleSelect(d)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
