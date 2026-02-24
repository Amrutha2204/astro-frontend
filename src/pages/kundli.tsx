import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi, KundliResponse } from "@/services/api";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function KundliPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [kundli, setKundli] = useState<KundliResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKundli = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await astroApi.getMyKundli(t);
      setKundli(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Kundli";
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
    fetchKundli();
  }, [rehydrated, token, dispatch, router, fetchKundli]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading your Kundli...</p>
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
              {error.includes("Invalid token") && (
                <p className={styles.errorHint}>
                  Please log out and log in again to get a fresh token.
                </p>
              )}
              <div className={styles.errorActions}>
                <button
                  className={styles.retryButton}
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    fetchKundli();
                  }}
                >
                  Retry
                </button>
                {error.includes("Invalid token") && (
                  <button
                    className={styles.retryButton}
                    onClick={() => {
                      dispatch(clearToken());
                      router.push("/auth/login");
                    }}
                  >
                    Go to Login
                  </button>
                )}
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
            <h1 className={styles.pageTitle}>My Kundli</h1>

            {kundli && (
              <div className={styles.kundliContent}>
                <div className={styles.kundliSection}>
                  <h2 className={styles.sectionTitle}>Basic Information</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Lagna (Ascendant):</span>
                      <span className={styles.infoValue}>{kundli.lagna || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Moon Sign:</span>
                      <span className={styles.infoValue}>{kundli.moonSign || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Nakshatra:</span>
                      <span className={styles.infoValue}>{kundli.nakshatra || "N/A"}</span>
                    </div>
                    {kundli.pada && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Pada:</span>
                        <span className={styles.infoValue}>{kundli.pada}</span>
                      </div>
                    )}
                  </div>
                </div>

                {kundli.planetaryPositions && Array.isArray(kundli.planetaryPositions) && kundli.planetaryPositions.length > 0 && (
                  <div className={styles.kundliSection}>
                    <h2 className={styles.sectionTitle}>Planetary Positions</h2>
                    <div className={styles.planetsGrid}>
                      {kundli.planetaryPositions.map((planetData) => (
                        <div key={planetData.planet} className={styles.planetCard}>
                          <div className={styles.planetName}>{planetData.planet}</div>
                          <div className={styles.planetSign}>{planetData.sign}</div>
                          {typeof planetData.degree === 'number' && (
                            <div className={styles.planetDegree}>
                              {planetData.degree.toFixed(2)}°
                            </div>
                          )}
                          {planetData.nakshatra && (
                            <div className={styles.planetNakshatra}>
                              {planetData.nakshatra} {planetData.pada ? `- Pada ${planetData.pada}` : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {kundli.houses && Array.isArray(kundli.houses) && kundli.houses.length > 0 && (
                  <div className={styles.kundliSection}>
                    <h2 className={styles.sectionTitle}>Houses</h2>
                    <div className={styles.housesGrid}>
                      {kundli.houses.map((houseData) => (
                        <div key={houseData.house} className={styles.houseCard}>
                          <div className={styles.houseNumber}>House {houseData.house}</div>
                          <div className={styles.houseSign}>{houseData.sign}</div>
                          <div className={styles.houseCusp}>
                            {typeof houseData.degree === 'number' 
                              ? `${houseData.degree.toFixed(2)}°` 
                              : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.sourceInfo}>
                  <span className={styles.sourceLabel}>Source:</span>
                  <span className={styles.sourceValue}>{kundli.source}</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

