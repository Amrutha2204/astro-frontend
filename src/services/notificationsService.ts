import { request, ASTRO_BASE } from "./fetcher";
import { isValidJwtFormat } from "@/utils/auth";

export interface NotificationPreferences {
  dailyHoroscopeEnabled: boolean;
  preferredTime: string;
  timezone: string;
  deviceRegistered: boolean;
}

export interface UpdatePreferencesBody {
  dailyHoroscopeEnabled?: boolean;
  preferredTime?: string;
  timezone?: string;
}

export const notificationsApi = {
  async getPreferences(token: string): Promise<NotificationPreferences> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<NotificationPreferences>(ASTRO_BASE, "/api/v1/notifications/preferences", {
      method: "GET",
      token: t,
    });
  },

  async updatePreferences(token: string, body: UpdatePreferencesBody): Promise<NotificationPreferences> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<NotificationPreferences>(ASTRO_BASE, "/api/v1/notifications/preferences", {
      method: "PUT",
      token: t,
      body,
    });
  },

  async registerDevice(token: string, deviceToken: string): Promise<{ message: string }> {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) throw new Error("Invalid token. Please login again.");
    return request<{ message: string }>(ASTRO_BASE, "/api/v1/notifications/register-device", {
      method: "POST",
      token: t,
      body: { deviceToken },
    });
  },
};
