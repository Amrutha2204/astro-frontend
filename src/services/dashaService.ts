import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface DashaResponse {
  mahadasha: string;
  antardasha: string;
  pratyantardasha?: string;
  startDate: string;
  endDate: string;
  planet: string;
  remainingDays: number;
  source: string;
}

export interface DashaTimelineResponse {
  timeline: Array<{
    dasha: string;
    antardasha: string;
    pratyantardasha?: string;
    startDate: string;
    endDate: string;
    planet: string;
    duration: number;
  }>;
  source: string;
}

export type GuestBirthDto = { dob: string; birthTime: string; placeOfBirth: string };

const guestBody = (dto: GuestBirthDto) => ({
  dob: dto.dob,
  birthTime: dto.birthTime,
  placeOfBirth: dto.placeOfBirth.trim(),
});

export const dashaApi = {
  getGuestDasha(dto: GuestBirthDto): Promise<DashaResponse> {
    return request<DashaResponse>(ASTRO_BASE, "/api/v1/dasha/guest", {
      method: "POST",
      body: guestBody(dto),
    });
  },

  getGuestDashaTimeline(dto: GuestBirthDto, years = 10): Promise<DashaTimelineResponse> {
    return request<DashaTimelineResponse>(ASTRO_BASE, "/api/v1/dasha/guest/timeline", {
      method: "POST",
      body: guestBody(dto),
      params: { years: String(years) },
    });
  },

  getCurrentDasha(token: string): Promise<DashaResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<DashaResponse>(ASTRO_BASE, "/api/v1/dasha/current", { method: "GET", token: t });
  },

  getDashaTimeline(token: string, years = 10): Promise<DashaTimelineResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<DashaTimelineResponse>(ASTRO_BASE, "/api/v1/dasha/timeline", {
      method: "GET",
      token: t,
      params: { years: String(years) },
    });
  },
};
