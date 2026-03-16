import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";
import { FamilyProfile, CreateFamilyProfilePayload } from "@/data/family";

export const fetchFamilyProfiles = async (token: string): Promise<FamilyProfile[]> => {
  if (!isValidJwtFormat(token)) throw new Error("Invalid token. Please login again.");
  return request<FamilyProfile[]>(ASTRO_BASE, "/api/v1/family-profiles", {
    method: "GET",
    token,
  });
};

export const createFamilyProfile = async (
  data: CreateFamilyProfilePayload,
  token: string,
): Promise<FamilyProfile> => {
  if (!isValidJwtFormat(token)) throw new Error("Invalid token. Please login again.");
  return request<FamilyProfile>(ASTRO_BASE, "/api/v1/family-profiles", {
    method: "POST",
    token,
    body: data,
  });
};

export const updateFamilyProfile = async (
  id: string,
  data: CreateFamilyProfilePayload,
  token: string,
): Promise<FamilyProfile> => {
  if (!isValidJwtFormat(token)) throw new Error("Invalid token. Please login again.");
  return request<FamilyProfile>(ASTRO_BASE, `/api/v1/family-profiles/${id}`, {
    method: "PUT",
    token,
    body: data,
  });
};

export const deleteFamilyProfile = async (id: string, token: string): Promise<void> => {
  if (!isValidJwtFormat(token)) throw new Error("Invalid token. Please login again.");
  return request<void>(ASTRO_BASE, `/api/v1/family-profiles/${id}`, {
    method: "DELETE",
    token,
  });
};
