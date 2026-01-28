import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { doshaApi, DoshaResponse } from "@/services/doshaService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function DoshaPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [dosha, setDosha] = useState<DoshaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDosha = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await doshaApi.checkDoshas(t);
      setDosha(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Dosha";
      setError(msg);
      showError(msg);
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
    fetchDosha();
  }, [rehydrated, token, dispatch, router, fetchDosha]);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'High':
        return '#9c4a3d';
      case 'Medium':
        return '#a67c00';
      case 'Low':
        return '#8b7b4a';
      default:
        return '#5c4033';
    }
  };

  const notPresentStyle = { background: '#e8f0e8', color: '#3d6b4f' };
  const presentColor = '#9c4a3d';
  const totalZeroColor = '#5c4033';
  const totalNonZeroColor = '#9c4a3d';

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading your Dosha analysis...</p>
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
                <button onClick={fetchDosha} className={styles.backButton}>
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
            <button onClick={fetchDosha} className={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Dosha Analysis</h1>

            {dosha && (
              <>
                <div className={styles.doshaSummary}>
                  <div className={styles.doshaSummaryCard}>
                    <h3 className={styles.cardTitle}>Total Doshas</h3>
                    <p className={styles.cardValue} style={{ fontSize: '2.5rem', color: dosha.totalDoshas > 0 ? totalNonZeroColor : totalZeroColor }}>
                      {dosha.totalDoshas}
                    </p>
                    <p className={styles.cardSubtext}>
                      {dosha.totalDoshas === 0 ? 'No doshas detected' : `${dosha.totalDoshas} dosha(s) found`}
                    </p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.manglik.hasDosha ? getSeverityColor(dosha.manglik.severity) : '#b8cfb0'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Manglik Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          ...(dosha.manglik.hasDosha ? { background: getSeverityColor(dosha.manglik.severity), color: 'white' } : notPresentStyle),
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {dosha.manglik.hasDosha ? (dosha.manglik.severity || 'Present') : 'Not Present'}
                      </span>
                    </div>
                    <p className={styles.cardDescription}>{dosha.manglik.description}</p>
                  </div>

                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.nadi.hasDosha ? presentColor : '#b8cfb0'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Nadi Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          ...(dosha.nadi.hasDosha ? { background: presentColor, color: 'white' } : notPresentStyle),
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {dosha.nadi.hasDosha ? 'Present' : 'Not Present'}
                      </span>
                    </div>
                    <p className={styles.cardDescription}>{dosha.nadi.description}</p>
                  </div>

                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.bhakoot.hasDosha ? presentColor : '#b8cfb0'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Bhakoot Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          ...(dosha.bhakoot.hasDosha ? { background: presentColor, color: 'white' } : notPresentStyle),
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}
                      >
                        {dosha.bhakoot.hasDosha ? 'Present' : 'Not Present'}
                      </span>
                    </div>
                    <p className={styles.cardDescription}>{dosha.bhakoot.description}</p>
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
