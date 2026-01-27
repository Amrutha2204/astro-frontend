const ASTRO_API_BASE_URL = process.env.NEXT_PUBLIC_ASTRO_API_URL || 'http://localhost:8002';

export interface ChatRequest {
  question: string;
  context?: 'daily' | 'weekly' | 'relationships' | 'career' | 'wellness';
}

export interface ChatResponse {
  answer: string;
  relatedTransits?: Array<{
    planet: string;
    sign: string;
  }>;
  timestamp: string;
}

export interface ExplainKundliRequest {
  focus?: string;
}

export interface ExplainKundliResponse {
  explanation: {
    text: string;
    focus: string;
  };
  chartSummary: {
    sunSign: string;
    moonSign: string;
    ascendant: string;
    nakshatra: string;
  };
}

export interface SuggestionsResponse {
  date: string;
  suggestions: Array<{
    category: string;
    suggestion: string;
    reason: string;
  }>;
  overallTheme: string;
}

export const aiAssistantApi = {
  async chat(token: string, data: ChatRequest): Promise<ChatResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/ai-assistant/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to get AI response (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to get AI response (Status: ${response.status})`);
    }

    return response.json();
  },

  async explainKundli(token: string, data: ExplainKundliRequest = {}): Promise<ExplainKundliResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/ai-assistant/explain-kundli`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to explain kundli (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to explain kundli (Status: ${response.status})`);
    }

    return response.json();
  },

  async getSuggestions(token: string): Promise<SuggestionsResponse> {
    const cleanToken = token.trim();
    if (!cleanToken || cleanToken.split('.').length !== 3) {
      throw new Error('Invalid token format. Please login again.');
    }

    const response = await fetch(`${ASTRO_API_BASE_URL}/api/v1/ai-assistant/suggestions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        message: `Failed to get suggestions (Status: ${response.status})` 
      }));
      throw new Error(error.message || `Failed to get suggestions (Status: ${response.status})`);
    }

    return response.json();
  },
};

