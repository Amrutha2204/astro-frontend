import { request, AUTH_BASE, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

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
  user: {
    id: string;
    name: string;
    roleId: number;
    birthPlace?: string;
  };
}

export interface SignUpResponse {
  message: string;
  userId: string;
}

// -------------------- Astro Interfaces --------------------
export interface KundliResponse {
  chart?: string;
  chartLabel?: string;
  lagna: string;
  moonSign: string;
  sunSign?: string;
  nakshatra: string;
  pada: number;
  chandraRasi?: string;
  sooryaRasi?: string;
  planetaryPositions: Array<{
    planet: string;
    sign: string;
    degree: number;
    nakshatra?: string;
    pada?: number;
    retrograde?: boolean;
  }>;
  houses: Array<{
    house: number;
    sign: string;
    degree: number;
    meaning?: string;
    meaningDetail?: string;
  }>;
  source: string;
}

/** Chart options for dropdown: Lagna, Navamsa, etc., and Western */
export const CHART_OPTIONS: { value: string; label: string }[] = [
  { value: "lagna", label: "Lagna (D-1)" },
  { value: "navamsa", label: "Navamsa (D-9)" },
  { value: "saptamsa", label: "Saptamsa (D-7)" },
  { value: "dasamsa", label: "Dasamsa (D-10)" },
  { value: "dwadasamsa", label: "Dwadasamsa (D-12)" },
  { value: "shodasamsa", label: "Shodasamsa (D-16)" },
  { value: "vimsamsa", label: "Vimsamsa (D-20)" },
  { value: "chaturvimsamsa", label: "Chaturvimsamsa (D-24)" },
  { value: "trimsamsa", label: "Trimsamsa (D-30)" },
  { value: "western", label: "Western (Tropical)" },
];

export interface TransitResponse {
  date: string;
  planetTransits: Array<{ planet: string; fromSign: string; toSign: string; degree: number }>;
  source: string;
}

export interface TransitsTodayResponse {
  currentPlanetPositions?: Record<
    string,
    { name: string; sign: { name: string }; degree?: number }
  >;
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
  paksha?: string;
  nakshatra: string;
  ritu?: string;
  hinduMonth?: string;
  sunrise?: string;
  sunset?: string;
  moonRise?: string;
  moonSet?: string;
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
  source?: string;
}

export interface RahuYamagandamResponse {
  date: string;
  sunrise: string;
  sunset: string;
  rahuKaal: { start: string; end: string; note: string };
  yamagandam: { start: string; end: string; note: string };
  source: string;
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

export interface CareerGuidanceResponse {
  guidance: string;
  sections?: {
    strengths?: string;
    suitableFields?: string;
    timing?: string;
    tips?: string;
    disclaimer?: string;
  };
  profileIdUsed: string | null;
  timestamp: string;
}

// -------------------- Astro API --------------------
export const astroApi = {
  // -------------------- Kundli & Natal --------------------
  async getMyKundli(token: string, chartType?: string, chart?: string): Promise<KundliResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    const params: Record<string, string> = {};
    if (chartType) params.chartType = chartType;
    if (chart) {
      if (chart === "western") {
        params.system = "western";
      } else {
        params.system = "vedic";
        params.chart = chart;
      }
    }
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/my-kundli", {
      method: "GET",
      token: t,
      params: Object.keys(params).length ? params : undefined,
    });
  },

  async getNatalChart(token: string, chartType?: string) {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request(ASTRO_BASE, "/api/v1/astrology/natal-chart", {
      method: "GET",
      token: t,
      params: chartType ? { chartType } : undefined,
    });
  },

  // -------------------- Today Transit --------------------
  async getTodayTransit(token: string, date?: string): Promise<TransitResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
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

  // -------------------- Calendar --------------------
  async getTodayCalendar(token: string, date?: string): Promise<CalendarResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token format. Please login again.");
    return request<CalendarResponse>(ASTRO_BASE, "/api/v1/astrology/calendar/today", {
      method: "GET",
      token: t,
      params: date ? { date } : undefined,
    });
  },

  async getGuestKundli(dto: {
    dob: string;
    birthTime?: string;
    placeOfBirth: string;
    unknownTime?: boolean;
    system?: "vedic" | "western";
    chart?: string;
  }): Promise<KundliResponse> {
    const body: Record<string, unknown> = {
      dob: dto.dob,
      placeOfBirth: dto.placeOfBirth,
    };
    if (dto.unknownTime) {
      body.unknownTime = true;
    } else if (dto.birthTime?.trim()) {
      body.birthTime = dto.birthTime.trim();
    } else {
      body.unknownTime = true;
    }
    if (dto.chart) {
      if (dto.chart === "western") {
        body.system = "western";
      } else {
        body.system = "vedic";
        body.chart = dto.chart;
      }
    } else if (dto.system) {
      body.system = dto.system;
    }
    return request<KundliResponse>(ASTRO_BASE, "/api/v1/kundli/guest", { method: "POST", body });
  },

  /** Resolve place name (city, town, village) to coordinates. Use for compatibility and any birth place. */
  async getGeocode(place: string): Promise<{ lat: number; lng: number; displayName?: string }> {
    return request<{ lat: number; lng: number; displayName?: string }>(
      ASTRO_BASE,
      "/api/v1/kundli/geocode",
      {
        method: "GET",
        params: { place: place.trim() },
      },
    );
  },

  /** Search places for autocomplete (fetched from server/Nominatim). Empty q returns default list. */
  async searchPlaces(
    q: string,
    limit = 15,
  ): Promise<{ places: Array<{ displayName: string; lat: number; lng: number }> }> {
    return request<{ places: Array<{ displayName: string; lat: number; lng: number }> }>(
      ASTRO_BASE,
      "/api/v1/kundli/places/search",
      {
        method: "GET",
        params: q.trim() ? { q: q.trim(), limit: String(limit) } : { limit: String(limit) },
      },
    );
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

  async getRahuYamagandam(date: string, placeOfBirth?: string): Promise<RahuYamagandamResponse> {
    return request<RahuYamagandamResponse>(
      ASTRO_BASE,
      "/api/v1/astrology/calendar/rahu-yamagandam",
      {
        method: "GET",
        params: placeOfBirth?.trim() ? { date, placeOfBirth: placeOfBirth.trim() } : { date },
      },
    );
  },

  // -------------------- Shareable Cards --------------------
  async createShareableCard(
    token: string,
    dto: CreateShareableCardDto,
  ): Promise<StoredCardResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<StoredCardResponse>(ASTRO_BASE, "/api/v1/shareable-card", {
      method: "POST",
      token: t,
      body: dto,
    });
  },

  async getShareLinks(
    token: string,
    url: string,
    title?: string,
  ): Promise<{ whatsapp: string; twitter: string; telegram: string }> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<{ whatsapp: string; twitter: string; telegram: string }>(
      ASTRO_BASE,
      "/api/v1/shareable-card/share-links",
      {
        method: "POST",
        token: t,
        body: { url, title },
      },
    );
  },

  // -------------------- Retrogrades & Major Transits & Eclipses --------------------
  /** Which planets are retrograde on a single date (for "on this day" result). */
  async getRetrogradesOnDate(date: string): Promise<{ date: string; planetsRetrograde: string[] }> {
    return request<{ date: string; planetsRetrograde: string[] }>(
      ASTRO_BASE,
      "/api/v1/astrology/transits/retrogrades/on-date",
      {
        method: "GET",
        params: { date },
      },
    );
  },

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
    return request<{ solar: Eclipse[]; lunar: Eclipse[] }>(
      ASTRO_BASE,
      "/api/v1/astrology/transits/eclipses",
      {
        method: "GET",
        params: { fromDate: from },
      },
    );
  },
};

