import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface PartnerBirthDetails {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  latitude: number;
  longitude: number;
  birthPlace: string;
}

export interface CompatibilityRequest {
  partner1: PartnerBirthDetails;
  partner2: PartnerBirthDetails;
}

export interface GunaMilanResponse {
  totalScore: number;
  maxScore: number;
  percentage: number;
  verdict: "Excellent" | "Good" | "Average" | "Below Average";
  gunas: Array<{ name: string; score: number; maxScore: number; description: string; parameterMeaning?: string }>;
  source: string;
}

export interface MarriageCompatibilityResponse {
  gunaMilan: GunaMilanResponse;
  doshas: { manglik: string; nadi: string; bhakoot: string };
  strengths: string[];
  challenges: string[];
  overallVerdict: string;
  source: string;
}

function toBody(data: CompatibilityRequest) {
  return {
    partner1: {
      year: data.partner1.year,
      month: data.partner1.month,
      day: data.partner1.day,
      hour: data.partner1.hour ?? 12,
      minute: data.partner1.minute ?? 0,
      latitude: data.partner1.latitude,
      longitude: data.partner1.longitude,
    },
    partner2: {
      year: data.partner2.year,
      month: data.partner2.month,
      day: data.partner2.day,
      hour: data.partner2.hour ?? 12,
      minute: data.partner2.minute ?? 0,
      latitude: data.partner2.latitude,
      longitude: data.partner2.longitude,
    },
  };
}

export const compatibilityApi = {
  calculateGunaMilanGuest(data: CompatibilityRequest): Promise<GunaMilanResponse> {
    return request<GunaMilanResponse>(ASTRO_BASE, "/api/v1/compatibility/guna-milan/guest", {
      method: "POST",
      body: toBody(data),
    });
  },

  calculateMarriageCompatibilityGuest(data: CompatibilityRequest): Promise<MarriageCompatibilityResponse> {
    return request<MarriageCompatibilityResponse>(ASTRO_BASE, "/api/v1/compatibility/marriage/guest", {
      method: "POST",
      body: toBody(data),
    });
  },

  calculateGunaMilan(token: string, data: CompatibilityRequest): Promise<GunaMilanResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<GunaMilanResponse>(ASTRO_BASE, "/api/v1/compatibility/guna-milan", {
      method: "POST",
      token: t,
      body: data,
    });
  },

  calculateMarriageCompatibility(token: string, data: CompatibilityRequest): Promise<MarriageCompatibilityResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<MarriageCompatibilityResponse>(ASTRO_BASE, "/api/v1/compatibility/marriage", {
      method: "POST",
      token: t,
      body: data,
    });
  },
};
