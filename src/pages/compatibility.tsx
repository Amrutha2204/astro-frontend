import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { compatibilityApi, CompatibilityRequest, GunaMilanResponse, MarriageCompatibilityResponse } from "@/services/compatibilityService";
import { getCoordinatesFromCity } from "@/utils/coordinates";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import { selectToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

interface PartnerFormData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export default function CompatibilityPage() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const [loading, setLoading] = useState(false);
  const [calculationType, setCalculationType] = useState<'guna-milan' | 'marriage'>('guna-milan');
  const [gunaMilanResult, setGunaMilanResult] = useState<GunaMilanResponse | null>(null);
  const [marriageResult, setMarriageResult] = useState<MarriageCompatibilityResponse | null>(null);
  const [partner1, setPartner1] = useState<PartnerFormData>({
    name: '',
    year: new Date().getFullYear() - 25,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    birthPlace: '',
    latitude: 28.6139,
    longitude: 77.209,
  });
  const [partner2, setPartner2] = useState<PartnerFormData>({
    name: '',
    year: new Date().getFullYear() - 23,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    birthPlace: '',
    latitude: 28.6139,
    longitude: 77.209,
  });

  const handlePartner1Change = (field: keyof PartnerFormData, value: string | number) => {
    const updated = { ...partner1, [field]: value };
    if (field === 'birthPlace' && typeof value === 'string') {
      const coords = getCoordinatesFromCity(value);
      updated.latitude = coords.lat;
      updated.longitude = coords.lng;
    }
    setPartner1(updated);
  };

  const handlePartner2Change = (field: keyof PartnerFormData, value: string | number) => {
    const updated = { ...partner2, [field]: value };
    if (field === 'birthPlace' && typeof value === 'string') {
      const coords = getCoordinatesFromCity(value);
      updated.latitude = coords.lat;
      updated.longitude = coords.lng;
    }
    setPartner2(updated);
  };

  const validateForm = (): boolean => {
    if (!partner1.birthPlace.trim() || !partner2.birthPlace.trim()) {
      showError("Please enter birth place for both partners");
      return false;
    }
    if (partner1.year < 1900 || partner1.year > new Date().getFullYear()) {
      showError("Please enter a valid year for Partner 1");
      return false;
    }
    if (partner2.year < 1900 || partner2.year > new Date().getFullYear()) {
      showError("Please enter a valid year for Partner 2");
      return false;
    }
    return true;
  };

  const requestBody: CompatibilityRequest = {
    partner1: { year: partner1.year, month: partner1.month, day: partner1.day, hour: partner1.hour, minute: partner1.minute, latitude: partner1.latitude, longitude: partner1.longitude, birthPlace: partner1.birthPlace },
    partner2: { year: partner2.year, month: partner2.month, day: partner2.day, hour: partner2.hour, minute: partner2.minute, latitude: partner2.latitude, longitude: partner2.longitude, birthPlace: partner2.birthPlace },
  };

  const calculateGunaMilan = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const t = token?.trim();
      const useAuth = !!(t && t.split(".").length === 3);
      const result = useAuth
        ? await compatibilityApi.calculateGunaMilan(t!, requestBody)
        : await compatibilityApi.calculateGunaMilanGuest(requestBody);
      setGunaMilanResult(result);
      setMarriageResult(null);
      showSuccess("Guna Milan calculated successfully!");
    } catch (err) {
      const error = err as { message?: string };
      showError(error.message || "Failed to calculate Guna Milan");
      console.error("Error calculating Guna Milan:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateMarriage = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const t = token?.trim();
      const useAuth = !!(t && t.split(".").length === 3);
      const result = useAuth
        ? await compatibilityApi.calculateMarriageCompatibility(t!, requestBody)
        : await compatibilityApi.calculateMarriageCompatibilityGuest(requestBody);
      setMarriageResult(result);
      setGunaMilanResult(null);
      showSuccess("Marriage compatibility calculated successfully!");
    } catch (err) {
      const error = err as { message?: string };
      showError(error.message || "Failed to calculate marriage compatibility");
      console.error("Error calculating marriage compatibility:", err);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Excellent':
        return '#10b981';
      case 'Good':
        return '#3b82f6';
      case 'Average':
        return '#f59e0b';
      case 'Below Average':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const main = (
    <main className={styles.mainContent}>
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.backButton}>← Back</button>
      </div>
      <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Match Horoscope (Compatibility)</h1>

            <div className={styles.compatibilityForm}>
              <div className={styles.formTabs}>
                <button
                  className={calculationType === 'guna-milan' ? styles.activeTab : styles.tab}
                  onClick={() => {
                    setCalculationType('guna-milan');
                    setGunaMilanResult(null);
                    setMarriageResult(null);
                  }}
                >
                  Guna Milan
                </button>
                <button
                  className={calculationType === 'marriage' ? styles.activeTab : styles.tab}
                  onClick={() => {
                    setCalculationType('marriage');
                    setGunaMilanResult(null);
                    setMarriageResult(null);
                  }}
                >
                  Full Marriage Compatibility
                </button>
              </div>

              <div className={styles.partnersForm}>
                <div className={styles.partnerForm}>
                  <h3 className={styles.partnerTitle}>Partner 1</h3>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Name (Optional)</label>
                      <input
                        type="text"
                        value={partner1.name}
                        onChange={(e) => handlePartner1Change('name', e.target.value)}
                        placeholder="Partner 1 name"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Place *</label>
                      <input
                        type="text"
                        value={partner1.birthPlace}
                        onChange={(e) => handlePartner1Change('birthPlace', e.target.value)}
                        placeholder="City, State"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Date of Birth *</label>
                      <div className={styles.dateInputs}>
                        <input
                          type="number"
                          value={partner1.year}
                          onChange={(e) => handlePartner1Change('year', parseInt(e.target.value) || 1990)}
                          placeholder="Year"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                        <input
                          type="number"
                          value={partner1.month}
                          onChange={(e) => handlePartner1Change('month', parseInt(e.target.value) || 1)}
                          placeholder="Month"
                          min="1"
                          max="12"
                        />
                        <input
                          type="number"
                          value={partner1.day}
                          onChange={(e) => handlePartner1Change('day', parseInt(e.target.value) || 1)}
                          placeholder="Day"
                          min="1"
                          max="31"
                        />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Time (Optional)</label>
                      <div className={styles.timeInputs}>
                        <input
                          type="number"
                          value={partner1.hour}
                          onChange={(e) => handlePartner1Change('hour', parseInt(e.target.value) || 12)}
                          placeholder="Hour"
                          min="0"
                          max="23"
                        />
                        <input
                          type="number"
                          value={partner1.minute}
                          onChange={(e) => handlePartner1Change('minute', parseInt(e.target.value) || 0)}
                          placeholder="Minute"
                          min="0"
                          max="59"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.partnerForm}>
                  <h3 className={styles.partnerTitle}>Partner 2</h3>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Name (Optional)</label>
                      <input
                        type="text"
                        value={partner2.name}
                        onChange={(e) => handlePartner2Change('name', e.target.value)}
                        placeholder="Partner 2 name"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Place *</label>
                      <input
                        type="text"
                        value={partner2.birthPlace}
                        onChange={(e) => handlePartner2Change('birthPlace', e.target.value)}
                        placeholder="City, State"
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.inputGroup}>
                      <label>Date of Birth *</label>
                      <div className={styles.dateInputs}>
                        <input
                          type="number"
                          value={partner2.year}
                          onChange={(e) => handlePartner2Change('year', parseInt(e.target.value) || 1990)}
                          placeholder="Year"
                          min="1900"
                          max={new Date().getFullYear()}
                        />
                        <input
                          type="number"
                          value={partner2.month}
                          onChange={(e) => handlePartner2Change('month', parseInt(e.target.value) || 1)}
                          placeholder="Month"
                          min="1"
                          max="12"
                        />
                        <input
                          type="number"
                          value={partner2.day}
                          onChange={(e) => handlePartner2Change('day', parseInt(e.target.value) || 1)}
                          placeholder="Day"
                          min="1"
                          max="31"
                        />
                      </div>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Time (Optional)</label>
                      <div className={styles.timeInputs}>
                        <input
                          type="number"
                          value={partner2.hour}
                          onChange={(e) => handlePartner2Change('hour', parseInt(e.target.value) || 12)}
                          placeholder="Hour"
                          min="0"
                          max="23"
                        />
                        <input
                          type="number"
                          value={partner2.minute}
                          onChange={(e) => handlePartner2Change('minute', parseInt(e.target.value) || 0)}
                          placeholder="Minute"
                          min="0"
                          max="59"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.calculateButton}>
                <button
                  onClick={calculationType === 'guna-milan' ? calculateGunaMilan : calculateMarriage}
                  disabled={loading}
                  className={styles.loginButton}
                  style={{ maxWidth: '400px', margin: '0 auto' }}
                >
                  {loading ? 'Calculating...' : `Calculate ${calculationType === 'guna-milan' ? 'Guna Milan' : 'Marriage Compatibility'}`}
                </button>
              </div>
            </div>

            {gunaMilanResult && (
              <div className={styles.compatibilityResult}>
                <h2 className={styles.sectionTitle}>Guna Milan Results</h2>
                <div className={styles.gunaMilanSummary}>
                  <div className={styles.gunaMilanCard}>
                    <h3 className={styles.cardTitle}>Total Score</h3>
                    <p className={styles.cardValue} style={{ fontSize: '2.5rem' }}>
                      {gunaMilanResult.totalScore} / {gunaMilanResult.maxScore}
                    </p>
                    <p className={styles.cardSubtext} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getVerdictColor(gunaMilanResult.verdict) }}>
                      {gunaMilanResult.percentage}% - {gunaMilanResult.verdict}
                    </p>
                  </div>
                </div>
                <div className={styles.gunasList}>
                  {gunaMilanResult.gunas.map((guna, index) => (
                    <div key={index} className={styles.gunaCard}>
                      <div className={styles.gunaHeader}>
                        <h4 className={styles.gunaName}>{guna.name}</h4>
                        <span className={styles.gunaScore}>{guna.score} / {guna.maxScore}</span>
                      </div>
                      <p className={styles.gunaDescription}>{guna.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {marriageResult && (
              <div className={styles.compatibilityResult}>
                <h2 className={styles.sectionTitle}>Marriage Compatibility Results</h2>
                <div className={styles.gunaMilanSummary}>
                  <div className={styles.gunaMilanCard}>
                    <h3 className={styles.cardTitle}>Guna Milan Score</h3>
                    <p className={styles.cardValue} style={{ fontSize: '2rem' }}>
                      {marriageResult.gunaMilan.totalScore} / {marriageResult.gunaMilan.maxScore}
                    </p>
                    <p className={styles.cardSubtext} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: getVerdictColor(marriageResult.gunaMilan.verdict) }}>
                      {marriageResult.gunaMilan.percentage}% - {marriageResult.gunaMilan.verdict}
                    </p>
                  </div>
                </div>
                <div className={styles.doshaCompatibility}>
                  <h3 className={styles.cardTitle}>Dosha Compatibility</h3>
                  <div className={styles.doshaList}>
                    <div className={styles.doshaItem}>
                      <strong>Manglik:</strong> {marriageResult.doshas.manglik}
                    </div>
                    <div className={styles.doshaItem}>
                      <strong>Nadi:</strong> {marriageResult.doshas.nadi}
                    </div>
                    <div className={styles.doshaItem}>
                      <strong>Bhakoot:</strong> {marriageResult.doshas.bhakoot}
                    </div>
                  </div>
                </div>
                {marriageResult.strengths.length > 0 && (
                  <div className={styles.strengthsChallenges}>
                    <h3 className={styles.cardTitle} style={{ color: '#10b981' }}>Strengths</h3>
                    <ul className={styles.strengthsList}>
                      {marriageResult.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {marriageResult.challenges.length > 0 && (
                  <div className={styles.strengthsChallenges}>
                    <h3 className={styles.cardTitle} style={{ color: '#dc2626' }}>Challenges</h3>
                    <ul className={styles.challengesList}>
                      {marriageResult.challenges.map((challenge, index) => (
                        <li key={index}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className={styles.overallVerdict}>
                  <h3 className={styles.cardTitle}>Overall Verdict</h3>
                  <p className={styles.verdictText}>{marriageResult.overallVerdict}</p>
                </div>
              </div>
            )}
          </div>
    </main>
  );

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        {main}
      </div>
    </div>
  );
}
