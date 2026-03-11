import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { dashaApi, type GuestBirthDto } from "@/services/dashaService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";
import Loading from "@/components/ui/Loading";

export default function GuestDashaPage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
    planet: string;
    remainingDays: number;
    source: string;
  } | null>(null);
  const [timeline, setTimeline] = useState<Array<{ dasha: string; antardasha: string; startDate: string; endDate: string; planet: string; duration: number }> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !birthTime.trim() || !placeOfBirth.trim()) {
      setError("Please enter birth date, time and place.");
      return;
    }
    setError(null);
    setLoading(true);
    setCurrent(null);
    setTimeline(null);
    const dto: GuestBirthDto = { dob: dob.trim(), birthTime: birthTime.trim(), placeOfBirth: placeOfBirth.trim() };
    try {
      const [c, t] = await Promise.all([
        dashaApi.getGuestDasha(dto),
        dashaApi.getGuestDashaTimeline(dto, 10),
      ]);
      setCurrent(c);
      setTimeline(t.timeline || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to calculate dasha");
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
            <h2 className={formStyles.title}>Dasha (Guest)</h2>
            <p className={formStyles.subtitle}>Enter birth details to get current Mahadasha and Antardasha. No login required.</p>
            <form onSubmit={handleSubmit}>
              <label className={formStyles.label}>Full name (optional)</label>
              <input type="text" className={formStyles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" />
              <label className={formStyles.label}>Birth date *</label>
              <input type="date" className={`${formStyles.input} formDateInput`} value={dob} onChange={(e) => setDob(e.target.value)} required />
              <label className={formStyles.label}>Birth time *</label>
              <input type="time" className={`${formStyles.input} formDateInput`} value={birthTime} onChange={(e) => setBirthTime(e.target.value)} step="1" required />
              <label className={formStyles.label}>Birth place (city) *</label>
              <input type="text" className={formStyles.input} value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="e.g. Mumbai" minLength={3} required />
              {error && <p className="text-red-600 text-sm my-3">{error}</p>}
              <button type="submit" className={formStyles.button} disabled={loading}>{loading ? "Calculating…" : "See my period"}</button>
            </form>
          </div>
          {current && (
            <div className={`${styles.resultBlock} ${styles.resultBlockActive}`}>
              <span className={styles.youAreHereBadge}>You are here</span>
              <h3>{fullName.trim() ? `Period for ${fullName.trim()}` : "Your current period"}</h3>
              <p><strong>Mahadasha:</strong> {current.mahadasha}</p>
              <p><strong>Antardasha:</strong> {current.antardasha}</p>
              <p><strong>From</strong> {current.startDate} <strong>to</strong> {current.endDate}</p>
              <p><strong>Planet:</strong> {current.planet}</p>
              {current.remainingDays != null && <p><strong>Time left in this period:</strong> {current.remainingDays} days</p>}
              <p className={styles.explanationLine}>You’re in this period because your birth chart places you in {current.mahadasha} from {current.startDate}.</p>
              <CalculationInfo showDasha={true} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Source: {current.source}</p>
            </div>
          )}
          {timeline && timeline.length > 0 && (
            <div className={styles.resultBlock}>
              <h3>What’s next (next 10 years)</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="border-b border-amber-200"><th className="text-left p-2">Period</th><th className="text-left p-2">From</th><th className="text-left p-2">To</th></tr></thead>
                  <tbody>
                    {(() => {
                    const now = new Date();
                    const currentIdx = timeline.findIndex((row) => {
                      const s = new Date(row.startDate), e = new Date(row.endDate);
                      return s <= now && e >= now;
                    });
                    return timeline.slice(0, 30).map((r, i) => {
                      const start = new Date(r.startDate);
                      const end = new Date(r.endDate);
                      const isPast = end < now;
                      const isCurrent = start <= now && end >= now;
                      const isNext = currentIdx >= 0 && i === currentIdx + 1;
                      return (
                        <tr
                          key={i}
                          className={`border-b border-amber-100 ${isCurrent ? "bg-amber-50 font-semibold" : isPast ? "opacity-60 text-gray-500" : ""}`}
                        >
                          <td className="p-2">
                            {isCurrent && <span className={styles.youAreHereBadge}>Now</span>}
                            {isNext && <span className={styles.upNextBadge}>Up next</span>}
                            {r.dasha} – {r.antardasha}
                          </td>
                          <td className="p-2">{r.startDate}</td>
                          <td className="p-2">{r.endDate}</td>
                        </tr>
                      );
                    });
                  })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
