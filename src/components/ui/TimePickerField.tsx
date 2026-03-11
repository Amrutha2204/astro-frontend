"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/styles/picker.module.css";

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
  if (s !== 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${inline ? styles.wrapInline : ""} ${className}`}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel ?? "Choose time"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={styles.input}
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
      <svg className={styles.inputIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="6" x2="12" y2="12" />
        <line x1="16" y1="14" x2="12" y2="12" />
      </svg>

      {open && (
        <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Time picker">
          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>Hour</span>
            <input
              type="number"
              className={styles.timeInput}
              min={0}
              max={23}
              value={local.h}
              onChange={(e) => setLocal((p) => ({ ...p, h: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
            />
            <span className={styles.timeSeparator}>:</span>
            <span className={styles.timeLabel}>Min</span>
            <input
              type="number"
              className={styles.timeInput}
              min={0}
              max={59}
              value={local.m}
              onChange={(e) => setLocal((p) => ({ ...p, m: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
            />
            {withSeconds && (
              <>
                <span className={styles.timeSeparator}>:</span>
                <span className={styles.timeLabel}>Sec</span>
                <input
                  type="number"
                  className={styles.timeInput}
                  min={0}
                  max={59}
                  value={local.s}
                  onChange={(e) => setLocal((p) => ({ ...p, s: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)) }))}
                />
              </>
            )}
          </div>
          <button type="button" className={styles.timeOk} onClick={handleApply}>
            OK
          </button>
        </div>
      )}
    </div>
  );
}
