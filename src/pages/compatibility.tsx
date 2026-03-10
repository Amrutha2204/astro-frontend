import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { compatibilityApi, CompatibilityRequest, GunaMilanResponse, MarriageCompatibilityResponse } from "@/services/compatibilityService";
import { paymentApi } from "@/services/paymentService";
import { reportsApi, GenerateReportResponse } from "@/services/reportsService";
import { getUserDetails } from "@/services/userService";
import { getCoordinatesFromCity, isCityRecognized } from "@/utils/coordinates";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import { selectToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

export type PartnerGender = "male" | "female" | "";

interface PartnerFormData {
  name: string;
  gender: PartnerGender;
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
  const [unlocked, setUnlocked] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unknownTime1, setUnknownTime1] = useState(false);
  const [unknownTime2, setUnknownTime2] = useState(false);
  const [reportPaying, setReportPaying] = useState(false);
  const [reportDownload, setReportDownload] = useState<GenerateReportResponse | null>(null);
  const [selectedGunaIndex, setSelectedGunaIndex] = useState<number | null>(null);
  const [partner1Prefilled, setPartner1Prefilled] = useState(false);
  const [partner1, setPartner1] = useState<PartnerFormData>({
    name: '',
    gender: '',
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
    gender: '',
    year: new Date().getFullYear() - 23,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    birthPlace: '',
    latitude: 28.6139,
    longitude: 77.209,
  });

  useEffect(() => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3 || partner1Prefilled) return;
    getUserDetails(t)
      .then((res: any) => {
        const dob = res?.dob;
        const birthPlace = res?.birthPlace ?? "";
        const birthTime = res?.birthTime ?? "12:00:00";
        const name = (res?.user?.name ?? res?.name ?? "") ?? "";
        if (!dob || !birthPlace) return;
        const d = new Date(dob);
        if (isNaN(d.getTime())) return;
        const [h = 12, m = 0] = birthTime.split(":").map(Number);
        const coords = getCoordinatesFromCity(birthPlace);
        setPartner1({
          name: typeof name === "string" ? name : "",
          gender: "",
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          hour: h,
          minute: m,
          birthPlace,
          latitude: coords.lat,
          longitude: coords.lng,
        });
        setPartner1Prefilled(true);
      })
      .catch(() => {});
  }, [token]);

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
    if (partner1.gender && partner2.gender && partner1.gender === partner2.gender) {
      showError("Partners must have different genders for compatibility match.");
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
    partner1: { year: partner1.year, month: partner1.month, day: partner1.day, hour: unknownTime1 ? 12 : partner1.hour, minute: unknownTime1 ? 0 : partner1.minute, latitude: partner1.latitude, longitude: partner1.longitude, birthPlace: partner1.birthPlace },
    partner2: { year: partner2.year, month: partner2.month, day: partner2.day, hour: unknownTime2 ? 12 : partner2.hour, minute: unknownTime2 ? 0 : partner2.minute, latitude: partner2.latitude, longitude: partner2.longitude, birthPlace: partner2.birthPlace },
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
      setReportDownload(null);
      setUnlocked(!!useAuth);
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
      setReportDownload(null);
      setUnlocked(!!useAuth);
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

  const handleUnlock = () => {
    const email = leadEmail.trim();
    if (!email) {
      showError("Please enter your email to unlock the full report.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }
    setUnlockLoading(true);
    setUnlocked(true);
    setUnlockLoading(false);
    showSuccess("Full report unlocked.");
  };

  const loadRazorpay = (): Promise<void> => {
    if (typeof window === "undefined") return Promise.reject(new Error("No window"));
    const w = window as any;
    if (w.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(s);
    });
  };

  const getCompatibilityPartnersForReport = () => ({
    partner1: {
      year: partner1.year,
      month: partner1.month,
      day: partner1.day,
      hour: unknownTime1 ? 12 : partner1.hour,
      minute: unknownTime1 ? 0 : partner1.minute,
      latitude: partner1.latitude,
      longitude: partner1.longitude,
    },
    partner2: {
      year: partner2.year,
      month: partner2.month,
      day: partner2.day,
      hour: unknownTime2 ? 12 : partner2.hour,
      minute: unknownTime2 ? 0 : partner2.minute,
      latitude: partner2.latitude,
      longitude: partner2.longitude,
    },
  });

  const percentage =
  gunaMilanResult
    ? Math.round(
        (gunaMilanResult.totalScore / gunaMilanResult.maxScore) * 100
      )
    : 0;

  const handleGetPdfReport = async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      showError("Please log in to get a PDF report.");
      return;
    }
    setReportPaying(true);
    setReportDownload(null);
    try {
      await loadRazorpay();
      const res = await paymentApi.createOrder(t, 99, "Compatibility PDF Report");
      const w = window as any;
      if (!w.Razorpay) {
        showError("Payment gateway could not be loaded. Try again.");
        return;
      }
      const options = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        order_id: res.orderId,
        name: "Astro",
        description: "Compatibility PDF Report — ₹99",
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await paymentApi.verify(t, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            const report = await reportsApi.purchaseOneTime(t, "compatibility_summary", getCompatibilityPartnersForReport());
            setReportDownload(report);
            showSuccess("Report ready! Download below.");
          } catch (e) {
            showError(e instanceof Error ? e.message : "Payment or report failed");
          } finally {
            setReportPaying(false);
          }
        },
        modal: { ondismiss: () => setReportPaying(false) },
      };
      const rzp = new w.Razorpay(options);
      rzp.on("payment.failed", () => {
        showError("Payment failed or was cancelled.");
        setReportPaying(false);
      });
      rzp.open();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Could not start payment");
      setReportPaying(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/compatibility" : "";
  const handleShareWhatsApp = () => {
    let text = "Check our compatibility score on Jyotishya Darshan — ";
    if (gunaMilanResult) {
      text += `Guna Milan ${gunaMilanResult.totalScore}/${gunaMilanResult.maxScore} - ${gunaMilanResult.verdict}. `;
    } else if (marriageResult) {
      text += `Marriage match ${marriageResult.gunaMilan.totalScore}/${marriageResult.gunaMilan.maxScore} - ${marriageResult.gunaMilan.verdict}. `;
    }
    text += shareUrl;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const main = (
    <main className={styles.mainContent}>
      <PageHeader onBack={() => router.back()} />
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
                    setUnlocked(false);
                    setUnknownTime1(false);
                    setUnknownTime2(false);
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
                    setUnlocked(false);
                    setUnknownTime1(false);
                    setUnknownTime2(false);
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
                      <label>Gender (Optional)</label>
                      <select
                        value={partner1.gender}
                        onChange={(e) => handlePartner1Change('gender', e.target.value as PartnerGender)}
                        style={{ padding: '8px', borderRadius: '6px', minWidth: '120px' }}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <p className={styles.compatTimeHint}>Partners must have different genders for match.</p>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Place *</label>
                      <input
                        type="text"
                        value={partner1.birthPlace}
                        onChange={(e) => handlePartner1Change('birthPlace', e.target.value)}
                        placeholder="e.g. Mumbai, Delhi, London"
                        required
                      />
                      <p className={styles.compatTimeHint}>Use a city from our list (Indian and major international, e.g. Mumbai, London, Dubai). Unrecognized names fall back to Delhi.</p>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <label style={{ marginBottom: 0 }}>Birth Time (Optional)</label>
                        <button
                          type="button"
                          onClick={() => setUnknownTime1((p) => !p)}
                          className={styles.compatUnknownTimeBtn}
                          aria-pressed={unknownTime1}
                        >
                          {unknownTime1 ? "✓ I don't know" : "I don't know birth time"}
                        </button>
                      </div>
                      {!unknownTime1 && (
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
                      )}
                      {unknownTime1 && (
                        <p className={styles.compatTimeHint}>Noon (12:00) will be used. Lagna may be approximate.</p>
                      )}
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
                      <label>Gender (Optional)</label>
                      <select
                        value={partner2.gender}
                        onChange={(e) => handlePartner2Change('gender', e.target.value as PartnerGender)}
                        style={{ padding: '8px', borderRadius: '6px', minWidth: '120px' }}
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <p className={styles.compatTimeHint}>Partners must have different genders for match.</p>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Birth Place *</label>
                      <input
                        type="text"
                        value={partner2.birthPlace}
                        onChange={(e) => handlePartner2Change('birthPlace', e.target.value)}
                        placeholder="e.g. Mumbai, Delhi, London"
                        required
                      />
                      <p className={styles.compatTimeHint}>Use a city from our list (Indian and major international, e.g. Mumbai, London, Dubai). Unrecognized names fall back to Delhi.</p>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <label style={{ marginBottom: 0 }}>Birth Time (Optional)</label>
                        <button
                          type="button"
                          onClick={() => setUnknownTime2((p) => !p)}
                          className={styles.compatUnknownTimeBtn}
                          aria-pressed={unknownTime2}
                        >
                          {unknownTime2 ? "✓ I don't know" : "I don't know birth time"}
                        </button>
                      </div>
                      {!unknownTime2 && (
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
                      )}
                      {unknownTime2 && (
                        <p className={styles.compatTimeHint}>Noon (12:00) will be used. Lagna may be approximate.</p>
                      )}
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
                {(!isCityRecognized(partner1.birthPlace) || !isCityRecognized(partner2.birthPlace)) && (
                  <div className={styles.birthPlaceWarning} role="alert">
                    One or more birth places were not recognized, so Delhi was used for coordinates. For accurate results, use a city from our list (e.g. Mumbai, Delhi, London, Dubai).
                  </div>
                )}

                <div className={styles.matchHeaderContainer}> 
            <div className={styles.matchHeader}>
  {partner1.name || "Person 1"} ❤️ {partner2.name || "Person 2"}
</div>
</div>

                <div className={styles.heartSection}>
                <div className={styles.heartContainer}>
  <svg viewBox="0 0 512 512" className={styles.heartIcon}>
    <path d="M471.7 73.1c-54.5-46.4-136-38.3-186.4 13.7L256 116.6l-29.3-29.8C176.3 34.8 94.8 26.7 40.3 73.1-23.6 127.4-10.6 230.8 43 284.3l193.5 199.8c10.5 10.9 27.5 10.9 38 0L469 284.3c53.6-53.5 66.6-156.9 2.7-211.2z"/>
  </svg>

  <div className={styles.heartScore}>
    {gunaMilanResult.totalScore}/{gunaMilanResult.maxScore}
  </div>
</div>

  <h2 className={styles.compatibilityTitle}>
    {gunaMilanResult.verdict}
  </h2>

  <div className={styles.alignTags}>
    {gunaMilanResult.gunas
      .filter(g => g.score === g.maxScore)
      .map((guna, i) => (
        <span key={i} className={styles.tag}>
          ✨ {guna.name}
        </span>
      ))}
  </div>
</div>

                <div className={styles.parameters}>
  <h3 className={styles.parametersTitle}>
    Compatibility Parameters
  </h3>

  <div className={styles.parameterGrid}>
  {gunaMilanResult.gunas.map((guna, index) => (
    <div
      key={index}
      className={styles.parameterCard}
      onClick={() => setSelectedGunaIndex(index)}
    >
      <div className={styles.parameterHeader}>
        <span className={styles.parameterScore}>
          {guna.score}/{guna.maxScore}
        </span>
      </div>

      <h4>{guna.name}</h4>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${(guna.score / guna.maxScore) * 100}%`
          }}
        />
      </div>
    </div>
  ))}
</div>
</div>

                {selectedGunaIndex !== null && (
  <div className={styles.gunaDetailModal}>
    <div className={styles.gunaDetailCard}>
      
      <button
        className={styles.closeBtn}
        onClick={() => setSelectedGunaIndex(null)}
      >
        ✕
      </button>

      <h2>{gunaMilanResult?.gunas[selectedGunaIndex].name}</h2>

      <p style={{fontWeight:"bold"}}>
        Score: {gunaMilanResult?.gunas[selectedGunaIndex].score}/
        {gunaMilanResult?.gunas[selectedGunaIndex].maxScore}
      </p>

      {gunaMilanResult?.gunas[selectedGunaIndex].parameterMeaning && (
        <p className={styles.cardDescription} style={{ marginBottom: 12 }}>
          {gunaMilanResult.gunas[selectedGunaIndex].parameterMeaning}
        </p>
      )}

      <p>
        {gunaMilanResult?.gunas[selectedGunaIndex].description}
      </p>

      <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
        
        <button
          disabled={selectedGunaIndex === 0}
          onClick={() => setSelectedGunaIndex((i)=> (i! - 1))}
        >
          ← Previous
        </button>

        <button
          disabled={selectedGunaIndex === gunaMilanResult!.gunas.length - 1}
          onClick={() => setSelectedGunaIndex((i)=> (i! + 1))}
        >
          Next →
        </button>

      </div>

    </div>
  </div>
)}

                <div className={styles.shareRow}>
                  <button type="button" onClick={handleShareWhatsApp} className={styles.whatsappShareBtn} aria-label="Share via WhatsApp">
                    Share via WhatsApp
                  </button>
                </div>
                {token && (
                  <div className={styles.reportOneTimeBlock}>
                    <h3 className={styles.reportOneTimeTitle}>Get full report as PDF</h3>
                    <p className={styles.reportOneTimeText}>One-time purchase — ₹99. Download a detailed compatibility PDF.</p>
                    {reportDownload ? (
                      <a href={reportDownload.downloadUrl} target="_blank" rel="noopener noreferrer" className={styles.reportDownloadBtn}>
                        Download report
                      </a>
                    ) : (
                      <button type="button" onClick={handleGetPdfReport} disabled={reportPaying} className={styles.reportPayBtn}>
                        {reportPaying ? "Opening payment…" : "Get PDF report — ₹99"}
                      </button>
                    )}
                  </div>
                )}
                {!unlocked && (
                  <div className={styles.leadGate}>
                    <h3 className={styles.cardTitle}>Unlock full report</h3>
                    <p className={styles.leadGateText}>See detailed guna-wise breakdown and descriptions.</p>
                    <div className={styles.leadGateForm}>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className={styles.leadGateInput}
                      />
                      <button type="button" onClick={handleUnlock} disabled={unlockLoading} className={styles.loginButton}>
                        {unlockLoading ? "Unlocking…" : "Get full report"}
                      </button>
                    </div>
                    <p className={styles.leadGatePrivacy}>We use your email only to send this report. No spam.</p>
                  </div>
                )}
               
              </div>
            )}

            {marriageResult && (
              <div className={styles.compatibilityResult}>
                <h2 className={styles.sectionTitle}>Marriage Compatibility Results</h2>
                {(!isCityRecognized(partner1.birthPlace) || !isCityRecognized(partner2.birthPlace)) && (
                  <div className={styles.birthPlaceWarning} role="alert">
                    One or more birth places were not recognized, so Delhi was used for coordinates. For accurate results, use a city from our list (e.g. Mumbai, Delhi, London, Dubai).
                  </div>
                )}
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
                <div className={styles.shareRow}>
                  <button type="button" onClick={handleShareWhatsApp} className={styles.whatsappShareBtn} aria-label="Share via WhatsApp">
                    Share via WhatsApp
                  </button>
                </div>
                {token && (
                  <div className={styles.reportOneTimeBlock}>
                    <h3 className={styles.reportOneTimeTitle}>Get full report as PDF</h3>
                    <p className={styles.reportOneTimeText}>One-time purchase — ₹99. Download compatibility report with doshas, strengths and remedies.</p>
                    {reportDownload ? (
                      <a href={reportDownload.downloadUrl} target="_blank" rel="noopener noreferrer" className={styles.reportDownloadBtn}>
                        Download report
                      </a>
                    ) : (
                      <button type="button" onClick={handleGetPdfReport} disabled={reportPaying} className={styles.reportPayBtn}>
                        {reportPaying ? "Opening payment…" : "Get PDF report — ₹99"}
                      </button>
                    )}
                  </div>
                )}
                {!unlocked && (
                  <div className={styles.leadGate}>
                    <h3 className={styles.cardTitle}>Unlock full report</h3>
                    <p className={styles.leadGateText}>See doshas (Manglik, Nadi, Bhakoot), strengths, challenges, remedies and overall verdict.</p>
                    <div className={styles.leadGateForm}>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={leadEmail}
                        onChange={(e) => setLeadEmail(e.target.value)}
                        className={styles.leadGateInput}
                      />
                      <button type="button" onClick={handleUnlock} disabled={unlockLoading} className={styles.loginButton}>
                        {unlockLoading ? "Unlocking…" : "Get full report"}
                      </button>
                    </div>
                    <p className={styles.leadGatePrivacy}>We use your email only to send this report. No spam.</p>
                  </div>
                )}
                {unlocked && (
                  <>
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

                {/* Manglik-specific section: impact summary + remedies when relevant */}
                <div className={styles.manglikSection}>
                  <h3 className={styles.cardTitle}>Manglik impact</h3>
                  <p className={styles.manglikSummary}>
                    {marriageResult.doshas.manglik.toLowerCase().includes("cancel")
                      ? "When both partners are Manglik, the dosha is considered cancelled — no additional remedies are required for Manglik in this match."
                      : marriageResult.doshas.manglik.toLowerCase().includes("remed")
                        ? "Manglik dosha is present in this match. Simple remedies can help. Below are commonly suggested practices (for guidance only; consult an expert for personalised advice)."
                        : "Manglik status has been considered in the overall compatibility above."}
                  </p>
                  {marriageResult.doshas.manglik.toLowerCase().includes("remed") && (
                    <ul className={styles.manglikRemedies}>
                      <li><strong>Tuesday fasting:</strong> Observe a simple fast on Tuesdays, or avoid non-veg and alcohol.</li>
                      <li><strong>Hanuman mantra:</strong> Chant “Om Hanumate Namah” or “Hanuman Chalisa” regularly for strength and calm.</li>
                      <li><strong>Donation:</strong> Donate red items (e.g. cloth, lentils) or offer at Hanuman temple on Tuesdays.</li>
                    </ul>
                  )}
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
                  </>
                )}
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
