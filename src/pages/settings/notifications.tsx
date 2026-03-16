import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { notificationsApi, NotificationPreferences } from "@/services/notificationsService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

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
    if (!rehydrated) return;
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
    if (!t) return;
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
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}><p>Loading…</p></main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Notification Settings</h1>
            <p className={`${styles.explanationLine} mb-4`}>
              Choose when to receive your daily horoscope push notification.
            </p>
            {error && <p className={styles.errorText}>{error}</p>}
            {loading ? (
              <p>Loading…</p>
            ) : (
              <form onSubmit={handleSave} className="max-w-[400px]">
                <label className={`${formStyles.label} flex items-center gap-2 mb-2`}>
                  <input
                    type="checkbox"
                    checked={dailyEnabled}
                    onChange={(e) => setDailyEnabled(e.target.checked)}
                  />
                  Enable daily horoscope notification
                </label>
                <label className={formStyles.label}>Preferred time (your timezone)</label>
                <input
  type="time"
  className={`${formStyles.input} mb-3`}
  value={preferredTime}
  onChange={(e) => setPreferredTime(e.target.value)}
/>
                <label className={formStyles.label}>Timezone (e.g. Asia/Kolkata)</label>
                <input
  type="text"
  className={`${formStyles.input} mb-4`}
  value={timezone}
  onChange={(e) => setTimezone(e.target.value)}
  placeholder="Asia/Kolkata"
/>
                <button type="submit" disabled={saving} className={styles.chatNowButton}>
                  {saving ? "Saving…" : "Save preferences"}
                </button>
              </form>
            )}
            {prefs?.deviceRegistered === false && (
              <p className="mt-4 text-sm text-gray-600">
                To receive push notifications, register your device from the app when prompted.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
