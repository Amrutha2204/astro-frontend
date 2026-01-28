import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { dashaApi, type GuestBirthDto } from "@/services/dashaService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

export default function GuestDashaPage() {
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
      setError("Please enter date of birth, birth time and place of birth.");
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
              <label className={formStyles.label}>Date of Birth *</label>
              <input type="date" className={formStyles.input} value={dob} onChange={(e) => setDob(e.target.value)} required />
              <label className={formStyles.label}>Birth Time (24h) *</label>
              <input type="time" className={formStyles.input} value={birthTime} onChange={(e) => setBirthTime(e.target.value)} step="1" required />
              <label className={formStyles.label}>Place of Birth *</label>
              <input type="text" className={formStyles.input} value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} placeholder="e.g. Mumbai" minLength={3} required />
              {error && <p className="text-red-600 text-sm my-3">{error}</p>}
              <button type="submit" className={formStyles.button} disabled={loading}>{loading ? "Calculating…" : "Get Dasha"}</button>
            </form>
          </div>
          {current && (
            <div className={styles.resultBlock}>
              <h3>Current period</h3>
              <p><strong>Mahadasha:</strong> {current.mahadasha}</p>
              <p><strong>Antardasha:</strong> {current.antardasha}</p>
              <p><strong>From</strong> {current.startDate} <strong>to</strong> {current.endDate}</p>
              <p><strong>Planet:</strong> {current.planet}</p>
              <p className="text-xs text-gray-500 mt-2">Source: {current.source}</p>
            </div>
          )}
          {timeline && timeline.length > 0 && (
            <div className={styles.resultBlock}>
              <h3>Timeline (next 10 years)</h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead><tr className="border-b border-amber-200"><th className="text-left p-2">Dasha</th><th className="text-left p-2">From</th><th className="text-left p-2">To</th></tr></thead>
                  <tbody>
                    {timeline.slice(0, 30).map((r, i) => (
                      <tr key={i} className="border-b border-amber-100">
                        <td className="p-2">{r.dasha} – {r.antardasha}</td>
                        <td className="p-2">{r.startDate}</td>
                        <td className="p-2">{r.endDate}</td>
                      </tr>
                    ))}
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
