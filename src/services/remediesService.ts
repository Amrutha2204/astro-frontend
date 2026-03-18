import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface Remedy {
  type: "gemstone" | "mantra" | "fasting" | "donation" | "ritual";
  name: string;
  description: string;
  timing?: string;
  frequency?: string;
}

export interface RemedyRecommendations {
  gemstones: Remedy[];
  mantras: Remedy[];
  fastingDays: Remedy[];
  donations: Remedy[];
  rituals: Remedy[];
  bestTiming: { day: string; time: string; tithi?: string; nakshatra?: string };
  source: string;
}

export interface RemedyTimingResponse {
  bestTiming: { day: string; time: string; tithi?: string; nakshatra?: string };
  source: string;
}

export const remediesApi = {
  getRecommendations(token: string): Promise<RemedyRecommendations> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<RemedyRecommendations>(ASTRO_BASE, "/api/v1/remedies/recommendations", {
      method: "GET",
      token: t,
    });
  },

  getTiming(token: string): Promise<RemedyTimingResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<RemedyTimingResponse>(ASTRO_BASE, "/api/v1/remedies/timing", {
      method: "GET",
      token: t,
    });
  },
};
