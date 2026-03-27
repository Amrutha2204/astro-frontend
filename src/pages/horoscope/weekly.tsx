import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { horoscopeApi } from "@/services/horoscopeService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";

const REDIRECT_DELAY_MS = 2000;

type WeeklyPrediction = {
  date?: string;
  day?: string;
  horoscope?: {
    dayType?: "Good" | "Challenging" | string;
    mainTheme?: string;
    reason?: string;
  };
};

type WeeklyHoroscope = {
  weekStart?: string;
  predictions?: WeeklyPrediction[];
};

export default function WeeklyHoroscopePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [horoscope, setHoroscope] = useState<WeeklyHoroscope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageClass =
    "min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 text-slate-800";
  const contentClass = "flex w-full";
  const mainClass =
    "ml-[260px] h-[calc(100vh-56px)] w-full overflow-y-auto overflow-x-hidden p-8 max-[768px]:ml-[200px]";
  const containerClass = "relative mx-auto max-w-[1200px]";
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
      const data = await horoscopeApi.getWeeklyHoroscope(t);
      setHoroscope(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Weekly Horoscope";
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
              <h1 className={sectionTitleClass}>🌙 Horoscope</h1>
              <div className="mb-8 flex gap-10 border-b border-slate-200 pb-3 text-lg">
                <span
                  className="cursor-pointer font-medium text-slate-500 transition-colors hover:text-slate-900"
                  onClick={() => router.push("/horoscope/today")}
                >
                  Today
                </span>

                <span className="border-b-2 border-amber-500 pb-1 font-semibold text-slate-900">
                  Weekly
                </span>

                <span
                  className="cursor-pointer font-medium text-slate-500 transition-colors hover:text-slate-900"
                  onClick={() => router.push("/horoscope/monthly")}
                >
                  Monthly
                </span>
              </div>
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
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={fetchHoroscope}
              refreshAriaLabel="Refresh horoscope"
              disableRefresh={loading}
            />
            <h1 className={sectionTitleClass}>🌙 Horoscope</h1>
            <div className="mb-5 flex gap-[60px] border-b border-b-[#e5e5e5] pb-2 text-[20px]">
              <span
                className="cursor-pointer font-medium text-[#666666] hover:text-black"
                onClick={() => router.push("/horoscope/today")}
              >
                Today
              </span>
              <span className="border-b-[2px] border-b-[#c89b3c] pb-1 font-semibold text-black">
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
                  Loading your weekly predictions…
                </p>
              </div>
            ) : horoscope ? (
              <>
                {horoscope.weekStart && (
                  <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
                    <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md p-6 shadow-xl">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Week starts
                      </h3>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {new Date(horoscope.weekStart).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {horoscope.predictions &&
                  Array.isArray(horoscope.predictions) &&
                  horoscope.predictions.length > 0 && (
                    <div className="mt-8">
                      <h2 className="mb-2 text-[22px] font-bold text-[#2d2a26]">
                        Daily predictions
                      </h2>
                      <p className="text-[15px] text-[#6b5b52]">
                        Based on your chart and current transits
                      </p>
                      <div className="mt-5 flex flex-col gap-4">
                        {horoscope.predictions.map(
                          (prediction: WeeklyPrediction, index: number) => {
                            const predDate = prediction.date ? new Date(prediction.date) : null;
                            const today = new Date();
                            const isToday =
                              predDate && predDate.toDateString() === today.toDateString();
                            const isPast =
                              predDate &&
                              predDate < today &&
                              predDate.toDateString() !== today.toDateString();
                            const prevDateStr = horoscope.predictions?.[index - 1]?.date;
                            const prevDate = prevDateStr ? new Date(prevDateStr) : null;
                            const isTomorrow = prevDate?.toDateString() === today.toDateString();
                            const dayType = prediction.horoscope?.dayType;
                            const isGood = dayType === "Good";
                            const isChallenging = dayType === "Challenging";
                            return (
                              <div
                                key={index}
                                className={`overflow-hidden rounded-2xl border border-white/50 bg-white/80 backdrop-blur-md shadow-xl
${isToday ? "ring-2 ring-amber-500" : ""}
${isPast ? "opacity-60" : ""}
${isTomorrow ? "border-amber-300" : ""}`}
                              >
                                <div className="flex">
                                  <div
                                    className={`w-2 shrink-0 ${isGood ? "bg-[linear-gradient(180deg,#4ade80,#22c55e)]" : isChallenging ? "bg-[linear-gradient(180deg,#fb923c,#ef4444)]" : "bg-[linear-gradient(180deg,#a8b3c0,#64748b)]"}`}
                                    aria-hidden
                                  />
                                  <div className="flex-1 p-5">
                                    <div className="mb-3 flex items-start justify-between gap-4">
                                      <div className="text-[14px] font-medium text-[#6b7280]">
                                        {isToday && (
                                          <>
                                            <span className="mr-2 inline-flex rounded-full bg-gradient-to-r from-rose-700 to-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
                                              Today
                                            </span>{" "}
                                          </>
                                        )}
                                        {isTomorrow && !isToday && (
                                          <>
                                            <span className="mr-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
                                              Up next
                                            </span>{" "}
                                          </>
                                        )}
                                        {prediction.day ? `${prediction.day}, ` : ""}
                                        {prediction.date
                                          ? new Date(prediction.date).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : `Day ${index + 1}`}
                                      </div>
                                      {dayType && (
                                        <span
                                          className={`${isGood ? "bg-[#dcfce7] text-[#166534]" : isChallenging ? "bg-[#fee2e2] text-[#b91c1c]" : "bg-[#e5e7eb] text-[#475569]"} rounded-[999px] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.05em]`}
                                        >
                                          {dayType}
                                        </span>
                                      )}
                                    </div>
                                    {prediction.horoscope?.mainTheme && (
                                      <p className="text-[18px] font-semibold text-[#2d2a26]">
                                        {prediction.horoscope.mainTheme}
                                      </p>
                                    )}
                                    {prediction.horoscope?.reason && (
                                      <div>
                                        <p className="mb-2 mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
                                          Planetary positions
                                        </p>
                                        <p className="text-[14px] leading-[1.6] text-[#374151]">
                                          {prediction.horoscope.reason}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
