import axios from "axios";
import {
  FamilyProfile,
  CreateFamilyProfilePayload,
} from "@/data/family";

const API = "http://localhost:8002/api/v1";

export const fetchFamilyProfiles = async (
  token: string
): Promise<FamilyProfile[]> => {
  const res = await axios.get(`${API}/family-profiles`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const createFamilyProfile = async (
  data: CreateFamilyProfilePayload,
  token: string
): Promise<FamilyProfile> => {
  const res = await axios.post(`${API}/family-profiles`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateFamilyProfile = async (
  id: string,
  data: CreateFamilyProfilePayload,
  token: string
): Promise<FamilyProfile> => {
  const res = await axios.put(
    `${API}/family-profiles/${id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};

export const deleteFamilyProfile = async (
  id: string,
  token: string
): Promise<void> => {
  await axios.delete(`${API}/family-profiles/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};