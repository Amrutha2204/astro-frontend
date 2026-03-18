import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  pricePaise: string;
  billingPeriod: string;
  features: string;
  isActive: boolean;
}

export interface UserSubscriptionResponse {
  plan: SubscriptionPlan | null;
  subscription: {
    id: string;
    planSlug: string;
    startAt: string;
    endAt: string;
    status: string;
  } | null;
  isActive: boolean;
}

export const subscriptionApi = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    return request<SubscriptionPlan[]>(ASTRO_BASE, "/api/v1/subscription/plans", { method: "GET" });
  },

  async getMySubscription(token: string): Promise<UserSubscriptionResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<UserSubscriptionResponse>(ASTRO_BASE, "/api/v1/subscription/me", {
      method: "GET",
      token: t,
    });
  },

  async subscribe(token: string, planSlug: string, durationMonths: number = 1) {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request(ASTRO_BASE, "/api/v1/subscription/subscribe", {
      method: "POST",
      token: t,
      body: { planSlug, durationMonths },
    });
  },
};
