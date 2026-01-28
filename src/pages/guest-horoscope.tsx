import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { horoscopeApi } from "@/services/horoscopeService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

export default function GuestHoroscopePage() {
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ dayType: string; mainTheme: string; reason: string; date: string; source: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !birthTime.trim() || !placeOfBirth.trim()) {
      setError("Please enter date of birth, birth time and place of birth.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const r = await horoscopeApi.getDailyHoroscopeGuest({ dob: dob.trim(), birthTime: birthTime.trim(), placeOfBirth: placeOfBirth.trim() });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch horoscope");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={formStyles.card}>
            <h2 className={formStyles.title}>Daily Horoscope (Guest)</h2>
            <p className={formStyles.subtitle}>Personalized by your birth chart. No login required.</p>
            <form onSubmit={handleSubmit}>
              <label className={formStyles.label}>Date of Birth *</label>
              <input type="date" className={formStyles.input} value={dob} onChange={(e) => setDob(e.target.value)} required />
              <label className={formStyles.label}>Birth Time (24h) *</label>
              <input type="time" className={formStyles.input} value={birthTime} onChange={(e) => setBirthTime(e.target.value)} step="1" required />
              <label className={formStyles.label}>Place of Birth *</label>
              <input type="text" className={formStyles.input} value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="e.g. Mumbai" minLength={3} required />
              {error && <p className="text-red-600 text-sm my-3">{error}</p>}
              <button type="submit" className={formStyles.button} disabled={loading}>{loading ? "Loading…" : "Get Horoscope"}</button>
            </form>
          </div>
          {result && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="mb-2">Today: {result.dayType}</h3>
              <p><strong>Theme:</strong> {result.mainTheme}</p>
              <p><strong>Reason:</strong> {result.reason}</p>
              <p className="text-xs text-gray-500">Date: {result.date} · {result.source}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
