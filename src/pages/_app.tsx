import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { Provider, useStore } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import { rehydrate } from "@/store/slices/authSlice";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

function RehydrateAuth() {
  const s = useStore();
  useEffect(() => {
    const t = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
    s.dispatch(rehydrate({ token: t }));
  }, [s]);
  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const err = event.error;
      if (err?.message?.includes?.("Request failed")) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const r = event.reason;
      if (r?.message?.includes?.("Request failed")) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);
    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return (
    <Provider store={store}>
      <Head>
        <title>Jyotishya Darshan – Vedic Horoscope & Kundli</title>
        <meta name="description" content="Vedic horoscope, Kundli, Dasha, Dosha check, marriage match, and Panchang. Try free without login." />
      </Head>
      <RehydrateAuth />
      <LanguageProvider>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </LanguageProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#ffffff",
            color: "#374151",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderLeft: "4px solid",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#ffffff" },
            style: { borderLeftColor: "#10b981" },
          },
          error: {
            iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
            style: { borderLeftColor: "#dc2626" },
          },
        }}
      />
    </Provider>
  );
}