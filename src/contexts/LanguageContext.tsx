"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Locale, getTranslation } from "@/translations";

const STORAGE_KEY = "astro-locale";

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const defaultContext: LanguageContextType = {
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Locale | null;
    if (stored === "hi" || stored === "en") setLocaleState(stored);
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback((key: string) => getTranslation(locale, key), [locale]);

  const value: LanguageContextType = mounted ? { locale, setLocale, t } : defaultContext;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? defaultContext;
}
