import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import UpgradePrompt from "@/components/common/UpgradePrompt";
import { reportsApi, type ReportItem } from "@/services/reportsService";
import { subscriptionApi } from "@/services/subscriptionService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";

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
  const pageClass = "min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]";
  const contentClass = "flex w-full";
  const mainClass =
    "h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 ml-[250px]";
  const containerClass = "relative mx-auto max-w-[1200px]";
  const primaryButtonClass =
    "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";

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
      setCanAccess(
        !!(sub.isActive && sub.plan && (sub.plan.features || "").includes("premium_reports")),
      );
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
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchData();
  }, [rehydrated, token, dispatch, router, fetchData]);

  const handleGenerate = async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
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
      <div className={pageClass}>
        <AppHeader />
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <p>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  if (loading && canAccess === null) {
    return (
      <div className={pageClass}>
        <AppHeader />
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <p>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  if (canAccess === false) {
    return (
      <div className={pageClass}>
        <AppHeader />
        <div className={contentClass}>
          <AppSidebar />
          <main className={mainClass}>
            <div className={containerClass}>
              <h1 className="mb-6 text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                Premium Reports
              </h1>
              <UpgradePrompt featureName="Premium PDF reports (Kundli summary)" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <AppHeader />
      <div className={contentClass}>
        <AppSidebar />
        <main className={mainClass}>
          <div className={containerClass}>
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Premium Reports
            </h1>
            {error && <p className="mt-[10px] text-[14px] text-[#d32f2f]">{error}</p>}
            <p className="mb-4 mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
              Generate and download your Kundli summary PDF.
            </p>
            <button
              type="button"
              className={primaryButtonClass}
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? "Generating…" : "Generate Kundli Summary PDF"}
            </button>
            {reports.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2 text-[1rem]">Your reports</h2>
                <ul className="list-none p-0">
                  {reports.map((r) => (
                    <li key={r.id} className="mb-2 flex items-center gap-2">
                      <span>{r.reportType}</span>
                      <span className="text-[0.9rem] text-[#666666]">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                      <a
                        href={r.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className={primaryButtonClass}
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
