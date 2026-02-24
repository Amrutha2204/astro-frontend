import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import dashboardStyles from "@/styles/dashboard.module.css";
import styles from "@/styles/careerGuidance.module.css";
import { careerApi, CareerGuidanceResponse } from "@/services/api";
import { selectToken } from "@/store/slices/authSlice";

export default function CareerGuidancePage() {
  const token = useSelector(selectToken) || "";
  const [guidance, setGuidance] = useState<CareerGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuidance = async () => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await careerApi.getCareerGuidance(token);
        setGuidance(res);
      } catch (err: any) {
        console.error("Error fetching career guidance:", err);
        setError("Failed to fetch career guidance. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, [token]);

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.mainContent}>
        <AppSidebar />
        <div className={styles.container}>
          <h2 className={styles.pageTitle}>Career Guidance</h2>

          {loading && (
  <div className={styles.loaderContainer}>
    <div className={styles.spinner}></div>
    <p>Generating career guidance...</p>
  </div>
)}
          {error && <p className={styles.error}>{error}</p>}

          {guidance && (
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Career Advice</h3>
              <p className={styles.guidanceText}>
                {guidance.guidance.split("\n").map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              <p className={styles.timestamp}>
                Guidance generated on: {new Date(guidance.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}