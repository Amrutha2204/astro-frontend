import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { subscriptionApi, SubscriptionPlan, UserSubscriptionResponse } from "@/services/subscriptionService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function SubscriptionPlansPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<UserSubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const plansData = await subscriptionApi.getPlans();
      setPlans(plansData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load plans";
      setError(msg === "Failed to fetch"
        ? "Cannot reach the server. Check that the backend is running (e.g. astro-service on port 8002) and NEXT_PUBLIC_ASTRO_API_URL is correct."
        : msg);
      setPlans([]);
    }
    try {
      const subData = await subscriptionApi.getMySubscription(t);
      setMySubscription(subData);
    } catch {
      setMySubscription(null);
    }
    setLoading(false);
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

  const handleSubscribe = async (planSlug: string) => {
    const t = token?.trim();
    if (!t) return;
    setSubscribing(planSlug);
    try {
      await subscriptionApi.subscribe(t, planSlug, planSlug.includes("yearly") ? 12 : 1);
      showSuccess("Subscribed successfully.");
      fetchData();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Subscribe failed");
    } finally {
      setSubscribing(null);
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
            <h1 className={styles.sectionTitle}>Subscription Plans</h1>
            {mySubscription?.isActive && mySubscription.plan && (
              <p className={styles.explanationLine} style={{ marginBottom: "1rem" }}>
                Your plan: <strong>{mySubscription.plan.name}</strong>
                {mySubscription.subscription?.endAt && (
                  <> (valid till {new Date(mySubscription.subscription.endAt).toLocaleDateString()})</>
                )}
              </p>
            )}
            {error && (
              <div className={styles.errorContainer} style={{ marginBottom: "1rem" }}>
                <p className={styles.errorText}>{error}</p>
                <button type="button" className={styles.retryButton} onClick={fetchData}>
                  Retry
                </button>
              </div>
            )}
            {loading ? (
              <p>Loading plans…</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {plans.map((plan) => {
                  const isCurrent = mySubscription?.plan?.slug === plan.slug;
                  const priceRupees = Number(plan.pricePaise) / 100;
                  return (
                    <div
                      key={plan.id}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 8,
                        padding: "1.25rem",
                        minWidth: 200,
                        maxWidth: 280,
                      }}
                    >
                      <h3 style={{ marginBottom: "0.25rem" }}>{plan.name}</h3>
                      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.5rem" }}>
                        {plan.description || ""}
                      </p>
                      <p style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        {priceRupees === 0 ? "Free" : `₹${priceRupees}`}
                        {plan.billingPeriod === "year" && priceRupees > 0 && "/year"}
                        {plan.billingPeriod === "month" && priceRupees > 0 && "/month"}
                      </p>
                      {!isCurrent && (
                        <button
                          type="button"
                          className={styles.chatNowButton}
                          disabled={subscribing !== null || plan.slug === "free"}
                          onClick={() => plan.slug !== "free" && handleSubscribe(plan.slug)}
                        >
                          {subscribing === plan.slug ? "Subscribing…" : plan.slug === "free" ? "Current" : "Subscribe"}
                        </button>
                      )}
                      {isCurrent && <p style={{ color: "#2e7d32", fontWeight: 600 }}>Active</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
