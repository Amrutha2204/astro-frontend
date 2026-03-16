import { useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { horoscopeApi } from "@/services/horoscopeService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import Loading from "@/components/ui/Loading";

export default function GuestHoroscopePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ dayType: string; mainTheme: string; reason: string; date: string; source: string; doAvoid?: string; goodTime?: string } | null>(null);

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
              <input type="date" className={`${formStyles.input} formDateInput`} value={dob} onChange={(e) => setDob(e.target.value)} required />
              <label className={formStyles.label}>Birth time *</label>
              <input type="time" className={`${formStyles.input} formDateInput`} value={birthTime} onChange={(e) => setBirthTime(e.target.value)} step="1" required />
              <label className={formStyles.label}>Birth place (city, town or village) *</label>
              <PlaceAutocomplete value={placeOfBirth} onChange={setPlaceOfBirth} placeholder="e.g. Mumbai, Maharashtra, India or town/village" required aria-label="Birth place" />
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
              {result.doAvoid && <p><strong>Do / Avoid today:</strong> {result.doAvoid}</p>}
              {result.goodTime && <p><strong>Good time:</strong> {result.goodTime}</p>}
              <p className={styles.explanationLine}>Today’s focus is based on your Moon sign and current planetary positions.</p>
              <CalculationInfo showDasha={false} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Date: {result.date} · {result.source}</p>

              <div className={styles.sevenDayPreviewWrap}>
                <h3>Next 7 days</h3>
                <div className={styles.sevenDayPreviewBlur}>
                  <p>Mon — Steady progress; good for routine tasks.</p>
                  <p>Tue — Focus on communication and short travel.</p>
                  <p>Wed — Favorable for finances and decisions.</p>
                  <p>Thu — Emotional clarity; relationships in focus.</p>
                  <p>Fri — Creative energy; avoid haste.</p>
                  <p>Sat — Rest and reflection recommended.</p>
                  <p>Sun — New beginnings; plan for the week ahead.</p>
                </div>
                <div className={styles.sevenDayPreviewCta}>
                  <p>Sign up or log in to see your personalized week ahead</p>
                  <div className="flex flex-col gap-2 items-center">
                    <button type="button" onClick={() => router.push("/auth/register")}>
                      Sign up free
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/auth/login")}
                      className={styles.sevenDayCtaSecondary}
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
