const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

export interface DoshaResponse {
  manglik: {
    hasDosha: boolean;
    description: string;
    severity?: 'High' | 'Medium' | 'Low' | 'None';
  };
  nadi: {
    hasDosha: boolean;
    description: string;
  };
  bhakoot: {
    hasDosha: boolean;
    description: string;
  };
  totalDoshas: number;
  source: string;
}

export const doshaApi = {
  async checkDoshas(token: string): Promise<DoshaResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/dosha/check`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to check doshas (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to check doshas (Status: ${response.status})`);
    }

    return response.json();
  },
};

