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
  const pageClass =
    "min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 text-slate-800";
  const contentClass = "flex w-full";
  const mainClass =
    "ml-[260px] h-[calc(100vh-56px)] w-full overflow-y-auto overflow-x-hidden p-8 max-[768px]:ml-[200px]";
  const containerClass = "relative mx-auto max-w-[1200px]";
  const primaryBtn =
    "inline-flex items-center justify-center rounded-xl \
bg-gradient-to-r from-rose-700 via-orange-600 to-amber-500 \
px-6 py-2.5 text-sm font-semibold text-white \
shadow-lg transition-all duration-300 \
hover:scale-105 hover:shadow-xl \
disabled:opacity-60 disabled:cursor-not-allowed";
  const sectionTitleClass =
    "mb-8 pb-3 text-3xl font-bold tracking-tight text-slate-800 border-b border-slate-200";
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
    if (!rehydrated) {
      return;
    }
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
                <button onClick={fetchHoroscope} className={primaryBtn}>
                  Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={primaryBtn}>
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
                <div className="mt-8 overflow-hidden rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md shadow-xl">
                  <div
                    className={`h-2.5 w-full ${horoscope.dayType === "Good" ? "bg-[linear-gradient(180deg,#4ade80,#22c55e)]" : horoscope.dayType === "Challenging" ? "bg-[linear-gradient(180deg,#fb923c,#ef4444)]" : "bg-[linear-gradient(180deg,#a8b3c0,#64748b)]"}`}
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
                      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
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
                          <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm">
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
