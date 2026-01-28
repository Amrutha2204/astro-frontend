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
          <h1 className={styles.pageTitle} style={{ marginBottom: 16 }}>Astrology Calendar</h1>
          <div className={styles.noDataContainer}>
            <div className={styles.noDataIcon}>📅</div>
            <h3 className={styles.noDataTitle}>No Data Found</h3>
            <p className={styles.noDataMessage}>Calendar data is currently unavailable. This section is under development.</p>
          </div>

          {/* 🔴 PAGE TITLE */}
          <h2
            style={{
              color: "#d32f2f",
              fontSize: "24px",
              fontWeight: 600,
              marginBottom: "20px",
              borderBottom: "2px solid #f2bcbc",
              paddingBottom: "8px",
            }}
          >
            Panchang Calendar
          </h2>

          {/* ⏳ LOADING */}
          {loading && <p>Loading Panchang...</p>}

          {/* ❌ ERROR */}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {/* 🌼 PANCHANG CONTENT */}
          {calendar && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}
            >
              <InfoCard title="Date" value={calendar.date} />
              {calendar.tithi && (
                <InfoCard title="Tithi" value={calendar.tithi} />
              )}
              {calendar.nakshatra && (
                <InfoCard title="Nakshatra" value={calendar.nakshatra} />
              )}
              {calendar.yoga && (
                <InfoCard title="Yoga" value={calendar.yoga} />
              )}
              {calendar.karana && (
                <InfoCard title="Karana" value={calendar.karana} />
              )}
              {(calendar.sunrise || calendar.sunset) && (
                <InfoCard
                  title="Sun Timings"
                  value={`Sunrise: ${calendar.sunrise} | Sunset: ${calendar.sunset}`}
                />
              )}
              {(calendar.moonRise || calendar.moonSet) && (
                <InfoCard
                  title="Moon Timings"
                  value={`Moonrise: ${calendar.moonRise} | Moonset: ${calendar.moonSet}`}
                />
              )}
            </div>
          )}

          {/* FOOTNOTE */}
          {calendar && (
            <p
              style={{
                marginTop: "16px",
                fontSize: "13px",
                color: "#777",
              }}
            >
              Source: {calendar.source}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

/* 🔶 Reusable Card (matches Dasha cards) */
function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "10px",
        padding: "18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h4
        style={{
          marginBottom: "10px",
          color: "#333",
          fontWeight: 600,
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: "16px",
          color: "#d32f2f",
          fontWeight: 600,
        }}
      >
        {value}
      </p>
    </div>
  );
}
