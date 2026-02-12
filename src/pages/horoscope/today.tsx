import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
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
              <h1 className={styles.sectionTitle}>🌙 Daily Horoscope</h1>
              <div className={styles.loadingContainer}>
                <p><span className={styles.loadingSpinner} /> Loading today’s horoscope…</p>
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

            <h1 className={styles.sectionTitle}>🌙 Daily Horoscope</h1>
            
            {horoscope && (
              <>
                <span className={styles.youAreHereBadge}>Today</span>
                <div className={styles.infoGrid}>
                  <div className={`${styles.infoCard} ${styles.cardActive}`}>
                    <h3>Date</h3>
                    <p className={styles.infoValue}>{horoscope.date || new Date().toLocaleDateString()}</p>
                  </div>
                  <div className={`${styles.infoCard} ${styles.cardActive}`}>
                    <h3>Day type</h3>
                    <p className={styles.infoValue}>{horoscope.dayType || "N/A"}</p>
                  </div>
                </div>
                <div className="mt-8">
                  <h2 className={styles.sectionTitle}>Today's focus</h2>
                  <p className="mb-5 text-lg leading-relaxed">
                    {horoscope.mainTheme || "No theme available"}
                  </p>
                </div>

                {horoscope.reason && (
                  <div className={`mt-5 ${styles.explanationLine}`}>
                    <strong>Why today?</strong> {horoscope.reason}
                  </div>
                )}
                {(horoscope.doAvoid || horoscope.goodTime) && (
                  <div className={`mt-5 ${styles.doAvoidBlock}`}>
                    {horoscope.doAvoid && <p><strong>Do / Avoid today:</strong> {horoscope.doAvoid}</p>}
                    {horoscope.goodTime && <p><strong>Good time:</strong> {horoscope.goodTime}</p>}
                  </div>
                )}
                <CalculationInfo showDasha={false} showAyanamsa={true} />
                <TrustNote variant="loggedIn" />

                <div className={styles.sevenDayPreviewWrap}>
                  <h3>Next 7 days</h3>
                  <div className={styles.sevenDayPreviewBlur}>
                    <p>Mon — Steady progress; good for routine tasks.</p>
                    <p>Tue — Focus on communication and short travel.</p>
                    <p>Wed — Favorable for finances and decisions.</p>
                    <p>Thu — Emotional clarity; relationships in focus.</p>
                    <p>Fri — Creative energy; avoid haste.</p>
                    <p>Sat — Rest and reflection recommended.</p>
                    <p>Sun — New beginnings; plan for the week ahead.</p>
                  </div>
                  <div className={styles.sevenDayPreviewCta}>
                    <p>Unlock your personalized week ahead</p>
                    <button type="button" onClick={() => router.push("/horoscope/weekly")}>
                      See full weekly horoscope →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}