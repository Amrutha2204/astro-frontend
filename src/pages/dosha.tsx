import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { doshaApi, type DoshaResponse } from "@/services/doshaService";
import { showError } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

export default function DoshaPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [dosha, setDosha] = useState<DoshaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDosha = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await doshaApi.checkDoshas(t);
      setDosha(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Dosha";
      setError(msg);
      showError(msg);
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
    fetchDosha();
  }, [rehydrated, token, dispatch, router, fetchDosha]);

  const getSeverityBorderClass = (severity?: string) => {
    switch (severity) {
      case "High":
        return "border-l-[#9c4a3d]";
      case "Medium":
        return "border-l-[#a67c00]";
      case "Low":
        return "border-l-[#8b7b4a]";
      default:
        return "border-l-[#5c4033]";
    }
  };

  const getSeverityBadgeClass = (severity?: string) => {
    switch (severity) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-amber-500";
      case "Low":
        return "bg-emerald-500";
      default:
        return "bg-slate-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-56px)] w-full overflow-y-auto overflow-x-hidden bg-white/70 backdrop-blur-[6px] p-8 max-[768px]:ml-[200px]">
            <Loading text="Loading your Dosha Check..." />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-5">
              {error && <ErrorMessage message={error} />}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={fetchDosha}
                  className="flex items-center gap-[6px] rounded-[6px] rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)]"
                >
                  🔄 Retry
                </button>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="flex items-center gap-[6px] rounded-[6px] rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)]"
                >
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader
              onBack={() => router.back()}
              onRefresh={fetchDosha}
              refreshAriaLabel="Refresh dosha"
              disableRefresh={loading}
            />
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Your dosha check
            </h1>

            {dosha && (
              <>
                <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#7c3aed] bg-white/60 px-3 py-2 text-[14px] italic text-slate-700">
                  These results are based on your birth chart’s planetary positions.
                </p>
                <div className="mb-[30px]">
                  <div className="mx-auto max-w-[400px] rounded-[12px] border border-white/60 bg-gradient-to-br from-white via-[#fff7ed] to-[#f3e8ff] shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur p-8 text-center">
                    <h3 className="text-[20px] font-bold text-[#7c3aed]">Total Doshas</h3>
                    <p
                      className={`my-[10px] text-[2.5rem] font-semibold ${dosha.totalDoshas > 0 ? "text-[#ef4444]" : "text-[#7c3aed]"}`}
                    >
                      {dosha.totalDoshas}
                    </p>
                    <p className="m-0 text-[0.875rem] text-[#6b7280]">
                      {dosha.totalDoshas === 0
                        ? "No doshas detected"
                        : `${dosha.totalDoshas} dosha(s) found`}
                    </p>
                  </div>
                </div>

                {dosha.totalDoshas > 0 ? (
                  <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
                    {dosha.manglik.hasDosha && (
                      <div
                        className={`group relative overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-br from-white via-[#fff7ed] to-[#f3e8ff] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(124,58,237,0.18)] ${getSeverityBorderClass(dosha.manglik.severity)}`}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-[20px] font-bold text-[#7c3aed]">Manglik Dosha</h3>
                          <span
                            className={`rounded-[12px] px-3 py-1 text-[0.875rem] font-semibold text-white ${getSeverityBadgeClass(dosha.manglik.severity)}`}
                          >
                            {dosha.manglik.severity || "Present"}
                          </span>
                        </div>
                        <p className="m-0 text-[14px] leading-[1.6] text-[#6b7280]">
                          {dosha.manglik.description}
                        </p>
                      </div>
                    )}
                    {dosha.nadi.hasDosha && (
                      <div className="rounded-[8px] border-l-[4px] border-l-[#9c4a3d] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-[20px] font-bold text-[#6b4423]">Nadi Dosha</h3>
                          <span className="rounded-[12px] bg-[#9c4a3d] px-3 py-1 text-[0.875rem] font-semibold text-white">
                            Present
                          </span>
                        </div>
                        <p className="m-0 text-[14px] leading-[1.6] text-[#6b7280]">
                          {dosha.nadi.description}
                        </p>
                      </div>
                    )}
                    {dosha.bhakoot.hasDosha && (
                      <div className="rounded-[8px] border-l-[4px] border-l-[#9c4a3d] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-[20px] font-bold text-[#6b4423]">Bhakoot Dosha</h3>
                          <span className="rounded-[12px] bg-[#9c4a3d] px-3 py-1 text-[0.875rem] font-semibold text-white">
                            Present
                          </span>
                        </div>
                        <p className="m-0 text-[14px] leading-[1.6] text-[#6b7280]">
                          {dosha.bhakoot.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-[0.875rem] text-[#6b7280]">
                    No doshas detected. All checked parameters (Manglik, Nadi, Bhakoot) are clear.
                  </p>
                )}
                <CalculationInfo showDasha={false} showAyanamsa={true} />
                <TrustNote variant="loggedIn" />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
