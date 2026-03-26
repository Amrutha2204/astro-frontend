import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { dashaApi, type DashaResponse, type DashaTimelineResponse } from "@/services/dashaService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

export default function DashaPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [currentDasha, setCurrentDasha] = useState<DashaResponse | null>(null);
  const [timeline, setTimeline] = useState<DashaTimelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const pageClass =
    "min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]";

  const mainClass =
    "ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-white/70 backdrop-blur-[6px] p-8 max-[768px]:ml-[200px]";
  const contentClass = "flex w-full";
  const containerClass = "relative mx-auto max-w-[1200px] space-y-8";
  const sectionTitleClass =
    "text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent";
  const infoGridClass = "mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]";
  const infoCardClass =
    "group relative overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-br from-white via-[#fff7ed] to-[#f3e8ff] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(124,58,237,0.18)]";
  const activeCardClass = "border border-[#e9d5ff] bg-gradient-to-br from-[#faf5ff] to-[#fdf4ff]";
  const primaryButtonClass =
    "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

  const fetchDasha = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const current = await dashaApi.getCurrentDasha(t);
      setCurrentDasha(current);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Dasha";
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  const fetchTimeline = useCallback(async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
    try {
      const data = await dashaApi.getDashaTimeline(t, 10);
      setTimeline(data);
      setShowTimeline(true);
    } catch (err) {
      const e = err as { message?: string };
      showError(e.message || "Failed to load timeline");
    }
  }, [token]);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchDasha();
  }, [rehydrated, token, dispatch, router, fetchDasha]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={pageClass}>
        <div className="sticky top-0 z-60">
          <AppHeader />
        </div>
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <Loading text="Loading your period..." />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={pageClass}>
        <AppHeader />
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
              <ErrorMessage message={error} />
              <div className="flex gap-[10px]">
                <button onClick={fetchDasha} className={primaryButtonClass}>
                  🔄 Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={primaryButtonClass}>
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
              title="Your period (Dasha)"
              onTitleClick={fetchDasha}
              onBack={() => router.back()}
              onRefresh={fetchDasha}
              refreshAriaLabel="Refresh Dasha"
              disableRefresh={loading}
            />
            <h1 className={sectionTitleClass}>Your period (Dasha)</h1>

            {currentDasha && (
              <>
                <span className="inline-flex rounded-[999px] bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em]">
                  You are here
                </span>
                <p className="mt-2 rounded-[6px] border-l-[#7c3aed] bg-white/60 text-slate-700">
                  You’re in this period because your birth chart places you in{" "}
                  {currentDasha.mahadasha} from {formatDate(currentDasha.startDate)}.
                </p>
                <div className={infoGridClass}>
                  <div className={`${infoCardClass} ${activeCardClass}`}>
                    <h3 className="mb-2 text-[16px] font-semibold text-[#1f2937]">
                      Current Mahadasha
                    </h3>
                    <p className="text-[20px] font-bold text-[#7c3aed]">{currentDasha.mahadasha}</p>
                    <p className="mt-2 text-[14px] text-[#6b7280]">Planet: {currentDasha.planet}</p>
                  </div>

                  <div className={`${infoCardClass} ${activeCardClass}`}>
                    <h3 className="mb-2 text-[16px] font-semibold text-[#1f2937]">
                      Current Antardasha
                    </h3>
                    <p className="text-[20px] font-bold text-[#7c3aed]">
                      {currentDasha.antardasha}
                    </p>
                    {currentDasha.pratyantardasha && (
                      <p className="mt-2 text-[14px] text-[#6b7280]">
                        Pratyantardasha: {currentDasha.pratyantardasha}
                      </p>
                    )}
                  </div>

                  <div className={infoCardClass}>
                    <h3 className="mb-2 text-[16px] font-semibold text-[#1f2937]">Period</h3>
                    <p className="text-[20px] font-bold text-[#7c3aed]">
                      {formatDate(currentDasha.startDate)}
                    </p>
                    <p className="mt-2 text-[14px] text-[#6b7280]">
                      to {formatDate(currentDasha.endDate)}
                    </p>
                  </div>

                  <div className={infoCardClass}>
                    <h3 className="mb-2 text-[16px] font-semibold text-[#1f2937]">Time left</h3>
                    <p className="text-[20px] font-bold text-[#7c3aed]">
                      {currentDasha.remainingDays}
                    </p>
                    <p className="mt-2 text-[14px] text-[#6b7280]">days in this period</p>
                  </div>
                </div>
                <CalculationInfo showDasha={true} showAyanamsa={true} />
                <TrustNote variant="loggedIn" />
              </>
            )}

            {!showTimeline && (
              <div className="mt-5 text-center">
                <button
                  onClick={fetchTimeline}
                  className={`${primaryButtonClass} mx-auto w-full max-w-[300px]`}
                >
                  View 10-Year Timeline
                </button>
              </div>
            )}

            {timeline && showTimeline && (
              <div className="mt-[30px]">
                <h2 className={sectionTitleClass}>What’s next (next 10 years)</h2>
                <div className="mt-5 flex flex-col gap-[15px]">
                  {(() => {
                    const now = new Date();
                    const currentIdx = timeline.timeline.findIndex((p) => {
                      const s = new Date(p.startDate),
                        e = new Date(p.endDate);
                      return s <= now && e >= now;
                    });
                    return timeline.timeline.map((period, index) => {
                      const start = new Date(period.startDate),
                        end = new Date(period.endDate);
                      const isPast = end < now;
                      const isCurrent = start <= now && end >= now;
                      const isNext = currentIdx >= 0 && index === currentIdx + 1;
                      return (
                        <div
                          key={index}
                          className={`rounded-[8px] border-l-[4px] border-l-[#7c3aed] bg-white/70 backdrop-blur p-5 transition-all duration-200 hover:translate-x-1 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] ${isCurrent ? "bg-gradient-to-r from-[#ede9fe] to-[#fce7f3]" : ""} ${isPast ? "opacity-70" : ""}`}
                        >
                          {(isCurrent || isNext) && (
                            <span
                              className={
                                isCurrent
                                  ? "mb-3 inline-flex rounded-[999px] bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em]"
                                  : "mb-3 inline-flex rounded-[999px] bg-[#ede9fe] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-[#7c3aed]"
                              }
                            >
                              {isCurrent ? "You are here" : "Up next"}
                            </span>
                          )}
                          <div className="mb-[10px] text-[14px] text-[#6b7280]">
                            <strong>{formatDate(period.startDate)}</strong>
                            <span> to </span>
                            <strong>{formatDate(period.endDate)}</strong>
                          </div>
                          <div className="flex flex-wrap items-center gap-[15px]">
                            <div className="min-w-20 rounded-[6px] bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white px-3 py-[6px] text-center text-[14px] font-semibold">
                              {period.planet}
                            </div>
                            <div className="flex-1 text-[16px] font-semibold text-[#1f2937]">
                              <span className="text-[#7c3aed]">{period.dasha}</span>
                              <span className="text-slate-600"> / {period.antardasha}</span>
                              {period.pratyantardasha && (
                                <span className="text-[14px] text-[#6b4423]">
                                  {" "}
                                  / {period.pratyantardasha}
                                </span>
                              )}
                            </div>
                            <div className="text-[14px] font-medium text-[#6b7280]">
                              {period.duration} years
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
