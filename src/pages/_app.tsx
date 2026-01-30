import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { Provider, useStore } from "react-redux";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const err = event.error;
      if (err?.response?.status || err?.message?.includes("Request failed")) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };
    const handleRejection = (event: PromiseRejectionEvent) => {
      const r = event.reason;
      if (r?.response?.status || r?.message?.includes("Request failed")) {
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
    <>
      <Component {...pageProps} />
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
