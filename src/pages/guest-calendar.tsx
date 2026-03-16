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
          <div className="mb-6">
            <button
  onClick={() => router.back()}
  className="bg-transparent border-none text-[#8b5a2b] cursor-pointer mb-2 text-sm"
>
              ← Back to Home
            </button>

            <h1 className="text-[26px]">🪔 Today’s Panchang</h1>
            <p className="opacity-60">
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
            <div className="grid gap-[18px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
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
    <div className="p-[18px] rounded-[14px] bg-gradient-to-br from-[#fffaf0] to-white border border-[#f0e6d8] shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
      <h3 className="text-[15px] mb-[6px]">{title}</h3>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
