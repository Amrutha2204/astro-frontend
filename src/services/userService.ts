import { request, AUTH_BASE } from "./fetcher";

export const getUserDetails = (token: string) =>
  request<unknown>(AUTH_BASE, "/api/v1/user-details/me", {
    method: "GET",
    token,
  });

export const saveBirthDetails = (
  token: string,
  data: { dob: string; birthTime: string; placeOfBirth: string },
) =>
  request<unknown>(AUTH_BASE, "/api/v1/user-details/birth-details", {
    method: "POST",
    body: data,
    token,
  });
