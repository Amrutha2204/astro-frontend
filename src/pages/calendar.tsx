import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi } from "@/services/api";
import styles from "@/styles/dashboard.module.css";

interface CalendarResponse {
  date: string;
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
  sunrise?: string;
  sunset?: string;
  moonRise?: string;
  moonSet?: string;
  source: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();
    if (!token || token.split(".").length !== 3) {
      router.replace("/auth/login");
      return;
    }

    const fetchCalendar = async () => {
      try {
        const data = await astroApi.getTodayCalendar(token);
        setCalendar(data);
      } catch (err) {
        const e = err as { message?: string };
        setError(e.message || "Unable to load Panchang");
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [router]);

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>

          {/* 🌸 PAGE HEADER */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "26px" }}>🪔 Today’s Panchang</h1>
            <p style={{ opacity: 0.7 }}>
              Divine calendar based on Vedic astrology
            </p>
          </div>

          {/* ⏳ LOADING */}
          {loading && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🌸</div>
              <p>Loading divine energies...</p>
            </div>
          )}

          {/* ❌ ERROR */}
          {error && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {/* 🌞 PANCHANG DATA */}
          {calendar && !loading && !error && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              {/* DATE */}
              <DivineCard title="📅 Date" value={calendar.date} />

              {/* TITHI */}
              {calendar.tithi && (
                <DivineCard title="🌙 Tithi" value={calendar.tithi} />
              )}

              {/* NAKSHATRA */}
              {calendar.nakshatra && (
                <DivineCard title="⭐ Nakshatra" value={calendar.nakshatra} />
              )}

              {/* YOGA */}
              {calendar.yoga && (
                <DivineCard title="✨ Yoga" value={calendar.yoga} />
              )}

              {/* KARANA */}
              {calendar.karana && (
                <DivineCard title="🔱 Karana" value={calendar.karana} />
              )}

              {/* SUN */}
              {(calendar.sunrise || calendar.sunset) && (
                <DivineCard
                  title="🌞 Sun Timings"
                  value={`Sunrise: ${calendar.sunrise} | Sunset: ${calendar.sunset}`}
                />
              )}

              {/* MOON */}
              {(calendar.moonRise || calendar.moonSet) && (
                <DivineCard
                  title="🌕 Moon Timings"
                  value={`Moonrise: ${calendar.moonRise} | Moonset: ${calendar.moonSet}`}
                />
              )}
            </div>
          )}

          {/* 🌼 FOOTNOTE */}
          {calendar && (
            <p style={{ marginTop: "20px", opacity: 0.5 }}>
              Source: {calendar.source}
            </p>
          )}

        </main>
      </div>
    </div>
  );
}

/* 🌺 Small Divine Card Component */
function DivineCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #fff7e6, #fff)",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: "8px", fontSize: "16px" }}>{title}</h3>
      <p style={{ fontSize: "15px", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
