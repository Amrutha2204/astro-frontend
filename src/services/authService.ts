import { request, AUTH_BASE } from "./fetcher";

/** Onboard a guest (creates user_details). Returns guestId to pass to signup for convert-guest-to-user. */
export const onboardGuest = (data: {
  name: string;
  dob: string;
  birthPlace: string;
  birthTime?: string;
}) =>
  request<{ message: string; guestId: string }>(AUTH_BASE, "/api/v1/guests", {
    method: "POST",
    body: data,
  });

/** Register: use guestId to convert a guest, or dob+birthPlace+birthTime for new. Returns { status, data } so caller can handle 4xx (e.g. email already in use) without throwing. */
export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  timezone?: string;
  roleId: number;
  guestId?: string | null;
  dob?: string;
  birthPlace?: string;
  birthTime?: string;
}) =>
  request<{ message?: string; userId?: string }>(AUTH_BASE, "/api/v1/auth/signup", {
    method: "POST",
    body: data,
    noThrow: true,
  }) as Promise<{ status: number; data: { message?: string; userId?: string } }>;

/** Login. Returns { status, data }. Check status (e.g. 401) before using data. */
export const loginUser = (data: { email: string; password: string }) =>
  request<{ 
    accessToken?: string; 
    user?: { id: string; name: string; roleId: number; birthPlace?: string };
   }>(
    AUTH_BASE,
    "/api/v1/auth/login",
    { method: "POST", body: data, noThrow: true }
  ) as Promise<{ 
    status: number; 
    data: { 
      accessToken?: string; 
      user?: { id: string; name: string; roleId: number; birthPlace?: string} } }>;
