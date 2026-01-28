import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/dashboard.module.css";
import { astroApi, TransitsTodayResponse } from "@/services/api";

export default function TransitsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transits, setTransits] = useState<TransitsTodayResponse | null>(null);

  useEffect(() => {
    const fetchTransits = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await astroApi.getTransitsToday();
        setTransits(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load transits");
      } finally {
        setLoading(false);
      }
    };
    fetchTransits();
  }, []);

  const positions = transits?.currentPlanetPositions
    ? Object.entries(transits.currentPlanetPositions)
    : [];
  const major = transits?.majorActiveTransits || [];

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <h2 className={styles.pageTitle}>Today's Planetary Transits</h2>

          {loading && <p className={styles.noDataMessage}>Loading today's transits...</p>}

          {!loading && error && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>⚠️</div>
              <h3 className={styles.noDataTitle}>Error</h3>
              <p className={styles.noDataMessage}>{error}</p>
            </div>
          )}

          {!loading && transits && !error && (
            <>
              <p className={styles.noDataMessage} style={{ marginBottom: 16 }}>
                <strong>Date:</strong> {transits.date}
              </p>

              {positions.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#5c4033", marginBottom: 10 }}>
                    Current positions
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0", display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {positions.map(([k, v]) => (
                      <li
                        key={k}
                        style={{
                          background: "#faf8f5",
                          border: "1px solid #e8ddd0",
                          padding: "10px 14px",
                          borderRadius: 8,
                        }}
                      >
                        <strong>{v?.name || k}</strong>: {typeof v?.sign === "object" ? (v.sign as { name?: string })?.name : String(v?.sign ?? "")}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {major.length > 0 && (
                <>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#5c4033", marginBottom: 10 }}>
                    Major active transits
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {major.map((t, i) => (
                      <li
                        key={i}
                        style={{
                          background: "#faf8f5",
                          border: "1px solid #e8ddd0",
                          padding: "12px 14px",
                          borderRadius: 8,
                          marginBottom: 10,
                        }}
                      >
                        <strong>{t.planet}</strong> in <strong>{t.sign}</strong>
                        {t.description && ` — ${t.description}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {positions.length === 0 && major.length === 0 && (
                <div className={styles.noDataContainer}>
                  <div className={styles.noDataIcon}>🪐</div>
                  <h3 className={styles.noDataTitle}>No transit data</h3>
                  <p className={styles.noDataMessage}>Transit data is currently unavailable.</p>
                </div>
              )}

              {transits.source && (positions.length > 0 || major.length > 0) && (
                <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>Source: {transits.source}</p>
              )}
            </>
          )}

          {!loading && !error && !transits && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🪐</div>
              <h3 className={styles.noDataTitle}>No Data Found</h3>
              <p className={styles.noDataMessage}>Transit data is currently unavailable.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
