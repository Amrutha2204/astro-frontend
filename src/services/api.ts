const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

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
  };
}

export interface SignUpResponse {
  message: string;
  userId: string;
}

export const authApi = {
  async signup(data: SignUpRequest): Promise<SignUpResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  },

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Invalid credentials');
    }

    return response.json();
  },
};

export interface KundliResponse {
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
  }>;
  houses: Array<{
    house: number;
    sign: string;
    degree: number;
  }>;
  source: string;
}

export interface TransitResponse {
  date: string;
  planetTransits: Array<{
    planet: string;
    fromSign: string;
    toSign: string;
    degree: number;
  }>;
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

export const astroApi = {
  async getMyKundli(token: string, chartType?: string): Promise<KundliResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/kundli/my-kundli`);
      if (chartType) {
        url.searchParams.append('chartType', chartType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Failed to fetch Kundli (Status: ${response.status})` 
        }));
        throw new Error(error.message || `Failed to fetch Kundli (Status: ${response.status})`);
      }

      return response.json();
    } catch (err) {
      const error = err as { message?: string };
      if (error.message && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to astrology service. Please ensure the backend is running on ${ASTRO_API_BASE_URL}`
        );
      }
      throw err;
    }
  },

  async getNatalChart(token: string, chartType?: string): Promise<{
    sunSign: string;
    moonSign: string;
    ascendant: string;
    planetSignList: Array<{ planet: string; sign: string }>;
    source: string;
  }> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/astrology/natal-chart`);
      if (chartType) {
        url.searchParams.append('chartType', chartType);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Failed to fetch natal chart (Status: ${response.status})` 
        }));
        throw new Error(error.message || `Failed to fetch natal chart (Status: ${response.status})`);
      }

      return response.json();
    } catch (err) {
      const error = err as { message?: string };
      if (error.message && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to astrology service. Please ensure the backend is running on ${ASTRO_API_BASE_URL}`
        );
      }
      throw err;
    }
  },
  async getTodayTransit(token: string, date?: string): Promise<TransitResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/astrology/transits/today`);
      if (date) {
        url.searchParams.append('date', date);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `Failed to fetch transit data (Status: ${response.status})`
        }));
        throw new Error(error.message || `Failed to fetch transit data (Status: ${response.status})`);
      }

      return response.json();
    } catch (err) {
      const error = err as { message?: string };
      if (error.message && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to astrology service. Please ensure the backend is running on ${ASTRO_API_BASE_URL}`
        );
      }
      throw err;
    }
  },

  async getTodayCalendar(token: string, date?: string): Promise<CalendarResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split(".").length !== 3) {
        throw new Error("Invalid token format. Please login again.");
      }

      const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/astrology/calendar/today`);
      if (date) {
        url.searchParams.append("date", date);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${cleanToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `Failed to fetch calendar data (Status: ${response.status})`,
        }));
        throw new Error(
          error.message || `Failed to fetch calendar data (Status: ${response.status})`
        );
      }

      return response.json();
    } catch (err) {
      const error = err as { message?: string };
      if (error.message?.includes("fetch")) {
        throw new Error(
          `Cannot connect to astrology service. Please ensure the backend is running on ${ASTRO_API_BASE_URL}`
        );
      }
      throw err;
    }
  },

  async getGuestKundli(dto: { dob: string; birthTime: string; placeOfBirth: string }): Promise<KundliResponse> {
    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/kundli/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Failed to calculate Kundli (Status: ${response.status})`,
      }));
      throw new Error(error.message || `Failed to calculate Kundli (Status: ${response.status})`);
    }
    return response.json();
  },

  async getGuestCalendar(city?: string): Promise<GuestCalendarResponse> {
    const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/astrology/calendar/today/guest`);
    if (city && city.trim()) {
      url.searchParams.append("placeOfBirth", city.trim());
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Failed to fetch calendar (Status: ${response.status})`,
      }));
      throw new Error(error.message || `Failed to fetch calendar (Status: ${response.status})`);
    }
    return response.json();
  },
};

