import { request, AUTH_BASE, ASTRO_BASE } from "./fetcher";

// ----- Auth types (signup/login may be used elsewhere) -----
export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  timezone?: string;
  roleId: number;
  dob?: string;
  birthPlace?: string;
  birthTime?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; roleId: number };
}

export interface SignUpResponse {
  message: string;
  userId: string;
}

// ----- Astro response types -----
export interface KundliResponse {
  lagna: string;
  moonSign: string;
  sunSign?: string;
  nakshatra: string;
  pada: number;
  chandraRasi?: string;
  sooryaRasi?: string;
  planetaryPositions: Array<{ planet: string; sign: string; degree: number; nakshatra?: string; pada?: number }>;
  houses: Array<{ house: number; sign: string; degree: number }>;
  source: string;
}

export interface TransitResponse {
  date: string;
  planetTransits: Array<{ planet: string; fromSign: string; toSign: string; degree: number }>;
  source: string;
}

export interface TransitsTodayResponse {
  currentPlanetPositions?: Record<string, { name: string; sign: { name: string }; degree?: number }>;
  majorActiveTransits?: Array<{ planet: string; sign: string; description?: string }>;
  date: string;
  source: string;
}

export interface CalendarResponse {
  date: string;
  tithi?: string;
  nakshatra?: string;
  yoga?: string;
  karana?: string;
  sunrise?: string;
  sunset?: string;
  moonRise?: string;
  moonSet?: string;
  source: string;
}

export interface GuestCalendarResponse {
  moonPhase: string;
  tithi: string;
  nakshatra: string;
  majorPlanetaryEvents: string[];
  date: string;
  source: string;
}

// ----- Astro API (uses shared fetcher) -----
export const astroApi = {
  async getMyKundli(token: string, chartType?: string): Promise<KundliResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/my-kundli", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  async getNatalChart(
    token: string,
    chartType?: string
  ): Promise<{ sunSign: string; moonSign: string; ascendant: string; planetSignList: Array<{ planet: string; sign: string }>; source: string }> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request(ASTRO_BASE, "/api/v1/astrology/natal-chart", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  async getTodayTransit(token: string, date?: string): Promise<TransitResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request<TransitResponse>(ASTRO_BASE, "/api/v1/astrology/transits/today", {
      method: "GET",
      token: t,
      params: date ? { date } : undefined,
    });
  },

  async getTransitsToday(): Promise<TransitsTodayResponse> {
    return request<TransitsTodayResponse>(ASTRO_BASE, "/api/v1/astrology/transits/today", {
      method: "GET",
    });
  },

  async getTodayCalendar(token: string, date?: string): Promise<CalendarResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request<CalendarResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/today", {
      method: "GET",
      token: t,
      params: date ? { date } : undefined,
    });
  },

  async getGuestKundli(dto: { dob: string; birthTime: string; placeOfBirth: string }): Promise<KundliResponse> {
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/guest", {
      method: "POST",
      body: dto,
    });
  },

  async getGuestCalendar(city?: string): Promise<GuestCalendarResponse> {
    return request<GuestCalendarResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/today/guest", {
      method: "GET",
      params: city?.trim() ? { placeOfBirth: city.trim() } : undefined,
    });
  },
};
