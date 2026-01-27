const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

export interface DailyHoroscopeResponse {
  dayType: string;
  mainTheme: string;
  reason: string;
  date: string;
  source: string;
}

export interface WeeklyHoroscopeResponse {
  weekType: string;
  mainTheme: string;
  predictions: Array<{
    date: string;
    theme: string;
    advice: string;
  }>;
  source: string;
}

export interface MonthlyHoroscopeResponse {
  monthType: string;
  mainTheme: string;
  predictions: Array<{
    date: string;
    theme: string;
    advice: string;
  }>;
  source: string;
}

export const horoscopeApi = {
  async getDailyHoroscope(token: string, chartType?: string): Promise<DailyHoroscopeResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const url = new URL(`${ASTRO_API_BASE_URL}/api/v1/astrology/horoscope/today`);
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
          message: `Failed to fetch daily horoscope (Status: ${response.status})` 
        }));
        throw new Error(error.message || `Failed to fetch daily horoscope (Status: ${response.status})`);
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

  async getWeeklyHoroscope(token: string): Promise<WeeklyHoroscopeResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/horoscope/weekly`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Failed to fetch weekly horoscope (Status: ${response.status})` 
        }));
        throw new Error(error.message || `Failed to fetch weekly horoscope (Status: ${response.status})`);
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

  async getMonthlyHoroscope(token: string): Promise<MonthlyHoroscopeResponse> {
    try {
      const cleanToken = token.trim();
      if (!cleanToken || cleanToken.split('.').length !== 3) {
        throw new Error('Invalid token format. Please login again.');
      }

      const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/horoscope/monthly`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `Failed to fetch monthly horoscope (Status: ${response.status})` 
        }));
        throw new Error(error.message || `Failed to fetch monthly horoscope (Status: ${response.status})`);
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
};
