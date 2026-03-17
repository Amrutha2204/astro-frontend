import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />

      <div className="flex w-full">
        <AppSidebar />

        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="mb-[10px] border-none bg-transparent text-[14px] text-[#8b5a2b]"
            >
              ← Back to Home
            </button>

            <h1 className="text-[26px] font-bold text-[#6b4423]">🪔 Today’s Panchang</h1>
            <p className="opacity-60">Sacred Vedic calendar · Guest View</p>
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center rounded-[8px] border border-[#e8ddd0] bg-[#fdf8f3] px-4 py-3">
              <div className="mr-2 text-[24px]">🌼</div>
              <p>Loading divine timings...</p>
            </div>
          )}

          {!loading && error && (
            <div className="mt-4 flex items-center justify-center rounded-[8px] border border-[#e8ddd0] bg-[#fdf8f3] px-4 py-3">
              <div className="mr-2 text-[24px]">⚠️</div>
              <h3>Error</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && calendar && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px]">
              <DivineCard title="📅 Date" value={calendar.date} />
              <DivineCard title="🌕 Moon Phase" value={calendar.moonPhase} />
              <DivineCard title="🌙 Tithi" value={calendar.tithi} />
              <DivineCard title="⭐ Nakshatra" value={calendar.nakshatra} />

              {Array.isArray(calendar.majorPlanetaryEvents) &&
                calendar.majorPlanetaryEvents.map((event, index) => (
                  <DivineCard key={index} title={`✨ Event ${index + 1}`} value={event} />
                ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DivineCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-[#f0e6d8] bg-[linear-gradient(135deg,#fffaf0,#ffffff)] p-[18px] shadow-[0_6px_14px_rgba(0,0,0,0.06)]">
      <h3 className="mb-[6px] text-[15px] font-semibold text-[#6b4423]">{title}</h3>
      <p className="text-[14px] font-medium">{value}</p>
    </div>
  );
}
