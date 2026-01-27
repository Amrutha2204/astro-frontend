import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Prevent Next.js error overlay for axios errors and 401 errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      // Check if it's an axios error
      if (error?.isAxiosError || error?.response?.status) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      // Check if error message contains axios-related text
      if (error?.message?.includes('status code 401') || 
          error?.message?.includes('Request failed') ||
          error?.message?.includes('AxiosError')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Prevent unhandled promise rejections from showing error overlay
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // Check if it's an axios error
      if (reason?.isAxiosError || reason?.response?.status) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
      
      // Check if error message contains axios-related text
      if (reason?.message?.includes('status code 401') || 
          reason?.message?.includes('Request failed') ||
          reason?.message?.includes('AxiosError')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Override console.error to catch axios errors
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const firstArg = args[0];
      if (firstArg?.isAxiosError || 
          firstArg?.response?.status ||
          (typeof firstArg === 'string' && firstArg.includes('AxiosError'))) {
        // Don't log axios errors to console in a way that triggers Next.js overlay
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener("error", handleError, true); // Use capture phase
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
      console.error = originalConsoleError;
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
            background: '#ffffff',
            color: '#374151',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            borderLeft: '4px solid',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
            style: {
              borderLeftColor: '#10b981',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
            style: {
              borderLeftColor: '#dc2626',
            },
          },
        }}
      />
    </>
  );
}
