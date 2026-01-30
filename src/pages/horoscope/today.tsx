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

                <div style={{ marginTop: "30px" }}>
                  <h2 className={styles.sectionTitle}>Today’s focus</h2>
                  <p style={{ fontSize: "18px", lineHeight: "1.6", marginBottom: "20px" }}>
                    {horoscope.mainTheme || "No theme available"}
                  </p>
                </div>

                {horoscope.reason && (
                  <div style={{ marginTop: "20px" }} className={styles.explanationLine}>
                    <strong>Why today?</strong> {horoscope.reason}
                  </div>
                )}
                <CalculationInfo showDasha={false} showAyanamsa={true} />
                <TrustNote variant="loggedIn" />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