export interface AdminStats {
  reportCount: number;
  transactionCount: number;
  successPaymentCount: number;
  activeSubscriptionCount: number;
  totalRevenuePaise: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  type: string;
  status: string;
  amountPaise: string;
  description: string | null;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  userId: string;
  reportType: string;
  filename: string;
  createdAt: string;
}

export interface AdminContent {
  sunSignMeanings?: string;
  planetMeanings?: string;
  transitInterpretations?: string;
}

export const adminApi = {
  async getStats(token: string): Promise<AdminStats> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<AdminStats>(ASTRO_BASE, "/api/v1/admin/stats", {
      method: "GET",
      token: t,
    });
  },

  async getTransactions(
    token: string,
    limit?: number,
    offset?: number,
  ): Promise<{ items: AdminTransaction[]; total: number }> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    const params: Record<string, string> = {};
    if (limit != null) params.limit = String(limit);
    if (offset != null) params.offset = String(offset);
    return request<{ items: AdminTransaction[]; total: number }>(
      ASTRO_BASE,
      "/api/v1/admin/transactions",
      {
        method: "GET",
        token: t,
        params: Object.keys(params).length ? params : undefined,
      },
    );
  },

  async getReports(
    token: string,
    limit?: number,
    offset?: number,
  ): Promise<{ items: AdminReport[]; total: number }> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    const params: Record<string, string> = {};
    if (limit != null) params.limit = String(limit);
    if (offset != null) params.offset = String(offset);
    return request<{ items: AdminReport[]; total: number }>(ASTRO_BASE, "/api/v1/admin/reports", {
      method: "GET",
      token: t,
      params: Object.keys(params).length ? params : undefined,
    });
  },

  async getContent(token: string): Promise<AdminContent> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<AdminContent>(ASTRO_BASE, "/api/v1/admin/content", { method: "GET", token: t });
  },

  async setContent(token: string, content: AdminContent): Promise<void> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<void>(ASTRO_BASE, "/api/v1/admin/content", {
      method: "PUT",
      token: t,
      body: content,
    });
  },

  async getAiEnabled(token: string): Promise<{ enabled: boolean }> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<{ enabled: boolean }>(ASTRO_BASE, "/api/v1/admin/ai-enabled", {
      method: "GET",
      token: t,
    });
  },

  async setAiEnabled(token: string, enabled: boolean): Promise<void> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<void>(ASTRO_BASE, "/api/v1/admin/ai-enabled", {
      method: "PUT",
      token: t,
      body: { enabled },
    });
  },
};

export const careerApi = {
  /**
   * Fetch career guidance for the logged-in user
   */
  async getCareerGuidance(token: string): Promise<CareerGuidanceResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3)
      throw new Error("Invalid token format. Please login again.");

    return request<CareerGuidanceResponse>(
      "http://localhost:8002", // replace if API is deployed elsewhere
      "/api/v1/career/guidance",
      {
        method: "POST",
        token: t,
        body: {},
      },
    );
  },
};
