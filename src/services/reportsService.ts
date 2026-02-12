import { request, ASTRO_BASE } from "./fetcher";

export interface ReportItem {
  id: string;
  reportType: string;
  downloadUrl: string;
  createdAt: string;
}

export interface GenerateReportResponse {
  id: string;
  reportType: string;
  downloadUrl: string;
  createdAt: string;
}

export const reportsApi = {
  async generate(token: string, reportType: "kundli_summary" | "compatibility_summary"): Promise<GenerateReportResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<GenerateReportResponse>(ASTRO_BASE, "/api/v1/reports/generate", {
      method: "POST",
      token: t,
      body: { reportType },
    });
  },

  async listMy(token: string): Promise<ReportItem[]> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    return request<ReportItem[]>(ASTRO_BASE, "/api/v1/reports/my", {
      method: "GET",
      token: t,
    });
  },

  /** One-time paid report (₹99): deducts from wallet and returns report. For compatibility_summary pass partner details. */
  async purchaseOneTime(
    token: string,
    reportType: "kundli_summary" | "compatibility_summary",
    compatibilityPartners?: {
      partner1: { year: number; month: number; day: number; hour?: number; minute?: number; latitude: number; longitude: number };
      partner2: { year: number; month: number; day: number; hour?: number; minute?: number; latitude: number; longitude: number };
    },
  ): Promise<GenerateReportResponse> {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) throw new Error("Invalid token. Please login again.");
    const body: { reportType: string; compatibilityPartners?: typeof compatibilityPartners } = { reportType };
    if (reportType === "compatibility_summary" && compatibilityPartners) {
      body.compatibilityPartners = compatibilityPartners;
    }
    return request<GenerateReportResponse>(ASTRO_BASE, "/api/v1/reports/purchase-one-time", {
      method: "POST",
      token: t,
      body,
    });
  },
};
