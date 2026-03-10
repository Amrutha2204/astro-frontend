import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { astroApi } from "@/services/api";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";
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
  Pisces: "Intuitive dreamer with deep compassion."
};

const REDIRECT_DELAY_MS = 2000;

export default function NatalChartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [natalChart, setNatalChart] = useState<any>(null);
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
      const data = await astroApi.getNatalChart(t);
      setNatalChart(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Natal Chart";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error("Backend service may not be running. Please start astro-service on port 8002");
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchNatalChart();
  }, [rehydrated, token, dispatch, router, fetchNatalChart]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>⭐ Natal Chart</h1>
              <p>Loading your birth chart...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <PageHeader
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={fetchNatalChart}
              refreshAriaLabel="Refresh natal chart"
              disableRefresh={loading}
            />

            <h1 className={styles.sectionTitle}>⭐ Natal Chart</h1>
            {error && <ErrorMessage message={error} />}
            
            {natalChart && (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
  <h3>Sun Sign</h3>

  <p className={styles.infoValue}>
    {natalChart.sunSign || "N/A"}
  </p>

  {natalChart.sunSign && (
    <p style={{ marginTop: "8px", opacity: 0.85 }}>
      {sunSignMeaning[natalChart.sunSign] || ""}
    </p>
  )}
</div>
                  <div className={styles.infoCard}>
                    <h3>Moon Sign</h3>
                    <p className={styles.infoValue}>{natalChart.moonSign || "N/A"}</p>
                  </div>
                  <div className={styles.infoCard}>
                    <h3>Ascendant (Lagna)</h3>
                    <p className={styles.infoValue}>{natalChart.ascendant || "N/A"}</p>
                  </div>
                </div>

                {natalChart.planetSignList && natalChart.planetSignList.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h2 className={styles.sectionTitle}>Planetary Positions</h2>
                    <div className={styles.planetsGrid}>
                      {natalChart.planetSignList.map((planet: any, index: number) => (
                        <div key={index} className={styles.planetCard}>
                          <div className={styles.planetName}>{planet.planet}</div>
                          <div className={styles.planetSign}>{planet.sign}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {natalChart.sunSign && (
      <SunSignExplorer userSign={natalChart.sunSign} />
    )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

