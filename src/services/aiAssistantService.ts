import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface ChatRequest {
  question: string;
  context?: "daily" | "weekly" | "relationships" | "career" | "wellness";
}

export interface ChatResponse {
  answer: string;
  relatedTransits?: Array<{ planet: string; sign: string }>;
  timestamp: string;
}

export interface ExplainKundliRequest {
  focus?: string;
}

export interface ExplainKundliResponse {
  explanation: { text: string; focus: string };
  chartSummary: { sunSign: string; moonSign: string; ascendant: string; nakshatra: string };
}

export interface SuggestionsResponse {
  date: string;
  suggestions: Array<{ category: string; suggestion: string; reason: string }>;
  overallTheme: string;
}

export const aiAssistantApi = {
  chat(token: string, data: ChatRequest): Promise<ChatResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<ChatResponse>(ASTRO_BASE, "/api/v1/ai-assistant/chat", {
      method: "POST",
      token: t,
      body: data,
    });
  },

  explainKundli(token: string, data: ExplainKundliRequest = {}): Promise<ExplainKundliResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<ExplainKundliResponse>(ASTRO_BASE, "/api/v1/ai-assistant/explain-kundli", {
      method: "POST",
      token: t,
      body: data,
    });
  },

  getSuggestions(token: string): Promise<SuggestionsResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<SuggestionsResponse>(ASTRO_BASE, "/api/v1/ai-assistant/suggestions", {
      method: "GET",
      token: t,
    });
  },
};
