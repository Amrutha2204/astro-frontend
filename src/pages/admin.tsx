import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  adminApi,
  AdminStats,
  AdminTransaction,
  AdminReport,
  AdminContent,
} from "@/services/api";
import { selectToken, selectIsRehydrated, selectRoleId, ADMIN_ROLE_ID } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

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
      setError(msg.includes("403") || msg.toLowerCase().includes("admin") ? "Admin access required." : msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    const t = token?.trim();
    if (!t) return;
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
    if (!t) return;
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
    if (!t) return;
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
    if (!t) return;
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

  const saveAiEnabled = useCallback(async (enabled: boolean) => {
    const t = token?.trim();
    if (!t) return;
    try {
      await adminApi.setAiEnabled(t, enabled);
      setAiEnabled(enabled);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update AI setting.");
    }
  }, [token]);

  useEffect(() => {
    if (!rehydrated) return;
    fetchStats();
  }, [rehydrated, fetchStats]);

  // Redirect non-admin users to dashboard
  useEffect(() => {
    if (!rehydrated || !token) return;
    if (roleId !== undefined && roleId !== ADMIN_ROLE_ID) {
      router.replace("/dashboard");
    }
  }, [rehydrated, token, roleId, router]);

  useEffect(() => {
    if (activeTab === "transactions" && token) fetchTransactions();
  }, [activeTab, token, fetchTransactions]);

  useEffect(() => {
    if (activeTab === "reports" && token) fetchReports();
  }, [activeTab, token, fetchReports]);

  useEffect(() => {
    if (activeTab === "content" && token) fetchContent();
  }, [activeTab, token, fetchContent]);

  if (!rehydrated || !token) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <p>Please log in to access this page.</p>
          </main>
        </div>
      </div>
    );
  }

  if (roleId !== undefined && roleId !== ADMIN_ROLE_ID) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <p>Redirecting…</p>
          </main>
        </div>
      </div>
    );
  }

  const formatDate = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  const formatRupees = (paise: string) => `₹${(Number(paise) / 100).toFixed(2)}`;

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>Admin</h1>

          <div className={styles.adminTabs}>
            {(["overview", "transactions", "reports", "content"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? styles.activeTab : styles.tab}
              >
                {tab === "overview" ? "Overview" : tab === "transactions" ? "Transactions" : tab === "reports" ? "Reports" : "Content"}
              </button>
            ))}
          </div>

          {error && (
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>{error}</p>
            </div>
          )}

          {activeTab === "overview" && (
            <>
              <div className={styles.adminFlexRow}>
                <button
                  type="button"
                  onClick={() => fetchStats()}
                  disabled={loading}
                  className={styles.retryButton}
                >
                  {loading ? "Loading…" : "Refresh stats"}
                </button>
              </div>
              {loading && !stats && <p>Loading…</p>}
              {!loading && stats && (
                <div className={styles.adminStatsGrid}>
                  <div className={styles.adminStatCard}>
                    <h3>Total revenue</h3>
                    <p className={styles.adminStatValue}>{formatRupees(String(stats.totalRevenuePaise))}</p>
                  </div>
                  <div className={styles.adminStatCard}>
                    <h3>Reports generated</h3>
                    <p className={styles.adminStatValue}>{stats.reportCount}</p>
                  </div>
                  <div className={styles.adminStatCard}>
                    <h3>Total transactions</h3>
                    <p className={styles.adminStatValue}>{stats.transactionCount}</p>
                  </div>
                  <div className={styles.adminStatCard}>
                    <h3>Successful payments</h3>
                    <p className={styles.adminStatValue}>{stats.successPaymentCount}</p>
                  </div>
                  <div className={styles.adminStatCard}>
                    <h3>Active subscriptions</h3>
                    <p className={styles.adminStatValue}>{stats.activeSubscriptionCount}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "transactions" && (
            <div className={styles.adminSection}>
              <div className={styles.adminFlexRowSmall}>
                <h2 className={`${styles.adminSectionTitle} ${styles.adminNoMargin}`}></h2>
                <button type="button" onClick={() => fetchTransactions()} disabled={loadingTx} className={styles.retryButton}>
                  {loadingTx ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingTx ? (
                <p>Loading…</p>
              ) : (
                <div className={styles.adminTableWrap}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User ID</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr><td colSpan={6}>No transactions</td></tr>
                      ) : (
                        transactions.map((tx) => (
                          <tr key={tx.id}>
                            <td>{formatDate(tx.createdAt)}</td>
                            <td className={styles.adminMonospace}>{tx.userId.slice(0, 8)}…</td>
                            <td>{tx.type}</td>
                            <td>{tx.status}</td>
                            <td>{formatRupees(tx.amountPaise)}</td>
                            <td>{tx.description || "—"}</td>
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
            <div className={styles.adminSection}>
              <div className={styles.adminFlexRowSmall}>
                <h2 className={`${styles.adminSectionTitle} ${styles.adminNoMargin}`}>Recent reports ({reportsTotal})</h2>
                <button type="button" onClick={() => fetchReports()} disabled={loadingReports} className={styles.retryButton}>
                  {loadingReports ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingReports ? (
                <p>Loading…</p>
              ) : (
                <div className={styles.adminTableWrap}>
                  <table className={styles.adminTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User ID</th>
                        <th>Type</th>
                        <th>Filename</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.length === 0 ? (
                        <tr><td colSpan={4}>No reports</td></tr>
                      ) : (
                        reports.map((r) => (
                          <tr key={r.id}>
                            <td>{formatDate(r.createdAt)}</td>
                            <td className={styles.adminMonospace}>{r.userId.slice(0, 8)}…</td>
                            <td>{r.reportType}</td>
                            <td className={styles.adminMonospace}>{r.filename}</td>
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
            <div className={styles.adminSection}>
              <div className={styles.adminFlexRowSmall}>
                <h2 className={styles.adminSectionTitle} style={{ marginBottom: 0 }}>Content & AI</h2>
                <button type="button" onClick={() => fetchContent()} disabled={loadingContent} className={styles.retryButton}>
                  {loadingContent ? "Loading…" : "Refresh"}
                </button>
              </div>
              {loadingContent ? (
                <p>Loading…</p>
              ) : (
                <>
                  <div className={styles.adminToggleWrap}>
                    <label className={styles.adminCheckboxLabel}>
                      <input
                        type="checkbox"
                        checked={aiEnabled}
                        onChange={(e) => saveAiEnabled(e.target.checked)}
                      />
                      <span>AI assistant enabled</span>
                    </label>
                  </div>
                  <div className={styles.adminColumnGroup}>
                    <label>
                      <span className={styles.adminLabelText}>Sun sign meanings</span>
                      <textarea
                        value={content.sunSignMeanings ?? ""}
                        onChange={(e) => setContent((c) => ({ ...c, sunSignMeanings: e.target.value }))}
                        rows={4}
                        className={'${styles.adminTable} $ {styles.adminTextarea}'}
                      />
                    </label>
                    <label>
                      <span className={styles.adminLabelText}>Planet meanings</span>
                      <textarea
                        value={content.planetMeanings ?? ""}
                        onChange={(e) => setContent((c) => ({ ...c, planetMeanings: e.target.value }))}
                        rows={4}
                        className={styles.adminTable}
                        style={{ width: "100%", maxWidth: 600 }}
                      />
                    </label>
                    <label>
                      <span className={styles.adminLabelText}>Transit interpretations</span>
                      <textarea
                        value={content.transitInterpretations ?? ""}
                        onChange={(e) => setContent((c) => ({ ...c, transitInterpretations: e.target.value }))}
                        rows={4}
                        className={styles.adminTable}
                        style={{ width: "100%", maxWidth: 600 }}
                      />
                    </label>
                  </div>
                  <button type="button" onClick={() => saveContent()} disabled={savingContent} className={styles.retryButton}>
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
