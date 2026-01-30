import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import styles from "@/styles/dashboard.module.css";
import { astroApi, GuestCalendarResponse } from "@/services/api";

export default function GuestCalendarPage() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<GuestCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestCalendar = async () => {
      try {
        setLoading(true);
        const data = await astroApi.getGuestCalendar();
        setCalendar(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to load Panchang");
      } finally {
        setLoading(false);
      }
    };

    fetchGuestCalendar();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />

      <div className={styles.dashboardContent}>
        <AppSidebar />

        <main className={styles.mainContent}>
          {/* 🌸 HEADER */}
          <div style={{ marginBottom: "24px" }}>
            <button
              onClick={() => router.back()}
              style={{
                background: "transparent",
                border: "none",
                color: "#8b5a2b",
                cursor: "pointer",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              ← Back to Home
            </button>

            <h1 style={{ fontSize: "26px" }}>🪔 Today’s Panchang</h1>
            <p style={{ opacity: 0.6 }}>
              Sacred Vedic calendar · Guest View
            </p>
          </div>

          {/* ⏳ LOADING */}
          {loading && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🌼</div>
              <p>Loading divine timings...</p>
            </div>
          )}

          {/* ❌ ERROR */}
          {!loading && error && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* 🌞 PANCHANG */}
          {!loading && calendar && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              <DivineCard title="📅 Date" value={calendar.date} />
              <DivineCard title="🌕 Moon Phase" value={calendar.moonPhase} />
              <DivineCard title="🌙 Tithi" value={calendar.tithi} />
              <DivineCard title="⭐ Nakshatra" value={calendar.nakshatra} />

              {Array.isArray(calendar.majorPlanetaryEvents) &&
                calendar.majorPlanetaryEvents.map((event, index) => (
                  <DivineCard
                    key={index}
                    title={`✨ Event ${index + 1}`}
                    value={event}
                  />
                ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* 🌺 DIVINE CARD */
function DivineCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #fffaf0, #ffffff)",
        border: "1px solid #f0e6d8",
        boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
      }}
    >
      <h3 style={{ fontSize: "15px", marginBottom: "6px" }}>{title}</h3>
      <p style={{ fontSize: "14px", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
