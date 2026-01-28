import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { dashaApi, DashaResponse, DashaTimelineResponse } from "@/services/dashaService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

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
    if (!t) return;
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
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchDasha();
  }, [rehydrated, token, dispatch, router, fetchDasha]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading your Dasha analysis...</p>
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
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error: {error}</p>
              <div className={styles.buttonGroup}>
                <button onClick={fetchDasha} className={styles.backButton}>
                  🔄 Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={styles.backButton}>
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
          <div className={styles.pageHeader}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← Back
            </button>
            <button onClick={fetchDasha} className={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Dasha Analysis</h1>

            {currentDasha && (
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <h3 className={styles.cardTitle}>Current Mahadasha</h3>
                  <p className={styles.cardValue}>{currentDasha.mahadasha}</p>
                  <p className={styles.cardSubtext}>Planet: {currentDasha.planet}</p>
                </div>

                <div className={styles.infoCard}>
                  <h3 className={styles.cardTitle}>Current Antardasha</h3>
                  <p className={styles.cardValue}>{currentDasha.antardasha}</p>
                  {currentDasha.pratyantardasha && (
                    <p className={styles.cardSubtext}>Pratyantardasha: {currentDasha.pratyantardasha}</p>
                  )}
                </div>

                <div className={styles.infoCard}>
                  <h3 className={styles.cardTitle}>Period</h3>
                  <p className={styles.cardValue}>{formatDate(currentDasha.startDate)}</p>
                  <p className={styles.cardSubtext}>to {formatDate(currentDasha.endDate)}</p>
                </div>

                <div className={styles.infoCard}>
                  <h3 className={styles.cardTitle}>Remaining Days</h3>
                  <p className={styles.cardValue}>{currentDasha.remainingDays}</p>
                  <p className={styles.cardSubtext}>days remaining</p>
                </div>
              </div>
            )}

            {!showTimeline && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  onClick={fetchTimeline}
                  className={styles.loginButton}
                  style={{ maxWidth: '300px' }}
                >
                  View 10-Year Timeline
                </button>
              </div>
            )}

            {timeline && showTimeline && (
              <div style={{ marginTop: '30px' }}>
                <h2 className={styles.sectionTitle}>Dasha Timeline (Next 10 Years)</h2>
                <div className={styles.timelineContainer}>
                  {timeline.timeline.map((period, index) => (
                    <div key={index} className={styles.timelineItem}>
                      <div className={styles.timelineDate}>
                        <strong>{formatDate(period.startDate)}</strong>
                        <span> to </span>
                        <strong>{formatDate(period.endDate)}</strong>
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelinePlanet}>{period.planet}</div>
                        <div className={styles.timelineDasha}>
                          <span className={styles.timelineMahadasha}>{period.dasha}</span>
                          <span className={styles.timelineAntardasha}> / {period.antardasha}</span>
                          {period.pratyantardasha && (
                            <span className={styles.timelinePratyantardasha}> / {period.pratyantardasha}</span>
                          )}
                        </div>
                        <div className={styles.timelineDuration}>{period.duration} years</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
