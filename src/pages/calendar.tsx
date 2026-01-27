import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi, CalendarResponse } from "@/services/api";
import styles from "@/styles/dashboard.module.css";

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
        setLoading(true);
        const data = await astroApi.getTodayCalendar(token);
        setCalendar(data);
      } catch (err) {
        const e = err as { message?: string };
        setError(e.message || "Failed to fetch calendar data");
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
          {loading && <p>Loading calendar data...</p>}

          {error && (
            <div className={styles.errorBox}>
              ⚠️ Error <br />
              {error}
            </div>
          )}

          {calendar && !loading && !error && (
            <div className={styles.calendarContainer}>
              <h2>🌞 Today’s Panchang</h2>
              <p><strong>Date:</strong> {calendar.date}</p>
              {calendar.tithi && <p><strong>Tithi:</strong> {calendar.tithi}</p>}
              {calendar.nakshatra && <p><strong>Nakshatra:</strong> {calendar.nakshatra}</p>}
              {calendar.yoga && <p><strong>Yoga:</strong> {calendar.yoga}</p>}
              {calendar.karana && <p><strong>Karana:</strong> {calendar.karana}</p>}
              {calendar.sunrise && <p><strong>Sunrise:</strong> {calendar.sunrise}</p>}
              {calendar.sunset && <p><strong>Sunset:</strong> {calendar.sunset}</p>}
              {calendar.moonRise && <p><strong>Moon Rise:</strong> {calendar.moonRise}</p>}
              {calendar.moonSet && <p><strong>Moon Set:</strong> {calendar.moonSet}</p>}
              <p><em>Source: {calendar.source}</em></p>
            </div>
          )}

          {!loading && !calendar && !error && (
            <div className={styles.noDataContainer}>
              <div className={styles.noDataIcon}>🪔</div>
              <h2 className={styles.noDataTitle}>No Data Found</h2>
              <p className={styles.noDataMessage}>
                Calendar data is not available right now.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
