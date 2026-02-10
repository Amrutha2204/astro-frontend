import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import UpgradePrompt from "@/components/common/UpgradePrompt";
import { reportsApi, ReportItem } from "@/services/reportsService";
import { subscriptionApi } from "@/services/subscriptionService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function ReportsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [canAccess, setCanAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const [sub, list] = await Promise.all([
        subscriptionApi.getMySubscription(t),
        reportsApi.listMy(t),
      ]);
      setCanAccess(!!(sub.isActive && sub.plan && (sub.plan.features || "").includes("premium_reports")));
      setReports(list);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
      setCanAccess(false);
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
    fetchData();
  }, [rehydrated, token, dispatch, router, fetchData]);

  const handleGenerate = async () => {
    const t = token?.trim();
    if (!t) return;
    setGenerating(true);
    try {
      await reportsApi.generate(t, "kundli_summary");
      showSuccess("Report generated. Check the list below.");
      fetchData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  if (!rehydrated || !token?.trim()) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}><p>Loading…</p></main>
        </div>
      </div>
    );
  }

  if (loading && canAccess === null) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}><p>Loading…</p></main>
        </div>
      </div>
    );
  }

  if (canAccess === false) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.kundliContainer}>
              <h1 className={styles.sectionTitle}>Premium Reports</h1>
              <UpgradePrompt featureName="Premium PDF reports (Kundli summary)" />
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
            <h1 className={styles.sectionTitle}>Premium Reports</h1>
            {error && <p className={styles.errorText}>{error}</p>}
            <p className={styles.explanationLine} style={{ marginBottom: "1rem" }}>
              Generate and download your Kundli summary PDF.
            </p>
            <button
              type="button"
              className={styles.chatNowButton}
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? "Generating…" : "Generate Kundli Summary PDF"}
            </button>
            {reports.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Your reports</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {reports.map((r) => (
                    <li key={r.id} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>{r.reportType}</span>
                      <span style={{ color: "#666", fontSize: "0.9rem" }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                      <a
                        href={r.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.retryButton}
                        style={{ padding: "4px 12px", fontSize: "0.85rem", textDecoration: "none", color: "#fff" }}
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
