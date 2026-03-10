import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface DailyHoroscopeResponse {
  dayType: string;
  mainTheme: string;
  reason: string;
  date: string;
  source: string;
  doAvoid?: string;
  goodTime?: string;
}

export interface WeeklyHoroscopeResponse {
  weekStart: string;
  predictions: Array<{
    date: string;
    day: string;
    horoscope: { dayType: string; mainTheme: string; reason: string };
  }>;
  source: string;
}

export interface MonthlyHoroscopeResponse {
  monthStart: string;
  predictions: Array<{
    date: string;
    horoscope: { dayType: string; mainTheme: string; reason: string };
  }>;
  source: string;
}

export type GuestHoroscopeRequest = { dob: string; birthTime: string; placeOfBirth: string };

export const horoscopeApi = {
  getDailyHoroscopeGuest(dto: GuestHoroscopeRequest): Promise<DailyHoroscopeResponse> {
    return request<DailyHoroscopeResponse>(ASTRO_BASE, "/api/v1/astrology/horoscope/today/guest", {
      method: "POST",
      body: { dob: dto.dob, birthTime: dto.birthTime, placeOfBirth: dto.placeOfBirth.trim() },
    });
  },

  getDailyHoroscope(token: string, chartType?: string): Promise<DailyHoroscopeResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<DailyHoroscopeResponse>(ASTRO_BASE, "/api/v1/astrology/horoscope/today", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  getWeeklyHoroscope(token: string): Promise<WeeklyHoroscopeResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<WeeklyHoroscopeResponse>(ASTRO_BASE, "/api/v1/horoscope/weekly", {
      method: "GET",
      token: t,
    });
  },

  getMonthlyHoroscope(token: string): Promise<MonthlyHoroscopeResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<MonthlyHoroscopeResponse>(ASTRO_BASE, "/api/v1/horoscope/monthly", {
      method: "GET",
      token: t,
    });
  },
};
