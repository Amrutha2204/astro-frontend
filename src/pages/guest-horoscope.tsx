import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { horoscopeApi } from "@/services/horoscopeService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

export default function GuestHoroscopePage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ dayType: string; mainTheme: string; reason: string; date: string; source: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !birthTime.trim() || !placeOfBirth.trim()) {
      setError("Please enter birth date, time and place.");
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
              <label className={formStyles.label}>Full name (optional)</label>
              <input type="text" className={formStyles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" />
              <label className={formStyles.label}>Birth date *</label>
              <input type="date" className={formStyles.input} value={dob} onChange={(e) => setDob(e.target.value)} required />
              <label className={formStyles.label}>Birth time *</label>
              <input type="time" className={formStyles.input} value={birthTime} onChange={(e) => setBirthTime(e.target.value)} step="1" required />
              <label className={formStyles.label}>Birth place (city) *</label>
              <input type="text" className={formStyles.input} value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="e.g. Mumbai" minLength={3} required />
              {error && <p className="text-red-600 text-sm my-3">{error}</p>}
              <button type="submit" className={formStyles.button} disabled={loading}>{loading ? "Loading…" : "See today’s horoscope"}</button>
            </form>
          </div>
          {result && (
            <div className={`${styles.resultBlock} ${styles.resultBlockActive}`}>
              <span className={styles.youAreHereBadge}>Today</span>
              <h3 className="mb-2">{fullName.trim() ? `Today for ${fullName.trim()}` : "Today’s focus"}: {result.dayType}</h3>
              <p><strong>Focus:</strong> {result.mainTheme}</p>
              {result.reason && <p><strong>Why:</strong> {result.reason}</p>}
              <p className={styles.explanationLine}>Today’s focus is based on your Moon sign and current planetary positions.</p>
              <CalculationInfo showDasha={false} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Date: {result.date} · {result.source}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> ee93625fe639b332b5c1cf019d90908bec6dac2a
