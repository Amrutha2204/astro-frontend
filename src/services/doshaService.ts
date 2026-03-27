import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface DoshaResponse {
  manglik: {
    hasDosha: boolean;
    description: string;
    severity?: "High" | "Medium" | "Low" | "None";
  };
  nadi: { hasDosha: boolean; description: string };
  bhakoot: { hasDosha: boolean; description: string };
  totalDoshas: number;
  source: string;
}

export type GuestDoshaRequest = { dob: string; birthTime: string; placeOfBirth: string };

export const doshaApi = {
  checkDoshasGuest(dto: GuestDoshaRequest): Promise<DoshaResponse> {
    return request<DoshaResponse>(ASTRO_BASE, "/api/v1/dosha/guest", {
      method: "POST",
      body: { dob: dto.dob, birthTime: dto.birthTime, placeOfBirth: dto.placeOfBirth.trim() },
    });
  },

  checkDoshas(token: string): Promise<DoshaResponse> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      throw new Error("Invalid token format. Please login again.");
    }
    return request<DoshaResponse>(ASTRO_BASE, "/api/v1/dosha/check", { method: "GET", token: t });
  },
};
