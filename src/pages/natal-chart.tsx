import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { astroApi } from "@/services/api";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";
import SunSignExplorer from "@/components/common/SunSignExplorer";

const sunSignMeaning: Record<string, string> = {
  Aries: "Action-driven, bold, energetic. You thrive on initiative.",
  Taurus: "Grounded, patient, and stable. You build lasting foundations.",
  Gemini: "Curious communicator who adapts quickly.",
  Cancer: "Emotional protector with strong intuition.",
  Leo: "Confident leader who shines through creativity.",
  Virgo: "Analytical thinker focused on improvement.",
  Libra: "Diplomatic harmonizer seeking balance.",
  Scorpio: "Intense transformer driven by truth.",
  Sagittarius: "Explorer seeking wisdom and freedom.",
  Capricorn: "Disciplined builder focused on success.",
  Aquarius: "Innovative thinker valuing independence.",
  Pisces: "Intuitive dreamer with deep compassion.",
};

const REDIRECT_DELAY_MS = 2000;

type NatalPlanet = {
  planet: string;
  sign: string;
};

type NatalChartData = {
  sunSign?: string;
  moonSign?: string;
  ascendant?: string;
  planetSignList?: NatalPlanet[];
};

export default function NatalChartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNatalChart = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = (await astroApi.getNatalChart(t)) as NatalChartData;
      setNatalChart(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Natal Chart";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error(
          "Backend service may not be running. Please start astro-service on port 8002",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchNatalChart();
  }, [rehydrated, token, dispatch, router, fetchNatalChart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <div className="relative mx-auto max-w-[1200px]">
              <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                ⭐ Natal Chart
              </h1>
              <p>Loading your birth chart...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={fetchNatalChart}
              refreshAriaLabel="Refresh natal chart"
              disableRefresh={loading}
            />

            <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              ⭐ Natal Chart
            </h1>
            {error && <ErrorMessage message={error} />}

            {natalChart && (
              <>
                <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
                  <div className="rounded-[14px] border border-[#eae8e4] bg-white p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-2 text-[16px] font-semibold text-[#6b4423]">Sun Sign</h3>
                    <p className="text-[20px] font-bold text-[#845127]">
                      {natalChart.sunSign || "N/A"}
                    </p>
                    {natalChart.sunSign && (
                      <p className="mt-2 opacity-[0.85]">
                        {sunSignMeaning[natalChart.sunSign] || ""}
                      </p>
                    )}
                  </div>
                  <div className="rounded-[14px] border border-[#eae8e4] bg-white p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-2 text-[16px] font-semibold text-[#6b4423]">Moon Sign</h3>
                    <p className="text-[20px] font-bold text-[#845127]">
                      {natalChart.moonSign || "N/A"}
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[#eae8e4] bg-white p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
                    <h3 className="mb-2 text-[16px] font-semibold text-[#6b4423]">
                      Ascendant (Lagna)
                    </h3>
                    <p className="text-[20px] font-bold text-[#845127]">
                      {natalChart.ascendant || "N/A"}
                    </p>
                  </div>
                </div>

                {natalChart.planetSignList && natalChart.planetSignList.length > 0 && (
                  <div className="mt-[30px]">
                    <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                      Planetary Positions
                    </h2>
                    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[14px]">
                      {natalChart.planetSignList.map((planet: NatalPlanet, index: number) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-[14px] border border-[#eae8e4] bg-white p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,transform] duration-200 hover:border-[#e0ddd8] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                        >
                          <div className="mb-2 text-[18px] font-semibold text-[#1f2937]">
                            {planet.planet}
                          </div>
                          <div className="text-[16px] font-medium text-[#6b5b52]">
                            {planet.sign}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {natalChart.sunSign && <SunSignExplorer userSign={natalChart.sunSign} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
