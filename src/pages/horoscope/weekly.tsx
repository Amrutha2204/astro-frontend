import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { horoscopeApi } from "@/services/horoscopeService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function WeeklyHoroscopePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [rehydrated, token, dispatch, router, fetchHoroscope]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
              <div className={styles.loadingContainer}>
                <p><span className={styles.loadingSpinner} /> Loading your weekly predictions…</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
              <div style={{ color: "red", margin: "20px 0" }}>
                <p><strong>Error:</strong> {error}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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
            <div className={styles.pageHeader}>
              <button 
                onClick={() => router.push("/dashboard")} 
                className={styles.backButton}
                aria-label="Go back to dashboard"
              >
                ← Back
              </button>
              <div className={styles.headerActions}>
                <button 
                  onClick={fetchHoroscope} 
                  className={styles.refreshButton}
                  aria-label="Refresh horoscope"
                  disabled={loading}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
            
            {horoscope && (
              <>
                {horoscope.weekStart && (
                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <h3>Week starts</h3>
                      <p className={styles.infoValue}>
                        {new Date(horoscope.weekStart).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {horoscope.predictions && Array.isArray(horoscope.predictions) && horoscope.predictions.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h2 className={styles.sectionTitle}>Daily predictions</h2>
                    <div className={styles.planetsGrid}>
                      {horoscope.predictions.map((prediction: any, index: number) => {
                        const predDate = prediction.date ? new Date(prediction.date) : null;
                        const today = new Date();
                        const isToday = predDate && predDate.toDateString() === today.toDateString();
                        const isPast = predDate && predDate < today && predDate.toDateString() !== today.toDateString();
                        const isTomorrow = index > 0 && horoscope.predictions[index - 1]?.date && new Date(horoscope.predictions[index - 1].date).toDateString() === today.toDateString();
                        return (
                          <div
                            key={index}
                            className={`${styles.planetCard} ${isToday ? styles.cardActive : ""} ${isPast ? styles.cardPast : ""} ${isTomorrow ? styles.cardFuture : ""}`}
                          >
                            {isToday && <span className={styles.youAreHereBadge}>Today</span>}
                            {isTomorrow && <span className={styles.upNextBadge}>Up next</span>}
                            <h4>
                              {prediction.day ? `${prediction.day}, ` : ""}
                              {prediction.date ? new Date(prediction.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              }) : `Day ${index + 1}`}
                            </h4>
                            {prediction.horoscope?.dayType && (
                              <p style={{ marginBottom: "8px" }}>
                                <strong>Type:</strong> <span style={{ 
                                  color: prediction.horoscope.dayType === 'Good' ? '#10b981' : 
                                         prediction.horoscope.dayType === 'Challenging' ? '#ef4444' : '#6b7280'
                                }}>
                                  {prediction.horoscope.dayType}
                                </span>
                              </p>
                            )}
                            {prediction.horoscope?.mainTheme && (
                              <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: "1.5" }}>
                                <strong>Focus:</strong> {prediction.horoscope.mainTheme}
                              </p>
                            )}
                            {prediction.horoscope?.reason && (
                              <p style={{ marginTop: "10px", fontSize: "13px", color: "#666", fontStyle: "italic" }}>
                                {prediction.horoscope.reason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
