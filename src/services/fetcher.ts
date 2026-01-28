/**
 * Single reusable fetcher for all API calls.
 * Use instead of scattered fetch/axios calls for cleaner code and better build performance.
 */

export type FetcherOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: object;
  token?: string | null;
  params?: Record<string, string>;
  /** When true, on 4xx/5xx return { status, data } instead of throwing. Use for login etc. */
  noThrow?: boolean;
};

function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  if (!params || Object.keys(params).length === 0) return url;
  const search = new URLSearchParams(params).toString();
  return `${url}${url.includes("?") ? "&" : "?"}${search}`;
}

function buildHeaders(token?: string | null, hasBody?: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (token?.trim() && token.trim().split(".").length === 3) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }
  return headers;
}

export async function request<T>(
  baseUrl: string,
  path: string,
  options: FetcherOptions & { noThrow: true }
): Promise<{ status: number; data: T }>;
export async function request<T>(baseUrl: string, path: string, options?: FetcherOptions): Promise<T>;
export async function request<T>(
  baseUrl: string,
  path: string,
  options: FetcherOptions = {}
): Promise<T | { status: number; data: T }> {
  const { method = "GET", body, token, params, noThrow = false } = options;
  const url = buildUrl(baseUrl, path, params);
  const hasBody = Boolean(body && (method === "POST" || method === "PUT" || method === "PATCH"));
  const headers = buildHeaders(token, hasBody || Boolean(body));

  const res = await fetch(url, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T;

  if (noThrow) {
    return { status: res.status, data };
  }

  if (!res.ok) {
    const err = (data as { message?: string })?.message || `Request failed (${res.status})`;
    throw new Error(err);
  }

  return data;
}

export const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
export const ASTRO_BASE = process.env.NEXT_PUBLIC_ASTRO_API_URL || "http://localhost:8002";
