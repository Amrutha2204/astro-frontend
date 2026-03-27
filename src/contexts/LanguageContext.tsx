"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { type Locale, getTranslation } from "@/translations";

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
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    return stored === "hi" || stored === "en" ? stored : "en";
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback((key: string) => getTranslation(locale, key), [locale]);

  const value: LanguageContextType = { locale, setLocale, t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return ctx ?? defaultContext;
}
