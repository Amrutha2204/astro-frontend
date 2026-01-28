/**
 * Guest user feature access
 *
 * Defines what a guest (unauthenticated) user can see and use.
 * Excluded: Astro Talk, AI Assistant chat (and all AI Assistant features).
 *
 * Use this config for:
 * - Nav / sidebar when rendered for guests
 * - Route guards / redirects
 * - Feature flags in components
 */

export type FeatureId =
  | "home"
  | "auth-login"
  | "auth-register"
  // ——— EXCLUDED (never for guests) ———
  | "astro-talk" // planned; exclude when added
  | "ai-assistant" // chat, explain-kundli, suggestions
  // ——— Authenticated-only (possible future guest expansion) ———
  | "dashboard"
  | "kundli"
  | "horoscope"
  | "calendar"
  | "transits"
  | "dasha"
  | "dosha"
  | "compatibility"
  | "remedies"
  | "natal-chart"
  | "my-day"
  | "birth-details";

/** Features that guests must NOT see (Astro Talk, AI Assistant chat, etc.) */
export const GUEST_EXCLUDED_FEATURES: FeatureId[] = [
  "astro-talk",
  "ai-assistant",
];

/** Route paths that map to excluded features (for redirect/hiding) */
export const GUEST_EXCLUDED_PATHS: string[] = [
  "/ai-assistant/chat",
  "/ai-assistant/explain-kundli",
  "/ai-assistant/suggestions",
  // When Astro Talk is added:
  // "/astro-talk",
];

/**
 * Features a guest CAN see and use (besides Astro Talk and AI Assistant chat).
 * Includes: Kundli, Transits, Calendar, Horoscope, Dasha, Dosha, Compatibility.
 */
export const GUEST_ALLOWED_FEATURES: FeatureId[] = [
  "home",
  "transits",
  "calendar",
  "dasha",
  "dosha",
  "compatibility",
  "horoscope",
  "auth-login",
  "auth-register",
];

/** Paths guests are allowed to visit */
export const GUEST_ALLOWED_PATHS: string[] = [
  "/",
  "/transits",
  "/calendar",
  "/guest-dasha",
  "/guest-dosha",
  "/compatibility",
  "/guest-horoscope",
  "/auth/login",
  "/auth/register",
];

/** Nav item for guest-facing top bar / minimal nav */
export interface GuestNavItem {
  id: FeatureId;
  label: string;
  href: string;
}

export const GUEST_NAV_ITEMS: GuestNavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "transits", label: "Transits", href: "/transits" },
  { id: "calendar", label: "Calendar", href: "/calendar" },
  { id: "horoscope", label: "Horoscope", href: "/guest-horoscope" },
  { id: "dasha", label: "Dasha", href: "/guest-dasha" },
  { id: "dosha", label: "Dosha", href: "/guest-dosha" },
  { id: "compatibility", label: "Match", href: "/compatibility" },
  { id: "auth-login", label: "Login", href: "/auth/login" },
  { id: "auth-register", label: "Register", href: "/auth/register" },
];

/** Check if a path is allowed for guests */
export function isGuestAllowedPath(path: string): boolean {
  const p = (path || "/").replace(/\?.*$/, "").replace(/\/$/, "") || "/";
  return GUEST_ALLOWED_PATHS.some((allowed) => p === allowed);
}

/** Check if a path is explicitly excluded for guests (Astro Talk, AI Assistant) */
export function isGuestExcludedPath(path: string): boolean {
  const p = (path || "/").replace(/\?.*$/, "").replace(/\/$/, "") || "/";
  return GUEST_EXCLUDED_PATHS.some(
    (excluded) => p === excluded || p.startsWith(excluded + "/")
  );
}
