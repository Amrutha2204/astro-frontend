import { useEffect, useState } from "react";
import AstrosageHeader from "@/components/layout/AstrosageHeader";
import AstrosageSidebar from "@/components/layout/AstrosageSidebar";
import styles from "@/styles/astrosage.module.css";
import {
  getTodayTransits,
  TodayTransitsResponse,
} from "@/services/transits";

export default function TransitsPage() {
  const [data, setData] = useState<TodayTransitsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTodayTransits()
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <AstrosageHeader />
      <div className={styles.dashboardContent}>
        <AstrosageSidebar />

        <main className={styles.mainContent}>
          <h2 className={styles.pageTitle}>🌠 Today’s Planetary Transits</h2>

          {loading && <p>🔮 Reading the movements of the grahas...</p>}

          {!loading && data && (
            <>
              {/* 🌞 Sun & 🌙 Moon */}
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <h3>☀️ Sun</h3>
                  <p>
                    {data.currentPlanetPositions.sun?.sign.name ||
                      "Position unavailable"}
                  </p>
                </div>

                <div className={styles.card}>
                  <h3>🌙 Moon</h3>
                  <p>
                    {data.currentPlanetPositions.moon?.sign.name ||
                      "Position unavailable"}
                  </p>
                </div>
              </div>

              {/* 🪐 Major Transits */}
              <div className={styles.section}>
                <h3>🪐 Major Active Transits</h3>

                {data.majorActiveTransits.length === 0 ? (
                  <p>No major transits influencing today.</p>
                ) : (
                  data.majorActiveTransits.map((transit, index) => (
                    <div key={index} className={styles.transitCard}>
                      <h4>
                        {transit.planet} in {transit.sign}
                      </h4>
                      <p>{transit.description}</p>
                    </div>
                  ))
                )}
              </div>

              <p className={styles.footerNote}>
                ✨ Source: {data.source} | 📅 {data.date}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
