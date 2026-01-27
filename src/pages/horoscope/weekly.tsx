import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { horoscopeApi } from "@/services/horoscopeService";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function WeeklyHoroscopePage() {
  const router = useRouter();
  const [horoscope, setHoroscope] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoroscope = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (token.split(".").length !== 3) {
        setError("Invalid token format. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
        return;
      }

      setLoading(true);
      const data = await horoscopeApi.getWeeklyHoroscope(token);
      console.log("📅 Weekly Horoscope API Response:", JSON.stringify(data, null, 2));
      setHoroscope(data);
      setError(null);
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to load Weekly Horoscope";
      setError(errorMessage);
      console.error("Error fetching Weekly Horoscope:", err);
      
      if (errorMessage.includes("Cannot connect")) {
        console.error("Backend service may not be running. Please start astro-service on port 8002");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoroscope();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
              <p>Loading your personalized weekly predictions...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
              <div style={{ color: "red", margin: "20px 0" }}>
                <p><strong>Error:</strong> {error}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button onClick={fetchHoroscope} className={styles.primaryButton}>
                  Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={styles.secondaryButton}>
                  Go to Login
                </button>
              </div>
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
            <div className={styles.pageHeader}>
              <button 
                onClick={() => router.push("/dashboard")} 
                className={styles.backButton}
                aria-label="Go back to dashboard"
              >
                ← Back
              </button>
              <div className={styles.headerActions}>
                <button 
                  onClick={fetchHoroscope} 
                  className={styles.refreshButton}
                  aria-label="Refresh horoscope"
                  disabled={loading}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            <h1 className={styles.sectionTitle}>📅 Weekly Horoscope</h1>
            
            {horoscope && (
              <>
                {horoscope.weekStart && (
                  <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                      <h3>Week Starting</h3>
                      <p className={styles.infoValue}>
                        {new Date(horoscope.weekStart).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {horoscope.predictions && Array.isArray(horoscope.predictions) && horoscope.predictions.length > 0 && (
                  <div style={{ marginTop: "30px" }}>
                    <h2 className={styles.sectionTitle}>Daily Predictions</h2>
                    <div className={styles.planetsGrid}>
                      {horoscope.predictions.map((prediction: any, index: number) => (
                        <div key={index} className={styles.planetCard}>
                          <h4>
                            {prediction.day ? `${prediction.day}, ` : ""}
                            {prediction.date ? new Date(prediction.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            }) : `Day ${index + 1}`}
                          </h4>
                          {prediction.horoscope?.dayType && (
                            <p style={{ marginBottom: "8px" }}>
                              <strong>Type:</strong> <span style={{ 
                                color: prediction.horoscope.dayType === 'Good' ? '#10b981' : 
                                       prediction.horoscope.dayType === 'Challenging' ? '#ef4444' : '#6b7280'
                              }}>
                                {prediction.horoscope.dayType}
                              </span>
                            </p>
                          )}
                          {prediction.horoscope?.mainTheme && (
                            <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: "1.5" }}>
                              <strong>Theme:</strong> {prediction.horoscope.mainTheme}
                            </p>
                          )}
                          {prediction.horoscope?.reason && (
                            <p style={{ marginTop: "10px", fontSize: "13px", color: "#666", fontStyle: "italic" }}>
                              {prediction.horoscope.reason}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
