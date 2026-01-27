import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/dashboard.module.css";
import { astroApi, TransitResponse } from "@/services/api";

export default function TransitsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transits, setTransits] = useState<TransitResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();

    if (!token || token.split(".").length !== 3) {
      router.replace("/auth/login");
      return;
    }

    const fetchTransits = async () => {
      try {
        setLoading(true);
        const data = await astroApi.getTodayTransit(token);
        setTransits(data);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load transit data");
      } finally {
        setLoading(false);
      }
    };

    fetchTransits();
  }, [router]);

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

          {!loading && transits && (
            <>
              <p className={styles.noDataMessage} style={{ marginBottom: 16 }}>
                <strong>Date:</strong> {transits.date}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {transits.planetTransits.map((t, index) => (
                  <li
                    key={index}
                    style={{
                      background: "#faf8f5",
                      border: "1px solid #e8ddd0",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>{t.planet}</strong> in <strong>{t.fromSign}</strong> → <strong>{t.toSign}</strong> ({t.degree}°)
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: "1rem", fontSize: "12px", color: "#6b7280" }}>
                Source: {transits.source}
              </p>
            </>
          )}

          {!loading && !error && !transits && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🪐</div>
              <h3 className={styles.noDataTitle}>No Data Found</h3>
              <p className={styles.noDataMessage}>
                Transit data is currently unavailable.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
