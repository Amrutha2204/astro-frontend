import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AstrosageHeader from "@/components/layout/AstrosageHeader";
import AstrosageSidebar from "@/components/layout/AstrosageSidebar";
import { astroApi, KundliResponse } from "@/services/api";
import styles from "@/styles/astrosage.module.css";

export default function KundliPage() {
  const router = useRouter();
  const [kundli, setKundli] = useState<KundliResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKundli = async () => {
      try {
        const token = localStorage.getItem("token")?.trim();
        if (!token) {
          router.push("/auth/login");
          return;
        }

        if (token.split(".").length !== 3) {
          setError("Invalid token format. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }

        setLoading(true);
        const data = await astroApi.getMyKundli(token);
        setKundli(data);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load Kundli";
        setError(errorMessage);
        console.error("Error fetching Kundli:", err);
        
        if (errorMessage.includes("Cannot connect")) {
          console.error("Backend service may not be running. Please start astro-service on port 8002");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchKundli();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AstrosageHeader />
        <div className={styles.dashboardContent}>
          <AstrosageSidebar />
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
        <AstrosageHeader />
        <div className={styles.dashboardContent}>
          <AstrosageSidebar />
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error: {error}</p>
              {error.includes("Invalid token") && (
                <p className={styles.errorHint}>
                  Please log out and log in again to get a fresh token.
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
                {error.includes("Invalid token") && (
                  <button
                    className={styles.retryButton}
                    onClick={() => {
                      localStorage.removeItem("token");
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
      <AstrosageHeader />
      <div className={styles.dashboardContent}>
        <AstrosageSidebar />
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

