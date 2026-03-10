import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { doshaApi, DoshaResponse } from "@/services/doshaService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

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
            <Loading text="Loading your Dosha Check..." />
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
              {error && <ErrorMessage message={error} />}
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
          <div className={styles.kundliContainer}>
            <PageHeader
              onBack={() => router.back()}
              onRefresh={fetchDosha}
              refreshAriaLabel="Refresh dosha"
              disableRefresh={loading}
            />
            <h1 className={styles.sectionTitle}>Your dosha check</h1>

            {dosha && (
              <>
                <p className={styles.explanationLine}>These results are based on your birth chart’s planetary positions.</p>
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

                {dosha.totalDoshas > 0 ? (
                  <div className={styles.infoGrid}>
                    {dosha.manglik.hasDosha && (
                      <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${getSeverityColor(dosha.manglik.severity)}` }}>
                        <div className={styles.doshaHeader}>
                          <h3 className={styles.cardTitle}>Manglik Dosha</h3>
                          <span
                            className={styles.doshaBadge}
                            style={{
                              background: getSeverityColor(dosha.manglik.severity),
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            {dosha.manglik.severity || 'Present'}
                          </span>
                        </div>
                        <p className={styles.cardDescription}>{dosha.manglik.description}</p>
                      </div>
                    )}
                    {dosha.nadi.hasDosha && (
                      <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${presentColor}` }}>
                        <div className={styles.doshaHeader}>
                          <h3 className={styles.cardTitle}>Nadi Dosha</h3>
                          <span
                            className={styles.doshaBadge}
                            style={{
                              background: presentColor,
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            Present
                          </span>
                        </div>
                        <p className={styles.cardDescription}>{dosha.nadi.description}</p>
                      </div>
                    )}
                    {dosha.bhakoot.hasDosha && (
                      <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${presentColor}` }}>
                        <div className={styles.doshaHeader}>
                          <h3 className={styles.cardTitle}>Bhakoot Dosha</h3>
                          <span
                            className={styles.doshaBadge}
                            style={{
                              background: presentColor,
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '600'
                            }}
                          >
                            Present
                          </span>
                        </div>
                        <p className={styles.cardDescription}>{dosha.bhakoot.description}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className={styles.cardSubtext} style={{ marginTop: '1rem' }}>No doshas detected. All checked parameters (Manglik, Nadi, Bhakoot) are clear.</p>
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