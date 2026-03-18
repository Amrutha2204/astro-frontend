import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { astroApi, type KundliResponse, CHART_OPTIONS } from "@/services/api";
import { paymentApi } from "@/services/paymentService";
import { reportsApi, type GenerateReportResponse } from "@/services/reportsService";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import { isValidJwtFormat } from "@/utils/auth";
import { showError, showSuccess } from "@/utils/toast";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";

type PlanetPosition = {
  planet: string;
  sign: string;
  degree?: number;
  retrograde?: boolean;
};

const REDIRECT_DELAY_MS = 2000;

type RazorpayHandlerPayload = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayHandlerPayload) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: () => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const HOUSE_CARD_STYLES = [
  "border-[#93c5fd] bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_100%)]",
  "border-[#f5b6f0] bg-[linear-gradient(135deg,#fbecf8_0%,#f8d7f3_100%)]",
  "border-[#fde08a] bg-[linear-gradient(135deg,#fef7e0_0%,#fef3c7_100%)]",
  "border-[#93c5fd] bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_100%)]",
  "border-[#86efac] bg-[linear-gradient(135deg,#dbeafb_0%,#bff7d5_100%)]",
  "border-[#fca5a5] bg-[linear-gradient(135deg,#fee8e8_0%,#fdddd6_100%)]",
  "border-[#99f6e4] bg-[linear-gradient(135deg,#deeff8_0%,#ccfbf1_100%)]",
  "border-[#fde047] bg-[linear-gradient(135deg,#fef9e0_0%,#fef08a_100%)]",
  "border-[#d8b4fe] bg-[linear-gradient(135deg,#ede9fe_0%,#e9d5ff_100%)]",
  "border-[#d4a574] bg-[linear-gradient(135deg,#f5e6d3_0%,#e8dcc7_100%)]",
  "border-[#bef264] bg-[linear-gradient(135deg,#f0fde4_0%,#dcfce7_100%)]",
  "border-[#6ee7b7] bg-[linear-gradient(135deg,#ccfbf1_0%,#a7f3d0_100%)]",
];

