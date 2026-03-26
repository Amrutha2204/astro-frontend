import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import {
  subscriptionApi,
  type SubscriptionPlan,
  type UserSubscriptionResponse,
} from "@/services/subscriptionService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
const primaryButtonClass =
  "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";
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
      setError(
        msg === "Failed to fetch"
          ? "Cannot reach the server. Check that the backend is running (e.g. astro-service on port 8002) and NEXT_PUBLIC_ASTRO_API_URL is correct."
          : msg,
      );
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

  const handleSubscribe = async (planSlug: string) => {
    const t = token?.trim();
    if (!t) {
      return;
    }
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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <p>Loading…</p>
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
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Subscription Plans
            </h1>
            {mySubscription?.isActive && mySubscription.plan && (
              <p className="mb-4 mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                Your plan: <strong>{mySubscription.plan.name}</strong>
                {mySubscription.subscription?.endAt && (
                  <>
                    {" "}
                    (valid till {new Date(mySubscription.subscription.endAt).toLocaleDateString()})
                  </>
                )}
              </p>
            )}
            {error && (
              <div className="mb-4 flex min-h-[140px] flex-col items-center justify-center gap-5">
                <p className="text-[18px] font-semibold text-[#6b4423]">{error}</p>
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={fetchData}
                >
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
                      className="min-w-[200px] max-w-[280px] rounded-[8px] border border-[#e0e0e0] p-5"
                    >
                      <h3 className="mb-1">{plan.name}</h3>
                      <p className="mb-2 text-[0.9rem] text-[#666]">{plan.description || ""}</p>
                      <p className="mb-2 text-[1.25rem] font-semibold">
                        {priceRupees === 0 ? "Free" : `₹${priceRupees}`}
                        {plan.billingPeriod === "year" && priceRupees > 0 && "/year"}
                        {plan.billingPeriod === "month" && priceRupees > 0 && "/month"}
                      </p>
                      {!isCurrent && (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-[12px] border-none bg-[#6b4423] px-[28px] py-3 text-[16px] font-bold text-white shadow-[0_4px_14px_rgba(139,94,52,0.25)] transition-colors duration-200 hover:bg-[#5c3a1f] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={subscribing !== null || plan.slug === "free"}
                          onClick={() => plan.slug !== "free" && handleSubscribe(plan.slug)}
                        >
                          {subscribing === plan.slug
                            ? "Subscribing…"
                            : plan.slug === "free"
                              ? "Current"
                              : "Subscribe"}
                        </button>
                      )}
                      {isCurrent && <p className="font-semibold text-[#2e7d32]">Active</p>}
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
