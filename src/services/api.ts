import { request, AUTH_BASE, ASTRO_BASE } from "./fetcher";

// -------------------- Auth Interfaces --------------------
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

// -------------------- Astro Interfaces --------------------
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

export interface FestivalEntry {
  name: string;
  month: number;
  day: number;
  note?: string;
}

export interface FestivalsResponse {
  dateOrMonth: string;
  festivals: FestivalEntry[];
}

export interface MuhuratResponse {
  date: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  abhijitMuhurat: { start: string; end: string };
  goodPeriods: Array<{ name: string; start: string; end: string }>;
}

export interface AuspiciousDayResponse {
  date: string;
  isAuspicious: boolean;
  reason: string;
  tithi?: string;
  nakshatra?: string;
}

export interface CreateShareableCardDto {
  type: "horoscope" | "kundli_summary";
  title?: string;
  date?: string;
  payload?: Record<string, unknown>;
}

export interface StoredCardResponse {
  id: string;
  imagePath: string;
  imageUrl: string;
  pdfPath?: string;
  pdfUrl?: string;
  createdAt: string;
}

// -------------------- New Transit Interfaces --------------------
export interface Retrograde {
  planet: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  description: string;
}

export interface RetrogradesResponse {
  fromDate: string;
  toDate: string;
  retrogrades: Retrograde[];
}

export interface MajorTransit {
  planet: string;
  fromSign: string;
  toSign: string;
  date: string;
  description: string;
}

export interface MajorTransitsResponse {
  fromDate: string;
  toDate: string;
  transits: MajorTransit[];
}

export interface Eclipse {
  date: string;
  type: string;
  maximum?: string;
  umbralMagnitude?: number;
  penumbralMagnitude?: number;
  sarosNumber?: number;
  sarosMember?: number;
}

// -------------------- Astro API --------------------
export const astroApi = {
  // -------------------- Kundli & Natal --------------------
  async getMyKundli(token: string, chartType?: string): Promise<KundliResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/my-kundli", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  async getNatalChart(token: string, chartType?: string) {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token format. Please login again.");
    return request(ASTRO_BASE, "/api/v1/astrology/natal-chart", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  // -------------------- Today Transit --------------------
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
    return request<TransitsTodayResponse>(ASTRO_BASE, "/api/v1/astrology/transits/today", { method: "GET" });
  },

  // -------------------- Calendar --------------------
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
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/guest", { method: "POST", body: dto });
  },

  async getGuestCalendar(city?: string): Promise<GuestCalendarResponse> {
    return request<GuestCalendarResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/today/guest", {
      method: "GET",
      params: city?.trim() ? { placeOfBirth: city.trim() } : undefined,
    });
  },

  async getFestivals(dateOrMonth: string): Promise<FestivalsResponse> {
    return request<FestivalsResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/festivals", {
      method: "GET",
      params: { date: dateOrMonth },
    });
  },

  async getMuhurat(date: string, placeOfBirth?: string): Promise<MuhuratResponse> {
    return request<MuhuratResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/muhurat", {
      method: "GET",
      params: placeOfBirth?.trim() ? { date, placeOfBirth: placeOfBirth.trim() } : { date },
    });
  },

  async getAuspiciousDay(date: string, placeOfBirth?: string): Promise<AuspiciousDayResponse> {
    return request<AuspiciousDayResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/auspicious-day", {
      method: "GET",
      params: placeOfBirth?.trim() ? { date, placeOfBirth: placeOfBirth.trim() } : { date },
    });
  },

  // -------------------- Shareable Cards --------------------
  async createShareableCard(token: string, dto: CreateShareableCardDto): Promise<StoredCardResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<StoredCardResponse>(ASTRO_BASE, "/api/v1/shareable-card", {
      method: "POST",
      token: t,
      body: dto,
    });
  },

  // -------------------- Retrogrades & Major Transits & Eclipses --------------------
  async getRetrogrades(from: string, to: string): Promise<RetrogradesResponse> {
    return request<RetrogradesResponse>(ASTRO_BASE, "/api/v1/astrology/transits/retrogrades", {
      method: "GET",
      params: { fromDate: from, toDate: to },
    });
  },

  async getMajorTransits(from: string, to: string): Promise<MajorTransitsResponse> {
    return request<MajorTransitsResponse>(ASTRO_BASE, "/api/v1/astrology/transits/major", {
      method: "GET",
      params: { fromDate: from, toDate: to },
    });
  },

  async getEclipses(from: string): Promise<{ solar: Eclipse[]; lunar: Eclipse[] }> {
    return request<{ solar: Eclipse[]; lunar: Eclipse[] }>(ASTRO_BASE, "/api/v1/astrology/transits/eclipses", {
      method: "GET",
      params: { fromDate: from },
    });
  },
};