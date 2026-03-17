export interface FamilyProfile {
  id: string;
  userId: string;
  name: string;
  dob: string;
  birthPlace: string;
  birthTime: string;
  relation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyProfilePayload {
  name: string;
  dob: string;
  birthPlace: string;
  birthTime?: string;
  relation?: string;
}
