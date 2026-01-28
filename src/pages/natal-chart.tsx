import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi } from "@/services/api";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function NatalChartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [natalChart, setNatalChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNatalChart = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await astroApi.getNatalChart(t);
      setNatalChart(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Natal Chart";
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
    fetchNatalChart();
  }, [rehydrated, token, dispatch, router, fetchNatalChart]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>⭐ Natal Chart</h1>
              <p>Loading your birth chart...</p>
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
              <h1 className={styles.sectionTitle}>⭐ Natal Chart</h1>
              <div style={{ color: "red", margin: "20px 0" }}>
                <p><strong>Error:</strong> {error}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={fetchNatalChart} className={styles.primaryButton}>
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
                  onClick={fetchNatalChart} 
                  className={styles.refreshButton}
                  aria-label="Refresh natal chart"
                  disabled={loading}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            <h1 className={styles.sectionTitle}>⭐ Natal Chart</h1>
            
            {natalChart && (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <h3>Sun Sign</h3>
                    <p className={styles.infoValue}>{natalChart.sunSign || "N/A"}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h3>Moon Sign</h3>
                    <p className={styles.infoValue}>{natalChart.moonSign || "N/A"}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h3>Ascendant (Lagna)</h3>
                    <p className={styles.infoValue}>{natalChart.ascendant || "N/A"}</p>
                  </div>
                </div>

                {natalChart.planetSignList && natalChart.planetSignList.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h2 className={styles.sectionTitle}>Planetary Positions</h2>
                    <div className={styles.planetsGrid}>
                      {natalChart.planetSignList.map((planet: any, index: number) => (
                        <div key={index} className={styles.planetCard}>
                          <h4>{planet.planet}</h4>
                          <p>{planet.sign}</p>
                        </div>
                      ))}
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

