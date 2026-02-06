import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { doshaApi } from "@/services/doshaService";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

export default function GuestDoshaPage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    manglik: { hasDosha: boolean; description: string; severity?: string };
    nadi: { hasDosha: boolean; description: string };
    bhakoot: { hasDosha: boolean; description: string };
    totalDoshas: number;
    source: string;
  } | null>(null);

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
      const r = await doshaApi.checkDoshasGuest({ dob: dob.trim(), birthTime: birthTime.trim(), placeOfBirth: placeOfBirth.trim() });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check doshas");
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
            <h2 className={formStyles.title}>Dosha Check (Guest)</h2>
            <p className={formStyles.subtitle}>Manglik, Nadi and Bhakoot. No login required.</p>
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
              <button type="submit" className={formStyles.button} disabled={loading}>{loading ? "Checking…" : "Check doshas"}</button>
            </form>
          </div>
          {result && (
            <div className={styles.resultBlock}>
              <h3>{fullName.trim() ? `Dosha check for ${fullName.trim()}` : "Your dosha check"}</h3>
              <p className={styles.explanationLine}>These checks are based on your birth chart’s planetary positions.</p>
              <div className={styles.doshaList}>
                <div className={`${styles.doshaItem} ${result.manglik.hasDosha ? styles.activeDoshaItem : ""}`}>
                  <strong>Manglik:</strong> {result.manglik.hasDosha ? "Present" : "Not present"} – {result.manglik.description}
                </div>
                <div className={`${styles.doshaItem} ${result.nadi.hasDosha ? styles.activeDoshaItem : ""}`}>
                  <strong>Nadi:</strong> {result.nadi.hasDosha ? "Present" : "Not present"} – {result.nadi.description}
                </div>
                <div className={`${styles.doshaItem} ${result.bhakoot.hasDosha ? styles.activeDoshaItem : ""}`}>
                  <strong>Bhakoot:</strong> {result.bhakoot.hasDosha ? "Present" : "Not present"} – {result.bhakoot.description}
                </div>
              </div>
              <p><strong>Doshas present:</strong> {result.totalDoshas}</p>
              <CalculationInfo showDasha={false} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Source: {result.source}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