export default function KundliPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [kundli, setKundli] = useState<KundliResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartSelection, setChartSelection] = useState<string>("lagna");
  const [reportPaying, setReportPaying] = useState(false);
  const [reportDownload, setReportDownload] = useState<GenerateReportResponse | null>(null);

  const zodiacSigns = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];

  const getHouseFromSign = (sign: string, lagna: string): number | null => {
    const lagnaIndex = zodiacSigns.indexOf(lagna);
    const signIndex = zodiacSigns.indexOf(sign);

    if (lagnaIndex === -1 || signIndex === -1) {
      return null;
    }

    return ((signIndex - lagnaIndex + 12) % 12) + 1;
  };
  const fetchKundli = useCallback(async () => {
    const t = token?.trim();
    if (!isValidJwtFormat(t)) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    const tokenStr = t as string;
    try {
      setLoading(true);
      const data = await astroApi.getMyKundli(tokenStr, undefined, chartSelection);
      setKundli(data);
      setError(null);
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load Kundli";
      setError(msg);
      if (msg.includes("Cannot connect")) {
        console.error(
          "Backend service may not be running. Please start astro-service on port 8002",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router, chartSelection]);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    if (!isValidJwtFormat(token)) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchKundli();
  }, [rehydrated, token, dispatch, router, fetchKundli]);

  const handleChartChange = (chart: string) => {
    setChartSelection(chart);
  };
  const isWestern = chartSelection === "western";

  const getHouseCardClass = (index: number) =>
    HOUSE_CARD_STYLES[index] ??
    "border-[#d4cfc4] bg-[linear-gradient(135deg,#f0f4f8_0%,#e8eef5_100%)]";

  const loadRazorpay = (): Promise<void> => {
    if (typeof window === "undefined") {
      return Promise.reject(new Error("No window"));
    }
    if (window.Razorpay) {
      return Promise.resolve();
    }
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
    const tokenStr = t as string;
    setReportPaying(true);
    setReportDownload(null);
    try {
      await loadRazorpay();
      const res = await paymentApi.createOrder(tokenStr, 99, "Kundli PDF Report");
      if (!window.Razorpay) {
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
        handler: async (response: RazorpayHandlerPayload) => {
          try {
            await paymentApi.verify(
              tokenStr,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            const report = await reportsApi.purchaseOneTime(tokenStr, "kundli_summary");
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
      const rzp = new window.Razorpay(options);
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
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <Loading text="Loading your Kundli..." />
          </main>
        </div>
      </div>
    );
  }

  const renderHouseBox = (houseNumber: number) => {
    if (!kundli?.planetaryPositions || !Array.isArray(kundli.planetaryPositions)) {
      return null;
    }

    const planetsInHouse = kundli.planetaryPositions.filter((planet: PlanetPosition) => {
      if (!planet?.sign || !kundli?.lagna) {
        return false;
      }

      const house = getHouseFromSign(planet.sign, kundli.lagna);
      return house === houseNumber;
    });

    return (
      <div className="relative flex items-center justify-center border border-[#e2caa6]">
        <div className="absolute left-2 top-[6px] -rotate-45 text-[11px] font-semibold text-[#b08a55]">
          {houseNumber}
        </div>
        <div className="-rotate-45 text-center text-[12px] leading-[1.4] text-[#6b4423]">
          {planetsInHouse.map((planet: PlanetPosition, index: number) => {
            if (!planet?.planet) {
              return null;
            }

            const shortName = planet.planet.slice(0, 2);
            const degreeText =
              planet.degree !== undefined && planet.degree !== null
                ? `${planet.degree.toFixed(0)}°`
                : "";
            const retrogradeMark = planet.retrograde ? " *" : "";

            return (
              <div key={`${planet.planet}-${houseNumber}-${index}`} className="font-medium">
                {shortName} {degreeText}
                {retrogradeMark}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h1 className="m-0 mb-8 bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text text-[36px] font-extrabold tracking-[-0.01em] text-transparent">
                My Kundli
              </h1>
              <label className="mb-0 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                <span>Chart:</span>
                <select
                  value={chartSelection}
                  onChange={(e) => handleChartChange(e.target.value)}
                  className="formSelect formSelectInline min-w-[220px] cursor-pointer rounded-[8px] border border-[var(--border-color,#e5e7eb)] bg-[var(--bg-main)] px-3 py-2 text-[14px] text-[var(--text-main)]"
                  aria-label="Select chart type"
                >
                  {CHART_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <ErrorMessage message={error} />}

            {loading && !kundli && <Loading text="Loading your chart..." variant="page" />}

            {kundli &&
              (() => {
                const hasNoData = !(kundli.lagna || kundli.moonSign || kundli.sunSign);
                if (hasNoData) {
                  return (
                    <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-10 shadow-[0_8px_32px_rgba(107,68,35,0.15)]">
                      <ErrorMessage message="Kundli data could not be loaded. This usually means your birth details are missing or the server could not calculate the chart. Please save your date of birth, birth time and birth place on the Birth Details page and try again." />
                      <p className="mt-3">
                        <Link
                          href="/birth-details"
                          className="text-[#7c3aed] underline transition-colors duration-200 hover:text-[#5b21b6]"
                        >
                          Go to Birth Details →
                        </Link>
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

            {kundli && (kundli.lagna || kundli.moonSign || kundli.sunSign) && (
              <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-10 shadow-[0_8px_32px_rgba(107,68,35,0.15)]">
                <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                  <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                    {kundli.chartLabel ||
                      (isWestern ? "Chart overview (Western)" : "Basic Information")}
                  </h2>
                  <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
                    <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319041/lagna-bg2_nw2j9b.jpg')] bg-cover bg-center px-5 py-[18px]">
                      <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                        {isWestern ? "Ascendant:" : "Lagna (Ascendant): "}
                      </span>
                      <span className="text-[18px] font-bold text-[#f5ede1]">
                        {kundli.lagna || "N/A"}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318878/moon-bg3_ldnu8j.jpg')] bg-cover bg-center px-5 py-[18px]">
                      <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                        Moon Sign:
                      </span>
                      <span className="text-[18px] font-bold text-[#f5ede1]">
                        {kundli.moonSign || "N/A"}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318832/sun-bg2_qootgt.jpg')] bg-cover bg-center px-5 py-[18px]">
                      <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                        Sun Sign:
                      </span>
                      <span className="text-[18px] font-bold text-[#f5ede1]">
                        {kundli.sunSign || "N/A"}
                      </span>
                    </div>

                    {!isWestern && (
                      <>
                        <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318879/nakshatra-bg_tiflyk.jpg')] bg-cover bg-center px-5 py-[18px]">
                          <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                            Nakshatra:
                          </span>
                          <span className="text-[18px] font-bold text-[#f5ede1]">
                            {kundli.nakshatra || "N/A"}
                          </span>
                        </div>
                        {kundli.pada !== null && kundli.pada > 0 && (
                          <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318886/pada-bg3_bs8jtx.jpg')] bg-cover bg-center px-5 py-[18px]">
                            <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                              Pada:
                            </span>
                            <span className="text-[18px] font-bold text-[#f5ede1]">
                              {kundli.pada}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {kundli.planetaryPositions && Array.isArray(kundli.planetaryPositions) && (
                  <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                    <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                      Kundli Chart
                    </h2>
                    <p className="mb-3 mt-[-6px] text-[13px] text-[#6b5b52]">
                      {" "}
                      * = retrograde (planet appears to move backward at birth)
                    </p>
                    <div className="mb-20 mt-[90px] flex justify-center">
                      <div className="relative grid h-[380px] w-[380px] rotate-45 grid-cols-4 grid-rows-4 border-[2px] border-[#d6b98c] bg-[#f6efe6] shadow-[0_10px_25px_rgba(166,124,82,0.15)]">
                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-[120px] text-[#130c01] opacity-[0.05]">
                          ॐ
                        </div>
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
                  <>
                    <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                      <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                        12 Houses &amp; Signs
                      </h2>
                      <div className="mb-4 grid grid-cols-4 gap-x-5 gap-y-2">
                        {kundli.houses.map((h) => (
                          <div key={h.house} className="flex items-center gap-2 text-[14px]">
                            <span className="min-w-[72px] font-semibold text-[#3b3b6d]">
                              House {h.house}
                            </span>
                            <span className="text-[#2c2c54]">{h.sign}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                      <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                        Houses (detail)
                      </h2>
                      <div className="grid grid-cols-4 gap-3">
                        {kundli.houses.map((houseData, index) => (
                          <div
                            key={houseData.house}
                            className={`rounded-[12px] border-[1.5px] px-4 py-5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(107,68,35,0.15)] ${getHouseCardClass(index)}`}
                          >
                            <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.05em] text-[#6b4423]">
                              House {houseData.house} – {houseData.meaning ?? "—"}
                            </div>
                            <div className="mb-[6px] text-[18px] font-extrabold tracking-[-0.01em] text-[#2d2a26]">
                              Sign: {houseData.sign}
                            </div>

                            <div className="text-[15px] font-bold text-[#8b5e34]">
                              Degree:{" "}
                              {typeof houseData.degree === "number"
                                ? `${houseData.degree.toFixed(2)}°`
                                : "N/A"}
                            </div>
                            {houseData.meaningDetail && (
                              <p className="mt-2 text-left text-[11px] leading-[1.35] text-[#444]">
                                {houseData.meaningDetail}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-[30px] flex items-center gap-2 border-t border-t-[#e5e7eb] pt-5 text-[14px]">
                  <span className="font-semibold text-[#6b7280]">Source:</span>
                  <span className="font-medium text-[#1f2937]">{kundli.source}</span>
                </div>

                <div className="mt-6 rounded-[8px] border border-[#c8e6c9] bg-[#f0f7f0] p-5">
                  <h3 className="mb-2 text-[16px] font-semibold text-[#2e7d32]">
                    Get your Kundli as PDF
                  </h3>
                  <p className="mb-[14px] text-[14px] text-[#1b5e20]">
                    One-time purchase — ₹99. Download a detailed PDF report.
                  </p>
                  {reportDownload ? (
                    <a
                      href={reportDownload.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-[8px] bg-[#1565c0] px-[18px] py-[10px] text-[14px] font-semibold text-white no-underline transition-colors duration-200 hover:bg-[#0d47a1]"
                    >
                      Download report
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGetPdfReport}
                      disabled={reportPaying}
                      className="inline-block rounded-[8px] bg-[#2e7d32] px-[18px] py-[10px] text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#1b5e20] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {reportPaying ? "Opening payment…" : "Get PDF report — ₹99"}
                    </button>
                  )}
                </div>
                {loading && (
                  <div className="mt-4 flex items-center justify-center rounded-[8px] border border-[#e8ddd0] bg-[#fdf8f3] px-4 py-3">
                    <Loading text="Updating chart..." variant="inline" />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
