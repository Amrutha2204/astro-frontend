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
};
