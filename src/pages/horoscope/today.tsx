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
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";

const REDIRECT_DELAY_MS = 2000;

export default function DailyHoroscopePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [horoscopeType, setHoroscopeType] = useState<"daily" | "weekly" | "monthly">("daily");
  const fetchHoroscope = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      let data;

if (horoscopeType === "daily") {
  data = await horoscopeApi.getDailyHoroscope(t);
} else if (horoscopeType === "weekly") {
  data = await horoscopeApi.getWeeklyHoroscope(t);
} else {
  data = await horoscopeApi.getMonthlyHoroscope(t);
}

setHoroscope(data);
      setHoroscope(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Daily Horoscope";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error("Backend service may not be running. Please start astro-service on port 8002");
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
  }, [rehydrated, token, horoscopeType, dispatch, router, fetchHoroscope]);

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>🌙 Daily Horoscope</h1>
              <ErrorMessage message={error} />
              <div className="mt-5 flex gap-3">
                <button onClick={fetchHoroscope} className={styles.primaryButton}>
                  Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={styles.secondaryButton}>
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
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <PageHeader
              title="Daily Horoscope"
              onTitleClick={fetchHoroscope}
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={fetchHoroscope}
              refreshAriaLabel="Refresh horoscope"
              disableRefresh={loading}
            />

            <h1 className={styles.sectionTitle}>🌙 Horoscope</h1>
            <div className={styles.horoscopeNav}>
              <span className={styles.activeNav}>Today</span>
              <span className={styles.navItem} onClick={() => router.push("/horoscope/weekly")}>Weekly</span>
              <span className={styles.navItem} onClick={() => router.push("/horoscope/monthly")}>Monthly</span>
            </div>
            {loading ? (
              <div className={styles.loadingContainer}>
                <p><span className={styles.loadingSpinner} /> Loading daily insights…</p>
              </div>
            ) : horoscope ? (
              <>
                <p className={styles.dailyPredictionsSubtitle} style={{ marginTop: 12, marginBottom: 0 }}>
                  Based on your chart and current transits
                </p>
                <div className={styles.todayHeroCard}>
                  <div
                    className={styles.todayHeroAccent}
                    style={{
                      background:
                        horoscope.dayType === "Good"
                          ? "linear-gradient(180deg, #4ade80, #22c55e)"
                          : horoscope.dayType === "Challenging"
                            ? "linear-gradient(180deg, #fb923c, #ef4444)"
                            : "linear-gradient(180deg, #a8b3c0, #64748b)",
                    }}
                    aria-hidden
                  />
                  <div className={styles.todayHeroBody}>
                    <div className={styles.todayHeroHeader}>
                      <span className={styles.todayHeroDate}>
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
                          className={`${styles.horoscopeTypeBadge} ${
                            horoscope.dayType === "Good"
                              ? styles.horoscopeTypeBadgeGood
                              : horoscope.dayType === "Challenging"
                                ? styles.horoscopeTypeBadgeChallenging
                                : styles.horoscopeTypeBadgeNeutral
                          }`}
                        >
                          {horoscope.dayType}
                        </span>
                      )}
                    </div>
                    <p className={styles.todayHeroFocus}>
                      {horoscope.mainTheme || "No theme available"}
                    </p>
                    {horoscope.reason && (
                      <div className={styles.todayReasonBlock}>
                        <p className={styles.todayReasonLabel}>Why today?</p>
                        <p className={styles.todayReasonText}>{horoscope.reason}</p>
                      </div>
                    )}
                    {(horoscope.doAvoid || horoscope.goodTime) && (
                      <div className={styles.todayTipsBlock}>
                        {horoscope.doAvoid && (
                          <div className={styles.todayTipCard}>
                            <p className={styles.todayTipLabel}>Do / Avoid today</p>
                            <p className={styles.todayTipText}>{horoscope.doAvoid}</p>
                          </div>
                        )}
                        {horoscope.goodTime && (
                          <div className={styles.todayTipCard}>
                            <p className={styles.todayTipLabel}>Good time</p>
                            <p className={styles.todayTipText}>{horoscope.goodTime}</p>
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