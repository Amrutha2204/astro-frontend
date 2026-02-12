import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  adminApi,
  AdminStats,
  AdminTransaction,
  AdminReport,
} from "@/services/api";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";
import dashboardStyles from "@/styles/dashboard.module.css";
import styles from "@/styles/dashboard.module.css";

type AdminTab = "overview" | "transactions" | "reports";

export default function AdminPage() {
  const token = useSelector(selectToken);
  const rehydrated = useSelector(selectIsRehydrated);
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
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

  useEffect(() => {
    if (!rehydrated) return;
    fetchStats();
  }, [rehydrated, fetchStats]);

  useEffect(() => {
    if (activeTab === "transactions" && token) fetchTransactions();
  }, [activeTab, token, fetchTransactions]);

  useEffect(() => {
    if (activeTab === "reports" && token) fetchReports();
  }, [activeTab, token, fetchReports]);

  if (!rehydrated || !token) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <AppHeader />
        <div className={dashboardStyles.dashboardContent}>
          <AppSidebar />
          <main className={dashboardStyles.mainContent}>
            <p>Please log in to access this page.</p>
          </main>
        </div>
      </div>
    );
  }

  const formatDate = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  const formatRupees = (paise: string) => `₹${(Number(paise) / 100).toFixed(2)}`;

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.dashboardContent}>
        <AppSidebar />
        <main className={dashboardStyles.mainContent}>
          <h1 className={styles.pageTitle}>Admin</h1>

          <div className={styles.adminTabs}>
            {(["overview", "transactions", "reports"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? styles.activeTab : styles.tab}
              >
                {tab === "overview" ? "Overview" : tab === "transactions" ? "Transactions" : "Reports"}
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
              {loading && <p>Loading…</p>}
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
              <h2 className={styles.adminSectionTitle}>Recent transactions ({transactionsTotal})</h2>
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
              <h2 className={styles.adminSectionTitle}>Recent reports ({reportsTotal})</h2>
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
        </main>
      </div>
    </div>
  );
}
