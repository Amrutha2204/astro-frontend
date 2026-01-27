import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AstrosageHeader";
import AppSidebar from "@/components/layout/AstrosageSidebar";
import styles from "@/styles/dashboard.module.css";
import { astroApi, TransitResponse } from "@/services/api";

export default function TransitsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transits, setTransits] = useState<TransitResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();

    // 🔐 Auth check
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
      } catch (err: any) {
        setError(err.message || "Failed to load transit data");
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
          <h2>🌌 Today’s Planetary Transits</h2>

          {/* 🔄 Loading */}
          {loading && <p>Loading today’s transits...</p>}

          {/* ❌ Error */}
          {!loading && error && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>⚠️</div>
              <h3 className={styles.noDataTitle}>Error</h3>
              <p className={styles.noDataMessage}>{error}</p>
            </div>
          )}

          {/* 🌠 Transit Data */}
          {!loading && transits && (
            <>
              <p>
                <strong>Date:</strong> {transits.date}
              </p>

              <ul style={{ marginTop: "1rem" }}>
                {transits.planetTransits.map((t, index) => (
                  <li
                    key={index}
                    style={{
                      background: "#f5f5f5",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>{t.planet}</strong> moved from{" "}
                    <strong>{t.fromSign}</strong> →{" "}
                    <strong>{t.toSign}</strong> ({t.degree}°)
                  </li>
                ))}
              </ul>

              <p style={{ marginTop: "1rem", fontSize: "12px", color: "#777" }}>
                Source: {transits.source}
              </p>
            </>
          )}

          {/* 🚫 No Data */}
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
