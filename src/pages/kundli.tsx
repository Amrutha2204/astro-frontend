import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi, KundliResponse } from "@/services/api";
import { paymentApi } from "@/services/paymentService";
import { reportsApi, GenerateReportResponse } from "@/services/reportsService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import houseMeanings from "@/services/houseMeanings";
import { isValidJwtFormat } from "@/utils/auth";
import { showError, showSuccess } from "@/utils/toast";
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

const REDIRECT_DELAY_MS = 2000;

export default function KundliPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [kundli, setKundli] = useState<KundliResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartSystem, setChartSystem] = useState<"vedic" | "western">("vedic");
  const [reportPaying, setReportPaying] = useState(false);
  const [reportDownload, setReportDownload] = useState<GenerateReportResponse | null>(null);

  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer",
    "Leo", "Virgo", "Libra", "Scorpio",
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const getHouseFromSign = (sign: string, lagna: string): number | null => {
    const lagnaIndex = zodiacSigns.indexOf(lagna);
    const signIndex = zodiacSigns.indexOf(sign);

    if (lagnaIndex === -1 || signIndex === -1) return null;

    return ((signIndex - lagnaIndex + 12) % 12) + 1;
  };
  const fetchKundli = useCallback(async () => {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);

      // 🔥 Add this inside KundliPage component (above return)

      return;
    }
    try {
      setLoading(true);
      const data = await astroApi.getMyKundli(t, undefined, chartSystem);
      setKundli(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Kundli";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error("Backend service may not be running. Please start astro-service on port 8002");
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router, chartSystem]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!isValidJwtFormat(token)) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchKundli();
  }, [rehydrated, token, dispatch, router, fetchKundli]);

  const handleSystemChange = (system: "vedic" | "western") => {
    setChartSystem(system);
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

  const handleGetPdfReport = async () => {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      showError("Please log in to get a PDF report.");
      return;
    }
    setReportPaying(true);
    setReportDownload(null);
    try {
      await loadRazorpay();
      const res = await paymentApi.createOrder(t, 99, "Kundli PDF Report");
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
        description: "Kundli PDF Report — ₹99",
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await paymentApi.verify(t, response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
            const report = await reportsApi.purchaseOneTime(t, "kundli_summary");
            setReportDownload(report);
            showSuccess("Report ready! Download below.");
          } catch (e) {
            showError(e instanceof Error ? e.message : "Payment or report failed");
          } finally {
            setReportPaying(false);
          }
        },
        modal: {
          ondismiss: () => setReportPaying(false),
        },
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

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <Loading text="Loading your Kundli..." />
          </main>
        </div>
      </div>
    );
  }

  const renderHouseBox = (houseNumber: number) => {
    if (!kundli?.planetaryPositions) return null;

    const planetsInHouse = kundli.planetaryPositions.filter((p: any) => {
      const house = getHouseFromSign(p.sign, kundli.lagna);
      return house === houseNumber;
    });

    return (
      <div className={styles.house}>
        <div className={styles.houseNumber}>{houseNumber}</div>

        <div className={styles.houseContent}>
          {planetsInHouse.map((p: any, i: number) => (
            <div key={i} className={styles.planetText}>
              {p.planet.slice(0, 2)} {p.degree?.toFixed(0)}°
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
              <h1 className={styles.pageTitle}>My Kundli</h1>
              <div className={styles.formTabs} style={{ marginBottom: 0 }}>
                <button
                  type="button"
                  onClick={() => handleSystemChange("vedic")}
                  className={chartSystem === "vedic" ? styles.activeTab : styles.tab}
                >
                  Vedic
                </button>
                <button
                  type="button"
                  onClick={() => handleSystemChange("western")}
                  className={chartSystem === "western" ? styles.activeTab : styles.tab}
                >
                  Western
                </button>
              </div>
            </div>
            {error && <ErrorMessage message={error} />}

            {kundli && (
              <div className={styles.kundliContent}>
                <div className={styles.kundliSection}>
                  <h2 className={styles.sectionTitle}>{chartSystem === "western" ? "Chart overview (Western)" : "Basic Information"}</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>{chartSystem === "western" ? "Ascendant:" : "Lagna (Ascendant):"}</span>
                      <span className={styles.infoValue}>{kundli.lagna || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Moon Sign:</span>
                      <span className={styles.infoValue}>{kundli.moonSign || "N/A"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Sun Sign:</span>
                      <span className={styles.infoValue}>{kundli.sunSign || "N/A"}</span>
                    </div>
                    {chartSystem === "vedic" && (
                      <>
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Nakshatra:</span>
                          <span className={styles.infoValue}>{kundli.nakshatra || "N/A"}</span>
                        </div>
                        {kundli.pada != null && kundli.pada > 0 && (
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Pada:</span>
                            <span className={styles.infoValue}>{kundli.pada}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {kundli.planetaryPositions && Array.isArray(kundli.planetaryPositions) && (
                <div className={styles.kundliSection}>
                 <h2 className={styles.sectionTitle}>Kundli Chart</h2>
   
                <div className={styles.chartWrapper}>
                 <div className={styles.kundaliChart}>
                     <div className={styles.centerWatermark}>ॐ</div>
                        {renderHouseBox(12)}
                        {renderHouseBox(1)}
                        {renderHouseBox(2)}
                        {renderHouseBox(3)}

                        {renderHouseBox(11)}
                    <div></div>
                    <div></div>
                        {renderHouseBox(4)}

                        {renderHouseBox(10)}
                    <div></div>
                    <div></div>
                        {renderHouseBox(5)}
                        {renderHouseBox(9)}
                        {renderHouseBox(8)}
                        {renderHouseBox(7)}
                        {renderHouseBox(6)}
      </div>
    </div>
  </div>
)}

                {kundli.houses && Array.isArray(kundli.houses) && kundli.houses.length > 0 && (
                  <div className={styles.kundliSection}>
                    <h2 className={styles.sectionTitle}>Houses</h2>
                    <div className={styles.housesGrid}>
                      {kundli.houses.map((houseData) => (
                      <div key={houseData.house} className={styles.houseCard}>
                      <div className={styles.houseTitle}>
      House {houseData.house} – {houseMeanings[Number(houseData.house)]}
    </div>
                    <div className={styles.houseSign}>
                    Sign: {houseData.sign}
                    </div>

                    <div className={styles.houseCusp}>
                      Degree: {typeof houseData.degree === "number"
                      ? `${houseData.degree.toFixed(2)}°`
                      : "N/A"}
                   </div>

              </div>
            ))}
                    </div>
                  </div>
                )}

                <div className={styles.sourceInfo}>
                  <span className={styles.sourceLabel}>Source:</span>
                  <span className={styles.sourceValue}>{kundli.source}</span>
                </div>

                <div className={styles.reportOneTimeBlock}>
                  <h3 className={styles.reportOneTimeTitle}>Get your Kundli as PDF</h3>
                  <p className={styles.reportOneTimeText}>One-time purchase — ₹99. Download a detailed PDF report.</p>
                  {reportDownload ? (
                    <a
                      href={reportDownload.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.reportDownloadBtn}
                    >
                      Download report
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGetPdfReport}
                      disabled={reportPaying}
                      className={styles.reportPayBtn}
                    >
                      {reportPaying ? "Opening payment…" : "Get PDF report — ₹99"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

