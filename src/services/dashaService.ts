const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

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

export const dashaApi = {
  async getCurrentDasha(token: string): Promise<DashaResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/dasha/current`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to fetch dasha (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to fetch dasha (Status: ${response.status})`);
    }

    return response.json();
  },

  async getDashaTimeline(token: string, years: number = 10): Promise<DashaTimelineResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/dasha/timeline?years=${years}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to fetch dasha timeline (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to fetch dasha timeline (Status: ${response.status})`);
    }

    return response.json();
  },
};

