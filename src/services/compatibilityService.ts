const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

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
  verdict: 'Excellent' | 'Good' | 'Average' | 'Below Average';
  gunas: Array<{
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
  source: string;
}

export interface MarriageCompatibilityResponse {
  gunaMilan: GunaMilanResponse;
  doshas: {
    manglik: string;
    nadi: string;
    bhakoot: string;
  };
  strengths: string[];
  challenges: string[];
  overallVerdict: string;
  source: string;
}

export const compatibilityApi = {
  async calculateGunaMilan(token: string, data: CompatibilityRequest): Promise<GunaMilanResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/compatibility/guna-milan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to calculate Guna Milan (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to calculate Guna Milan (Status: ${response.status})`);
    }

    return response.json();
  },

  async calculateMarriageCompatibility(token: string, data: CompatibilityRequest): Promise<MarriageCompatibilityResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/compatibility/marriage`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to calculate marriage compatibility (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to calculate marriage compatibility (Status: ${response.status})`);
    }

    return response.json();
  },
};

