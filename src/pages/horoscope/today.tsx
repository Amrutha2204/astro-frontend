import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { horoscopeApi } from "@/services/horoscopeService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";

const REDIRECT_DELAY_MS = 2000;

type DailyHoroscope = {
  date?: string;
  dayType?: "Good" | "Challenging" | string;
  mainTheme?: string;
  reason?: string;
  doAvoid?: string;
  goodTime?: string;
};

export default function DailyHoroscopePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [horoscope, setHoroscope] = useState<DailyHoroscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageClass = "min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]";
  const contentClass = "flex w-full";
  const mainClass =
    "ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]";
  const containerClass = "relative mx-auto max-w-[1200px]";
  const sectionTitleClass =
    "mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]";
  const fetchHoroscope = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await horoscopeApi.getDailyHoroscope(t);
      setHoroscope(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Daily Horoscope";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error(
          "Backend service may not be running. Please start astro-service on port 8002",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchHoroscope();
  }, [rehydrated, token, dispatch, router, fetchHoroscope]);

  if (error) {
    return (
      <div className={pageClass}>
        <AppHeader />
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <div className={containerClass}>
              <h1 className={sectionTitleClass}>🌙 Daily Horoscope</h1>
              <ErrorMessage message={error} />
              <div className="mt-5 flex gap-3">
                <button
                  onClick={fetchHoroscope}
                  className="rounded-[14px] bg-[linear-gradient(135deg,#6b4423,#8c5a30)] px-[26px] py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="rounded-[14px] border border-[#d4a574] bg-white px-[26px] py-3 text-[15px] font-semibold text-[#6b4423] transition-colors duration-200 hover:bg-[#f5ebe0]"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppHeader />
      <div className={contentClass}>
        <AppSidebar />
        <main className={mainClass}>
          <div className={containerClass}>
            <PageHeader
              title="Daily Horoscope"
              onTitleClick={fetchHoroscope}
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={fetchHoroscope}
              refreshAriaLabel="Refresh horoscope"
              disableRefresh={loading}
            />

            <h1 className={sectionTitleClass}>🌙 Horoscope</h1>
            <div className="mb-5 flex gap-[60px] border-b border-b-[#e5e5e5] pb-2 text-[20px]">
              <span className="border-b-[2px] border-b-[#c89b3c] pb-1 font-semibold text-black">
                Today
              </span>
              <span
                className="cursor-pointer font-medium text-[#666666] hover:text-black"
                onClick={() => router.push("/horoscope/weekly")}
              >
                Weekly
              </span>
              <span
                className="cursor-pointer font-medium text-[#666666] hover:text-black"
                onClick={() => router.push("/horoscope/monthly")}
              >
                Monthly
              </span>
            </div>
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-[16px] text-[#6b7280]">
                <p>
                  <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-[#d4c4a8] border-t-[#6b4423]" />{" "}
                  Loading daily insights…
                </p>
              </div>
            ) : horoscope ? (
              <>
                <p className="mb-0 mt-3 text-[15px] text-[#6b5b52]">
                  Based on your chart and current transits
                </p>
                <div className="mt-6 overflow-hidden rounded-[18px] border border-[#e8ddd0] bg-white shadow-[0_8px_18px_rgba(0,0,0,0.08)]">
                  <div
                    className={`h-2 w-full ${horoscope.dayType === "Good" ? "bg-[linear-gradient(180deg,#4ade80,#22c55e)]" : horoscope.dayType === "Challenging" ? "bg-[linear-gradient(180deg,#fb923c,#ef4444)]" : "bg-[linear-gradient(180deg,#a8b3c0,#64748b)]"}`}
                    aria-hidden
                  />
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <span className="text-[14px] font-medium text-[#6b7280]">
                        {horoscope.date
                          ? new Date(horoscope.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date().toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                      </span>
                      {horoscope.dayType && (
                        <span
                          className={`rounded-[999px] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] ${horoscope.dayType === "Good" ? "bg-[#dcfce7] text-[#166534]" : horoscope.dayType === "Challenging" ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#e5e7eb] text-[#475569]"}`}
                        >
                          {horoscope.dayType}
                        </span>
                      )}
                    </div>
                    <p className="text-[22px] font-bold text-[#2d2a26]">
                      {horoscope.mainTheme || "No theme available"}
                    </p>
                    {horoscope.reason && (
                      <div className="mt-5 rounded-[12px] bg-[#f9fafb] p-4">
                        <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
                          Why today?
                        </p>
                        <p className="text-[15px] leading-[1.6] text-[#374151]">
                          {horoscope.reason}
                        </p>
                      </div>
                    )}
                    {(horoscope.doAvoid || horoscope.goodTime) && (
                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {horoscope.doAvoid && (
                          <div className="rounded-[12px] border border-[#e8ddd0] bg-[#fffaf5] p-4">
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
                              Do / Avoid today
                            </p>
                            <p className="text-[14px] leading-[1.6] text-[#374151]">
                              {horoscope.doAvoid}
                            </p>
                          </div>
                        )}
                        {horoscope.goodTime && (
                          <div className="rounded-[12px] border border-[#e8ddd0] bg-[#fffaf5] p-4">
                            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
                              Good time
                            </p>
                            <p className="text-[14px] leading-[1.6] text-[#374151]">
                              {horoscope.goodTime}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <CalculationInfo showDasha={false} showAyanamsa={true} />
                <TrustNote variant="loggedIn" />
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
