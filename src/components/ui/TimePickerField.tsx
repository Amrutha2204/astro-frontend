"use client";

import { useState, useRef, useEffect } from "react";

function parseTime(value: string): { h: number; m: number; s: number } {
  const parts = (value || "00:00").split(":");
  const h = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0));
  const m = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
  const s = Math.min(59, Math.max(0, parseInt(parts[2], 10) || 0));
  return { h, m, s };
}

function toValue(h: number, m: number, s: number, withSeconds: boolean): string {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  if (withSeconds) return `${hh}:${mm}:${String(s).padStart(2, "0")}`;
  return `${hh}:${mm}`;
}

function formatDisplay(value: string): string {
  if (!value) return "";
  const { h, m, s } = parseTime(value);
  if (s !== 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  step?: number;
  className?: string;
  inline?: boolean;
  "aria-label"?: string;
};

export default function TimePickerField({
  value,
  onChange,
  placeholder = "--:--",
  id,
  name,
  required,
  disabled,
  step = 1,
  className = "",
  inline,
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(() => parseTime(value));
  const wrapRef = useRef<HTMLDivElement>(null);
  const withSeconds = step === 1 || value.split(":").length > 2;

  useEffect(() => {
    setLocal(parseTime(value));
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

  const handleApply = () => {
    onChange(toValue(local.h, local.m, local.s, withSeconds));
    setOpen(false);
  };

  const displayVal = value ? formatDisplay(value) : "";
  const inputName = name ?? id;
  const wrapClass = inline ? "mb-0 inline-block min-w-[140px] w-auto" : "mb-4 w-full";

  return (
    <div ref={wrapRef} className={`relative ${wrapClass} ${className}`}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? "Choose time"}
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="6" x2="12" y2="12" />
        <line x1="16" y1="14" x2="12" y2="12" />
      </svg>

      {open && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] z-[1000] min-w-[280px] rounded-[14px] border border-[#d4c4a8] bg-[#fffefc] p-4 shadow-[0_10px_40px_rgba(107,68,35,0.15),0_2px_12px_rgba(0,0,0,0.08)]"
          role="dialog"
          aria-modal="true"
          aria-label="Time picker"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="min-w-[56px] text-[13px] font-semibold text-[#6b5b52]">Hour</span>
            <input
              type="number"
              className="w-16 rounded-[10px] border border-[#d4c4a8] bg-[#fefcf8] px-[10px] py-2 text-center text-[15px] focus:border-[var(--accent)] focus:outline-none"
              min={0}
              max={23}
              value={local.h}
              onChange={(e) =>
                setLocal((p) => ({
                  ...p,
                  h: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)),
                }))
              }
            />
            <span className="text-[18px] font-semibold text-[#6b5b52]">:</span>
            <span className="min-w-[56px] text-[13px] font-semibold text-[#6b5b52]">Min</span>
            <input
              type="number"
              className="w-16 rounded-[10px] border border-[#d4c4a8] bg-[#fefcf8] px-[10px] py-2 text-center text-[15px] focus:border-[var(--accent)] focus:outline-none"
              min={0}
              max={59}
              value={local.m}
              onChange={(e) =>
                setLocal((p) => ({
                  ...p,
                  m: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                }))
              }
            />
            {withSeconds && (
              <>
                <span className="text-[18px] font-semibold text-[#6b5b52]">:</span>
                <span className="text-[18px] font-semibold text-[#6b5b52]">:</span>
                <span className="min-w-[56px] text-[13px] font-semibold text-[#6b5b52]">Sec</span>
                <input
                  type="number"
                  className="w-16 rounded-[10px] border border-[#d4c4a8] bg-[#fefcf8] px-[10px] py-2 text-center text-[15px] focus:border-[var(--accent)] focus:outline-none"
                  min={0}
                  max={59}
                  value={local.s}
                  onChange={(e) =>
                    setLocal((p) => ({
                      ...p,
                      s: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)),
                    }))
                  }
                />
              </>
            )}
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-[10px] bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-4 py-[10px] text-[14px] font-semibold text-white transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(107,68,35,0.3)]"
            onClick={handleApply}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
