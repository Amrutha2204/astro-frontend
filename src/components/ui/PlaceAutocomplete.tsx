"use client";

import { useState, useRef, useEffect } from "react";
import { astroApi } from "@/services/api";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const DEBOUNCE_MS = 400;

export default function PlaceAutocomplete({
  value,
  onChange,
  placeholder = "e.g. Mumbai, Maharashtra, India or town/village",
  id,
  required,
  disabled,
  className = "",
  "aria-label": ariaLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const q = value.trim();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const run = async () => {
      setLoading(true);
      try {
        const { places } = await astroApi.searchPlaces(q, 15);
        setSuggestions(places.map((p) => p.displayName));
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    if (q.length >= 2) {
      debounceRef.current = setTimeout(run, DEBOUNCE_MS);
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }
    run();
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [open, value]);

  const showList = open && (value.trim().length >= 1 || suggestions.length > 0 || loading);

  useEffect(() => {
    setFocusedIndex(0);
  }, [value, suggestions.length]);

  useEffect(() => {
    if (!showList) {
      return;
    }
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [showList]);

  useEffect(() => {
    if (!showList || !listRef.current) {
      return;
    }
    const el = listRef.current.children[focusedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [showList, focusedIndex]);

  const handleSelect = (place: string) => {
    onChange(place);
    setOpen(false);
    setFocusedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showList) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
      return;
    }
    if (e.key === "Enter" && suggestions[focusedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[focusedIndex]);
      return;
    }
  };

  return (
    <div
      ref={wrapRef}
      role="combobox"
      aria-expanded={showList}
      aria-haspopup="listbox"
      aria-controls="place-list"
      className={`relative mb-4 w-full ${className}`}
    >
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        aria-label={ariaLabel ?? "Birth place (city, town or village)"}
        aria-autocomplete="list"
        aria-controls={showList ? "place-list" : undefined}
        aria-activedescendant={
          showList && suggestions[focusedIndex] ? `place-option-${focusedIndex}` : undefined
        }
        className="min-h-[46px] w-full rounded-[14px] border border-[#d4c4a8] bg-[linear-gradient(to_bottom,#fffefc_0%,#faf8f4_100%)] px-[14px] py-[11px] text-[15px] font-medium text-[var(--text-main)] shadow-[0_1px_2px_rgba(107,68,35,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] transition-[border-color,box-shadow] duration-200 ease-in-out hover:border-[#b8a078] hover:shadow-[0_2px_6px_rgba(107,68,35,0.1),inset_0_1px_0_rgba(255,255,255,0.6)] focus:border-[var(--accent)] focus:bg-[#fffefc] focus:outline-none focus:shadow-[0_0_0_3px_rgba(107,68,35,0.2),0_1px_3px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]"
      />
      {showList && (
        <ul
          id="place-list"
          ref={listRef}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-[1000] max-h-80 overflow-y-auto rounded-[14px] border border-[#d4c4a8] bg-[#fffefc] py-2 shadow-[0_10px_40px_rgba(107,68,35,0.15),0_2px_12px_rgba(0,0,0,0.08)]"
          aria-label="Place suggestions"
        >
          {loading && suggestions.length === 0 ? (
            <li
              className="px-4 py-3 text-[14px] text-[#6b5b52]"
              role="option"
              aria-selected="false"
            >
              Searching…
            </li>
          ) : suggestions.length === 0 ? (
            <li
              className="px-4 py-3 text-[14px] text-[#6b5b52]"
              role="option"
              aria-selected="false"
            >
              Type a city, town or village name. You can use the place as-is; we’ll use it for
              coordinates.
            </li>
          ) : (
            suggestions.map((place, i) => (
              <li
                key={`${i}-${place}`}
                role="option"
                id={`place-option-${i}`}
                aria-selected={i === focusedIndex}
              >
                <button
                  type="button"
                  className={`block w-full break-words whitespace-normal bg-transparent px-4 py-[10px] text-left text-[14px] leading-[1.4] text-[#2d2a26] transition-colors duration-150 ${i === focusedIndex ? "bg-[#f5f0e8] text-[#6b4423]" : "hover:bg-[#f5f0e8] hover:text-[#6b4423]"}`}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onClick={() => handleSelect(place)}
                  title={place}
                >
                  {place}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
