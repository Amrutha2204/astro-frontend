import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  adminApi,
  type AdminStats,
  type AdminTransaction,
  type AdminReport,
  type AdminContent,
} from "@/services/api";
import {
  selectToken,
  selectIsRehydrated,
  selectRoleId,
  ADMIN_ROLE_ID,
} from "@/store/slices/authSlice";

type AdminTab = "overview" | "transactions" | "reports" | "content";

export default function AdminPage() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const rehydrated = useSelector(selectIsRehydrated);
  const roleId = useSelector(selectRoleId);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
  const [content, setContent] = useState<AdminContent>({});
  const [aiEnabled, setAiEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      setError("Please log in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getStats(t);
      setStats(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load stats.";
      setError(
        msg.includes("403") || msg.toLowerCase().includes("admin") ? "Admin access required." : msg,
      );
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
    setLoadingTx(true);
    try {
      const res = await adminApi.getTransactions(t, 50, 0);
      setTransactions(res.items);
      setTransactionsTotal(res.total);
    } catch {
      setTransactions([]);
      setTransactionsTotal(0);
    } finally {
      setLoadingTx(false);
    }
  }, [token]);

  const fetchReports = useCallback(async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
    setLoadingReports(true);
    try {
      const res = await adminApi.getReports(t, 50, 0);
      setReports(res.items);
      setReportsTotal(res.total);
    } catch {
      setReports([]);
      setReportsTotal(0);
    } finally {
      setLoadingReports(false);
    }
  }, [token]);

  const fetchContent = useCallback(async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
    setLoadingContent(true);
    try {
      const [contentRes, aiRes] = await Promise.all([
        adminApi.getContent(t),
        adminApi.getAiEnabled(t),
      ]);
      setContent(contentRes);
      setAiEnabled(aiRes.enabled);
    } catch {
      setContent({});
      setAiEnabled(true);
    } finally {
      setLoadingContent(false);
    }
  }, [token]);

  const saveContent = useCallback(async () => {
    const t = token?.trim();
    if (!t) {
      return;
    }
    setSavingContent(true);
    try {
      await adminApi.setContent(t, content);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save content.");
    } finally {
      setSavingContent(false);
    }
  }, [token, content]);

  const saveAiEnabled = useCallback(
    async (enabled: boolean) => {
      const t = token?.trim();
      if (!t) {
        return;
      }
      try {
        await adminApi.setAiEnabled(t, enabled);
        setAiEnabled(enabled);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update AI setting.");
      }
    },
    [token],
  );

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    fetchStats();
  }, [rehydrated, fetchStats]);

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (!rehydrated || !token) {
      return;
    }
    if (roleId !== undefined && roleId !== ADMIN_ROLE_ID) {
      router.replace("/dashboard");
    }
  }, [rehydrated, token, roleId, router]);

  useEffect(() => {
    if (activeTab === "transactions" && token) {
      fetchTransactions();
    }
  }, [activeTab, token, fetchTransactions]);

  useEffect(() => {
    if (activeTab === "reports" && token) {
      fetchReports();
    }
  }, [activeTab, token, fetchReports]);

  useEffect(() => {
    if (activeTab === "content" && token) {
      fetchContent();
    }
  }, [activeTab, token, fetchContent]);

  if (!rehydrated || !token) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <p>Please log in to access this page.</p>
          </main>
        </div>
      </div>
    );
  }

  if (roleId !== undefined && roleId !== ADMIN_ROLE_ID) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <p>Redirecting…</p>
          </main>
        </div>
      </div>
    );
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  const formatRupees = (paise: string) => `₹${(Number(paise) / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <h1 className="m-0 mb-8 bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text text-[36px] font-extrabold tracking-[-0.01em] text-transparent">
            Admin
          </h1>

          <div className="mb-6 flex gap-2">
            {(["overview", "transactions", "reports", "content"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={
                  activeTab === tab
                    ? "cursor-pointer border-b-[3px] border-b-[#6b4423] bg-transparent px-6 py-3 text-[16px] font-semibold text-[#6b4423]"
                    : "cursor-pointer border-b-[3px] border-b-transparent bg-transparent px-6 py-3 text-[16px] font-semibold text-[#6b7280] transition-colors duration-200 hover:text-[#6b4423]"
                }
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "transactions"
                    ? "Transactions"
                    : tab === "reports"
                      ? "Reports"
                      : "Content"}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex min-h-[140px] flex-col items-center justify-center gap-5">
              <p className="text-[18px] font-semibold text-[#6b4423]">{error}</p>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fetchStats()}
                  disabled={loading}
                  className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                >
                  {loading ? "Loading…" : "Refresh stats"}
                </button>
              </div>
              {loading && !stats && <p>Loading…</p>}
              {!loading && stats && (
                <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
                  <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <h3>Total revenue</h3>
                    <p className="m-0 text-[28px] font-bold text-[#1f2937]">
                      {formatRupees(String(stats.totalRevenuePaise))}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <h3>Reports generated</h3>
                    <p className="m-0 text-[28px] font-bold text-[#1f2937]">{stats.reportCount}</p>
                  </div>
                  <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <h3>Total transactions</h3>
                    <p className="m-0 text-[28px] font-bold text-[#1f2937]">
                      {stats.transactionCount}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <h3>Successful payments</h3>
                    <p className="m-0 text-[28px] font-bold text-[#1f2937]">
                      {stats.successPaymentCount}
                    </p>
                  </div>
                  <div className="rounded-[12px] border border-[#e5e7eb] bg-[#f9fafb] p-6">
                    <h3>Active subscriptions</h3>
                    <p className="m-0 text-[28px] font-bold text-[#1f2937]">
                      {stats.activeSubscriptionCount}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "transactions" && (
            <div className="mt-4">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="m-0 text-[18px] font-semibold text-[#374151]">
                  Recent transactions ({transactionsTotal})
                </h2>
                <button
                  type="button"
                  onClick={() => fetchTransactions()}
                  disabled={loadingTx}
                  className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                >
                  {loadingTx ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingTx ? (
                <p>Loading…</p>
              ) : (
                <div className="overflow-x-auto rounded-[8px] border border-[#e5e7eb] bg-white">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Date
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          User ID
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Type
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Status
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Amount
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="border-b border-[#e5e7eb] px-3 py-[10px] text-left"
                          >
                            No transactions
                          </td>
                        </tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[#f9fafb]">
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {formatDate(tx.createdAt)}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left font-mono text-[13px]">
                              {tx.userId.slice(0, 8)}…
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {tx.type}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {tx.status}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {formatRupees(tx.amountPaise)}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {tx.description || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="mt-4">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="m-0 text-[18px] font-semibold text-[#374151]">
                  Recent reports ({reportsTotal})
                </h2>
                <button
                  type="button"
                  onClick={() => fetchReports()}
                  disabled={loadingReports}
                  className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                >
                  {loadingReports ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingReports ? (
                <p>Loading…</p>
              ) : (
                <div className="overflow-x-auto rounded-[8px] border border-[#e5e7eb] bg-white">
                  <table className="w-full border-collapse text-[14px]">
                    <thead>
                      <tr>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Date
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          User ID
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Type
                        </th>
                        <th className="border-b border-[#e5e7eb] bg-[#f9fafb] px-3 py-[10px] text-left font-semibold text-[#374151]">
                          Filename
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="border-b border-[#e5e7eb] px-3 py-[10px] text-left"
                          >
                            No reports
                          </td>
                        </tr>
                      ) : (
                        reports.map((r) => (
                          <tr key={r.id} className="hover:bg-[#f9fafb]">
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {formatDate(r.createdAt)}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left font-mono text-[13px]">
                              {r.userId.slice(0, 8)}…
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left">
                              {r.reportType}
                            </td>
                            <td className="border-b border-[#e5e7eb] px-3 py-[10px] text-left font-mono text-[13px]">
                              {r.filename}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="mt-4">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="m-0 text-[18px] font-semibold text-[#374151]">Content & AI</h2>
                <button
                  type="button"
                  onClick={() => fetchContent()}
                  disabled={loadingContent}
                  className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                >
                  {loadingContent ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingContent ? (
                <p>Loading…</p>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={aiEnabled}
                        onChange={(e) => saveAiEnabled(e.target.checked)}
                      />
                      <span>AI assistant enabled</span>
                    </label>
                  </div>
                  <div className="mb-4 flex flex-col gap-3">
                    <label>
                      <span className="mb-1 block">Sun sign meanings</span>
                      <textarea
                        value={content.sunSignMeanings ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({ ...c, sunSignMeanings: e.target.value }))
                        }
                        rows={4}
                        className="w-full max-w-[600px] rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-[10px] text-[14px]"
                      />
                    </label>
                    <label>
                      <span className="mb-1 block">Planet meanings</span>
                      <textarea
                        value={content.planetMeanings ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({ ...c, planetMeanings: e.target.value }))
                        }
                        rows={4}
                        className="w-full max-w-[600px] rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-[10px] text-[14px]"
                      />
                    </label>
                    <label>
                      <span className="mb-1 block">Transit interpretations</span>
                      <textarea
                        value={content.transitInterpretations ?? ""}
                        onChange={(e) =>
                          setContent((c) => ({ ...c, transitInterpretations: e.target.value }))
                        }
                        rows={4}
                        className="w-full max-w-[600px] rounded-[8px] border border-[#e5e7eb] bg-white px-3 py-[10px] text-[14px]"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveContent()}
                    disabled={savingContent}
                    className="rounded-[8px] bg-[#6b4423] px-[30px] py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                  >
                    {savingContent ? "Saving…" : "Save content"}
                  </button>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
