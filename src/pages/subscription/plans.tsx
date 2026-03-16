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
              <p className={`${styles.explanationLine} mb-4`}>
                Your plan: <strong>{mySubscription.plan.name}</strong>
                {mySubscription.subscription?.endAt && (
                  <> (valid till {new Date(mySubscription.subscription.endAt).toLocaleDateString()})</>
                )}
              </p>
            )}
            {error && (
              <div className={`${styles.errorContainer} mb-4`}>
                <p className={styles.errorText}>{error}</p>
                <button type="button" className={styles.retryButton} onClick={fetchData}>
                  Retry
                </button>
              </div>
            )}
            {loading ? (
              <p>Loading plans…</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {plans.map((plan) => {
                  const isCurrent = mySubscription?.plan?.slug === plan.slug;
                  const priceRupees = Number(plan.pricePaise) / 100;
                  return (
                    <div
  key={plan.id}
  className="border border-gray-200 rounded-lg p-5 min-w-[200px] max-w-[280px]"
>
                      <h3 className="mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {plan.description || ""}
                      </p>
                      <p className="text-xl font-semibold mb-2">
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
                      <p className="text-green-700 font-semibold">Active</p>
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
