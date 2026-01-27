import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { doshaApi, DoshaResponse } from "@/services/doshaService";
import { showError } from "@/utils/toast";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function DoshaPage() {
  const router = useRouter();
  const [dosha, setDosha] = useState<DoshaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDosha = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (token.split(".").length !== 3) {
        setError("Invalid token format. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
        return;
      }

      setLoading(true);
      const data = await doshaApi.checkDoshas(token);
      setDosha(data);
      setError(null);
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to load Dosha";
      setError(errorMessage);
      showError(errorMessage);
      console.error("Error fetching Dosha:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'High':
        return '#dc2626';
      case 'Medium':
        return '#f59e0b';
      case 'Low':
        return '#eab308';
      default:
        return '#10b981';
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
                    <p className={styles.cardValue} style={{ fontSize: '2.5rem', color: dosha.totalDoshas > 0 ? '#dc2626' : '#10b981' }}>
                      {dosha.totalDoshas}
                    </p>
                    <p className={styles.cardSubtext}>
                      {dosha.totalDoshas === 0 ? 'No doshas detected' : `${dosha.totalDoshas} dosha(s) found`}
                    </p>
                  </div>
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.manglik.hasDosha ? getSeverityColor(dosha.manglik.severity) : '#10b981'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Manglik Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          background: dosha.manglik.hasDosha ? getSeverityColor(dosha.manglik.severity) : '#10b981',
                          color: 'white',
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

                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.nadi.hasDosha ? '#dc2626' : '#10b981'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Nadi Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          background: dosha.nadi.hasDosha ? '#dc2626' : '#10b981',
                          color: 'white',
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

                  <div className={styles.doshaCard} style={{ borderLeft: `4px solid ${dosha.bhakoot.hasDosha ? '#dc2626' : '#10b981'}` }}>
                    <div className={styles.doshaHeader}>
                      <h3 className={styles.cardTitle}>Bhakoot Dosha</h3>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          background: dosha.bhakoot.hasDosha ? '#dc2626' : '#10b981',
                          color: 'white',
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
