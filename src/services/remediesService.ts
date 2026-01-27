const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

export interface Remedy {
  type: 'gemstone' | 'mantra' | 'fasting' | 'donation' | 'ritual';
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
  bestTiming: {
    day: string;
    time: string;
    tithi?: string;
    nakshatra?: string;
  };
  source: string;
}

export interface RemedyTimingResponse {
  bestTiming: {
    day: string;
    time: string;
    tithi?: string;
    nakshatra?: string;
  };
  source: string;
}

export const remediesApi = {
  async getRecommendations(token: string): Promise<RemedyRecommendations> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/remedies/recommendations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to fetch remedies (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to fetch remedies (Status: ${response.status})`);
    }

    return response.json();
  },

  async getTiming(token: string): Promise<RemedyTimingResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/remedies/timing`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to fetch remedy timing (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to fetch remedy timing (Status: ${response.status})`);
    }

    return response.json();
  },
};

