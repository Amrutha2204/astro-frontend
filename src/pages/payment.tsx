import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { paymentApi, WalletBalanceResponse } from "@/services/paymentService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function PaymentPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [balance, setBalance] = useState<WalletBalanceResponse | null>(null);
  const [amountRupees, setAmountRupees] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await paymentApi.getBalance(t);
      setBalance(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load wallet");
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
    fetchBalance();
  }, [rehydrated, token, dispatch, router, fetchBalance]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token?.trim();
    if (!t) return;
    const amount = Number(amountRupees);
    if (!amount || amount < 1) {
      showError("Enter a valid amount (₹1 or more)");
      return;
    }
    setCreating(true);
    try {
      const res = await paymentApi.createOrder(t, amount, "Wallet top-up");
      showSuccess("Order created. Complete payment on the next screen.");
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: res.keyId,
          amount: res.amount * 100,
          currency: res.currency,
          order_id: res.orderId,
          name: "Astro",
          description: "Wallet top-up",
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await paymentApi.verify(t, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
              showSuccess("Payment successful. Wallet updated.");
              fetchBalance();
            } catch (e) {
              showError(e instanceof Error ? e.message : "Verification failed");
            }
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        router.push(`/subscription/plans?orderId=${res.orderId}&amount=${res.amount}`);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setCreating(false);
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

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Wallet &amp; Payment</h1>
            {error && <p className={styles.errorText}>{error}</p>}
            {loading ? (
              <p>Loading balance…</p>
            ) : balance !== null ? (
              <div style={{ marginBottom: "1.5rem" }}>
                <p className={styles.explanationLine}>
                  <strong>Wallet balance:</strong> ₹{balance.balanceRupees.toFixed(2)}
                </p>
              </div>
            ) : null}
            <div style={{ maxWidth: 360 }}>
              <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Add money</h2>
              <form onSubmit={handleCreateOrder}>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="Amount (₹)"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  style={{ marginBottom: "0.75rem", width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc" }}
                />
                <button type="submit" disabled={creating} className={styles.chatNowButton}>
                  {creating ? "Creating…" : "Pay with Razorpay"}
                </button>
              </form>
              <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
                If Razorpay is not loaded, you will be redirected to plans page. Load the Razorpay script on your site for in-page checkout.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
