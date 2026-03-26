import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { notificationsApi, type NotificationPreferences } from "@/services/notificationsService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";

const REDIRECT_DELAY_MS = 2000;

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyEnabled, setDailyEnabled] = useState(false);
  const [preferredTime, setPreferredTime] = useState("09:00");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const primaryButtonClass =
    "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";
  const fetchPrefs = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await notificationsApi.getPreferences(t);
      setPrefs(data);
      setDailyEnabled(data.dailyHoroscopeEnabled);
      setPreferredTime(data.preferredTime || "09:00");
      setTimezone(data.timezone || "Asia/Kolkata");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchPrefs();
  }, [rehydrated, token, dispatch, router, fetchPrefs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = token?.trim();
    if (!t) {
      return;
    }
    setSaving(true);
    try {
      await notificationsApi.updatePreferences(t, {
        dailyHoroscopeEnabled: dailyEnabled,
        preferredTime,
        timezone,
      });
      showSuccess("Preferences saved.");
      fetchPrefs();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!rehydrated || !token?.trim()) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <p>Loading…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Notification Settings
            </h1>
            <p className="mb-4 mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
              Choose when to receive your daily horoscope push notification.
            </p>
            {error && <p className="text-[18px] font-semibold text-[#6b4423]">{error}</p>}
            {loading ? (
              <p>Loading…</p>
            ) : (
              <form onSubmit={handleSave} className="max-w-[400px]">
                <label className="mb-2 flex items-center gap-2 text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  <input
                    type="checkbox"
                    checked={dailyEnabled}
                    onChange={(e) => setDailyEnabled(e.target.checked)}
                  />
                  Enable daily horoscope notification
                </label>
                <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  Preferred time (your timezone)
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="mb-3 w-full"
                />
                <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  Timezone (e.g. Asia/Kolkata)
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Asia/Kolkata"
                  className="mb-4 w-full"
                />
                <button type="submit" disabled={saving} className={primaryButtonClass}>
                  {saving ? "Saving…" : "Save preferences"}
                </button>
              </form>
            )}
            {prefs?.deviceRegistered === false && (
              <p className="mt-4 text-[0.9rem] text-[#666]">
                To receive push notifications, register your device from the app when prompted.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
