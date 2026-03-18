import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import {
  compatibilityApi,
  type CompatibilityRequest,
  type GunaMilanResponse,
  type MarriageCompatibilityResponse,
} from "@/services/compatibilityService";
import { paymentApi } from "@/services/paymentService";
import { reportsApi, type GenerateReportResponse } from "@/services/reportsService";
import { getUserDetails } from "@/services/userService";
import { astroApi } from "@/services/api";
import { isCityRecognized } from "@/utils/coordinates";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import { selectToken } from "@/store/slices/authSlice";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

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

type UserDetailsResponse = {
  dob?: string;
  birthPlace?: string;
  birthTime?: string;
  name?: string;
  user?: {
    name?: string;
  };
};

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
  modal: { ondismiss: () => void };
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

const fieldLabelClass = "text-[14px] font-semibold text-[#374151]";
const inputGroupClass = "flex flex-col gap-2";
const partnerCardClass = "rounded-[8px] bg-[#f9fafb] p-5";
const tabBaseClass =
  "bg-transparent px-6 py-3 text-[16px] font-semibold transition-all duration-200";
const sectionCardClass =
  "mt-[30px] rounded-[12px] bg-white p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]";
const brownButtonClass =
  "rounded-[12px] bg-[#6b4423] px-6 py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f] disabled:cursor-not-allowed disabled:opacity-60";

function getVerdictColorClass(verdict: string) {
  switch (verdict) {
    case "Excellent":
      return "text-[#10b981]";
    case "Good":
      return "text-[#3b82f6]";
    case "Average":
      return "text-[#f59e0b]";
    case "Below Average":
      return "text-[#dc2626]";
    default:
      return "text-[#6b7280]";
  }
}

function ResultActions({
  token,
  reportDownload,
  reportPaying,
  onGetPdfReport,
  reportUnlocked,
  leadEmail,
  setLeadEmail,
  unlockLoading,
  onUnlock,
  leadGateText,
  onShareWhatsApp,
}: {
  token: string | null | undefined;
  reportDownload: GenerateReportResponse | null;
  reportPaying: boolean;
  onGetPdfReport: () => void;
  reportUnlocked: boolean;
  leadEmail: string;
  setLeadEmail: (value: string) => void;
  unlockLoading: boolean;
  onUnlock: () => void;
  leadGateText: string;
  onShareWhatsApp: () => void;
}) {
  return (
    <>
      <div className="my-4">
        <button
          type="button"
          onClick={onShareWhatsApp}
          className="inline-flex items-center gap-2 rounded-[8px] bg-[#25d366] px-[18px] py-[10px] text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#20bd5a]"
          aria-label="Share via WhatsApp"
        >
          Share via WhatsApp
        </button>
      </div>
      {token && (
        <div className="mt-6 rounded-[8px] border border-[#c8e6c9] bg-[#f0f7f0] p-5">
          <h3 className="mb-2 text-[16px] font-semibold text-[#2e7d32]">Get full report as PDF</h3>
          <p className="mb-[14px] text-[14px] text-[#1b5e20]">
            One-time purchase — ₹99. Download a detailed compatibility PDF.
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
              onClick={onGetPdfReport}
              disabled={reportPaying}
              className="inline-block rounded-[8px] bg-[#2e7d32] px-[18px] py-[10px] text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#1b5e20] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {reportPaying ? "Opening payment…" : "Get PDF report — ₹99"}
            </button>
          )}
        </div>
      )}
      {!reportUnlocked && (
        <div className="my-6 rounded-[10px] border border-[#fde68a] bg-[#fef7ed] p-5">
          <h3 className="text-[20px] font-bold text-[#6b4423]">Unlock full report</h3>
          <p className="mb-4 mt-0 text-[14px] text-[#5c4033]">{leadGateText}</p>
          <div className="mb-3 flex max-w-[320px] flex-col gap-[10px]">
            <input
              type="email"
              placeholder="Enter your email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className="rounded-[8px] border border-[#e8ddd0] px-[14px] py-[10px] text-[15px] focus:border-[#6b4423] focus:outline-none"
            />
            <button
              type="button"
              onClick={onUnlock}
              disabled={unlockLoading}
              className={brownButtonClass}
            >
              {unlockLoading ? "Unlocking…" : "Get full report"}
            </button>
          </div>
          <p className="m-0 text-[12px] text-[#6b5b52]">
            We use your email only to send this report. No spam.
          </p>
        </div>
      )}
    </>
  );
}

export default function CompatibilityPage() {
  const router = useRouter();
  const token = useSelector(selectToken);
  const [loading, setLoading] = useState(false);
  const [calculationType, setCalculationType] = useState<"guna-milan" | "marriage">("guna-milan");
  const [gunaMilanResult, setGunaMilanResult] = useState<GunaMilanResponse | null>(null);
  const [marriageResult, setMarriageResult] = useState<MarriageCompatibilityResponse | null>(null);
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unknownTime1, setUnknownTime1] = useState(false);
  const [unknownTime2, setUnknownTime2] = useState(false);
  const [reportPaying, setReportPaying] = useState(false);
  const [reportDownload, setReportDownload] = useState<GenerateReportResponse | null>(null);
  const [selectedGunaIndex, setSelectedGunaIndex] = useState<number | null>(null);
  const [partner1Prefilled, setPartner1Prefilled] = useState(false);
  const [partner1, setPartner1] = useState<PartnerFormData>({
    name: "",
    gender: "",
    year: new Date().getFullYear() - 25,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    birthPlace: "",
    latitude: 28.6139,
    longitude: 77.209,
  });
  const [partner2, setPartner2] = useState<PartnerFormData>({
    name: "",
    gender: "",
    year: new Date().getFullYear() - 23,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    birthPlace: "",
    latitude: 28.6139,
    longitude: 77.209,
  });

  useEffect(() => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3 || partner1Prefilled) {
      return;
    }
    getUserDetails(t)
      .then((res) => {
        const data = res as UserDetailsResponse;
        const dob = data?.dob;
        const birthPlace = data?.birthPlace ?? "";
        const birthTime = data?.birthTime ?? "12:00:00";
        const name = data?.user?.name ?? data?.name ?? "";
        if (!dob || !birthPlace) {
          return;
        }
        const d = new Date(dob);
        if (isNaN(d.getTime())) {
          return;
        }
        const [h = 12, m = 0] = birthTime.split(":").map(Number);
        setPartner1({
          name: typeof name === "string" ? name : "",
          gender: "",
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate(),
          hour: h,
          minute: m,
          birthPlace,
          latitude: 28.6139,
          longitude: 77.209,
        });
        setPartner1Prefilled(true);
        astroApi
          .getGeocode(birthPlace)
          .then((geo) =>
            setPartner1((prev) => ({
              ...prev,
              latitude: geo.lat,
              longitude: geo.lng,
            })),
          )
          .catch((err) => {
            console.error("Geocode lookup failed for Partner 1:", err);
            showWarning(
              "Could not detect coordinates for this location. Using default coordinates.",
            );
          });
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("Cannot reach the server") || msg.includes("Network error")) {
          showError(msg);
        }
      });
  }, [partner1Prefilled, token]);

  const handlePartner1Change = (field: keyof PartnerFormData, value: string | number) => {
    const updated = { ...partner1, [field]: value };
    if (field === "birthPlace" && typeof value === "string") {
      updated.latitude = 28.6139;
      updated.longitude = 77.209;
      setPartner1(updated);
      astroApi
        .getGeocode(value)
        .then((geo) =>
          setPartner1((prev) => ({
            ...prev,
            latitude: geo.lat,
            longitude: geo.lng,
          })),
        )
        .catch((err) => {
          console.error("Geocode lookup failed for Partner 1:", err);
          showWarning("Location could not be resolved. Default coordinates will be used.");
        });
      return;
    }
    setPartner1(updated);
  };

  const handlePartner2Change = (field: keyof PartnerFormData, value: string | number) => {
    const updated = { ...partner2, [field]: value };
    if (field === "birthPlace" && typeof value === "string") {
      updated.latitude = 28.6139;
      updated.longitude = 77.209;
      setPartner2(updated);
      astroApi
        .getGeocode(value)
        .then((geo) =>
          setPartner2((prev) => ({
            ...prev,
            latitude: geo.lat,
            longitude: geo.lng,
          })),
        )
        .catch((err) => {
          console.error("Geocode lookup failed for Partner 2:", err);
          showWarning("Location could not be resolved. Default coordinates will be used.");
        });
      return;
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
    partner1: {
      year: partner1.year,
      month: partner1.month,
      day: partner1.day,
      hour: unknownTime1 ? 12 : partner1.hour,
      minute: unknownTime1 ? 0 : partner1.minute,
      latitude: partner1.latitude,
      longitude: partner1.longitude,
      birthPlace: partner1.birthPlace,
    },
    partner2: {
      year: partner2.year,
      month: partner2.month,
      day: partner2.day,
      hour: unknownTime2 ? 12 : partner2.hour,
      minute: unknownTime2 ? 0 : partner2.minute,
      latitude: partner2.latitude,
      longitude: partner2.longitude,
      birthPlace: partner2.birthPlace,
    },
  };

  const calculateGunaMilan = async () => {
    if (!validateForm()) {
      return;
    }
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
      setReportUnlocked(!!useAuth);
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
    if (!validateForm()) {
      return;
    }
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
      setReportUnlocked(!!useAuth);
      showSuccess("Marriage compatibility calculated successfully!");
    } catch (err) {
      const error = err as { message?: string };
      showError(error.message || "Failed to calculate marriage compatibility");
      console.error("Error calculating marriage compatibility:", err);
    } finally {
      setLoading(false);
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
    setTimeout(() => {
      setReportUnlocked(true);
      setUnlockLoading(false);
      showSuccess("Full report unlocked!");
    }, 800);
  };

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
      if (!window.Razorpay) {
        showError("Payment gateway could not be loaded. Try again.");
        return;
      }
      const options: RazorpayOptions = {
        key: res.keyId,
        amount: res.amount,
        currency: res.currency,
        order_id: res.orderId,
        name: "Astro",
        description: "Compatibility PDF Report — ₹99",
        handler: async (response: RazorpayHandlerPayload) => {
          try {
            await paymentApi.verify(
              t,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            const report = await reportsApi.purchaseOneTime(
              t,
              "compatibility_summary",
              getCompatibilityPartnersForReport(),
            );
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

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <PageHeader onBack={() => router.back()} />
          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              Match Horoscope (Compatibility)
            </h1>

            <div className="mb-[30px] rounded-[12px] bg-white p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="mb-[30px] flex gap-[10px] border-b-[2px] border-b-[#e5e7eb]">
                <button
                  className={
                    calculationType === "guna-milan"
                      ? `${tabBaseClass} border-b-[3px] border-b-[#6b4423] text-[#6b4423]`
                      : `${tabBaseClass} border-b-[3px] border-b-transparent text-[#6b7280] hover:text-[#6b4423]`
                  }
                  onClick={() => {
                    setCalculationType("guna-milan");
                    setGunaMilanResult(null);
                    setMarriageResult(null);
                    setReportUnlocked(false);
                    setUnknownTime1(false);
                    setUnknownTime2(false);
                  }}
                >
                  Guna Milan
                </button>
                <button
                  className={
                    calculationType === "marriage"
                      ? `${tabBaseClass} border-b-[3px] border-b-[#6b4423] text-[#6b4423]`
                      : `${tabBaseClass} border-b-[3px] border-b-transparent text-[#6b7280] hover:text-[#6b4423]`
                  }
                  onClick={() => {
                    setCalculationType("marriage");
                    setGunaMilanResult(null);
                    setMarriageResult(null);
                    setReportUnlocked(false);
                    setUnknownTime1(false);
                    setUnknownTime2(false);
                  }}
                >
                  Full Marriage Compatibility
                </button>
              </div>

              <div className="mb-[30px] grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-[30px]">
                <div className={partnerCardClass}>
                  <h3 className="mb-5 border-b-[2px] border-b-[#e8ddd0] pb-[10px] text-[18px] font-semibold text-[#6b4423]">
                    Partner 1
                  </h3>
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Name (Optional)</label>
                      <input
                        type="text"
                        value={partner1.name}
                        onChange={(e) => handlePartner1Change("name", e.target.value)}
                        placeholder="Partner 1 name"
                        className="rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                      />
                    </div>
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Gender (Optional)</label>
                      <select
                        value={partner1.gender}
                        onChange={(e) =>
                          handlePartner1Change("gender", e.target.value as PartnerGender)
                        }
                        className="formSelect"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <p className="m-0 text-[12px] text-[#6b5b52]">
                        Partners must have different genders for match.
                      </p>
                    </div>
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Birth place *</label>
                      <PlaceAutocomplete
                        value={partner1.birthPlace}
                        onChange={(v) => handlePartner1Change("birthPlace", v)}
                        placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                        required
                        aria-label="Partner 1 birth place"
                      />
                      <p className="m-0 text-[12px] text-[#6b5b52]">
                        City, town or village — start typing for suggestions worldwide.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Date of Birth *</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={partner1.year}
                          onChange={(e) =>
                            handlePartner1Change("year", parseInt(e.target.value, 10) || 1990)
                          }
                          placeholder="Year"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                        <input
                          type="number"
                          value={partner1.month}
                          onChange={(e) =>
                            handlePartner1Change("month", parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Month"
                          min="1"
                          max="12"
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                        <input
                          type="number"
                          value={partner1.day}
                          onChange={(e) =>
                            handlePartner1Change("day", parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Day"
                          min="1"
                          max="31"
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                      </div>
                    </div>
                    <div className={inputGroupClass}>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <label className={fieldLabelClass}>Birth Time (Optional)</label>
                        <button
                          type="button"
                          onClick={() => setUnknownTime1((p) => !p)}
                          className={
                            unknownTime1
                              ? "rounded-[8px] border border-[#b47b45] bg-[#e8d0a9] px-3 py-[6px] text-[12px] font-semibold text-[#5a3d2b]"
                              : "rounded-[8px] border border-[#d9c3a1] bg-[#f5e6d3] px-3 py-[6px] text-[12px] text-[#5a3d2b] transition-colors duration-200 hover:bg-[#ebd4b8]"
                          }
                          aria-pressed={unknownTime1}
                        >
                          {unknownTime1 ? "✓ I don't know" : "I don't know birth time"}
                        </button>
                      </div>
                      {!unknownTime1 && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={partner1.hour}
                            onChange={(e) =>
                              handlePartner1Change("hour", parseInt(e.target.value, 10) || 12)
                            }
                            placeholder="Hour"
                            min="0"
                            max="23"
                            className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                          />
                          <input
                            type="number"
                            value={partner1.minute}
                            onChange={(e) =>
                              handlePartner1Change("minute", parseInt(e.target.value, 10) || 0)
                            }
                            placeholder="Minute"
                            min="0"
                            max="59"
                            className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                          />
                        </div>
                      )}
                      {unknownTime1 && (
                        <p className="m-0 text-[12px] text-[#6b5b52]">
                          Noon (12:00) will be used. Lagna may be approximate.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={partnerCardClass}>
                  <h3 className="mb-5 border-b-[2px] border-b-[#e8ddd0] pb-[10px] text-[18px] font-semibold text-[#6b4423]">
                    Partner 2
                  </h3>
                  <div className="mb-[15px] grid grid-cols-2 gap-[15px]">
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Name (Optional)</label>
                      <input
                        type="text"
                        value={partner2.name}
                        onChange={(e) => handlePartner2Change("name", e.target.value)}
                        placeholder="Partner 2 name"
                        className="rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                      />
                    </div>
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Gender (Optional)</label>
                      <select
                        value={partner2.gender}
                        onChange={(e) =>
                          handlePartner2Change("gender", e.target.value as PartnerGender)
                        }
                        className="formSelect"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <p className="m-0 text-[12px] text-[#6b5b52]">
                        Partners must have different genders for match.
                      </p>
                    </div>
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Birth place *</label>
                      <PlaceAutocomplete
                        value={partner2.birthPlace}
                        onChange={(v) => handlePartner2Change("birthPlace", v)}
                        placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                        required
                        aria-label="Partner 2 birth place"
                      />
                      <p className="m-0 text-[12px] text-[#6b5b52]">
                        Start typing to see city suggestions. Unrecognized names fall back to Delhi.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-[15px]">
                    <div className={inputGroupClass}>
                      <label className={fieldLabelClass}>Date of Birth *</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={partner2.year}
                          onChange={(e) =>
                            handlePartner2Change("year", parseInt(e.target.value, 10) || 1990)
                          }
                          placeholder="Year"
                          min="1900"
                          max={new Date().getFullYear()}
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                        <input
                          type="number"
                          value={partner2.month}
                          onChange={(e) =>
                            handlePartner2Change("month", parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Month"
                          min="1"
                          max="12"
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                        <input
                          type="number"
                          value={partner2.day}
                          onChange={(e) =>
                            handlePartner2Change("day", parseInt(e.target.value, 10) || 1)
                          }
                          placeholder="Day"
                          min="1"
                          max="31"
                          className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                        />
                      </div>
                    </div>
                    <div className={inputGroupClass}>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <label className={fieldLabelClass}>Birth Time (Optional)</label>
                        <button
                          type="button"
                          onClick={() => setUnknownTime2((p) => !p)}
                          className={
                            unknownTime2
                              ? "rounded-[8px] border border-[#b47b45] bg-[#e8d0a9] px-3 py-[6px] text-[12px] font-semibold text-[#5a3d2b]"
                              : "rounded-[8px] border border-[#d9c3a1] bg-[#f5e6d3] px-3 py-[6px] text-[12px] text-[#5a3d2b] transition-colors duration-200 hover:bg-[#ebd4b8]"
                          }
                          aria-pressed={unknownTime2}
                        >
                          {unknownTime2 ? "✓ I don't know" : "I don't know birth time"}
                        </button>
                      </div>
                      {!unknownTime2 && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={partner2.hour}
                            onChange={(e) =>
                              handlePartner2Change("hour", parseInt(e.target.value, 10) || 12)
                            }
                            placeholder="Hour"
                            min="0"
                            max="23"
                            className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                          />
                          <input
                            type="number"
                            value={partner2.minute}
                            onChange={(e) =>
                              handlePartner2Change("minute", parseInt(e.target.value, 10) || 0)
                            }
                            placeholder="Minute"
                            min="0"
                            max="59"
                            className="flex-1 rounded-[6px] border border-[#d1d5db] p-[10px] text-[14px]"
                          />
                        </div>
                      )}
                      {unknownTime2 && (
                        <p className="m-0 text-[12px] text-[#6b5b52]">
                          Noon (12:00) will be used. Lagna may be approximate.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 text-center">
                <button
                  onClick={
                    calculationType === "guna-milan" ? calculateGunaMilan : calculateMarriage
                  }
                  disabled={loading}
                  className={brownButtonClass}
                >
                  {loading
                    ? "Calculating..."
                    : `Calculate ${calculationType === "guna-milan" ? "Guna Milan" : "Marriage Compatibility"}`}
                </button>
              </div>
            </div>

            {gunaMilanResult && (
              <div className={sectionCardClass}>
                <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                  Guna Milan Results
                </h2>
                {(!isCityRecognized(partner1.birthPlace) ||
                  !isCityRecognized(partner2.birthPlace)) && (
                  <div
                    className="mb-4 rounded-[8px] border border-[#e6c84a] bg-[#fef3cd] px-4 py-3 text-[14px] text-[#856404]"
                    role="alert"
                  >
                    We resolve city, town or village names for coordinates. For best accuracy, pick
                    a suggestion or enter the full place (e.g. City, State, Country).
                  </div>
                )}

                <div className="text-center">
                  <div className="mx-auto my-[15px] inline-block rounded-[25px] bg-[#ffe6ec] px-5 py-[10px] text-[20px] font-semibold text-[#333]">
                    {partner1.name || "Person 1"} ❤️ {partner2.name || "Person 2"}
                  </div>
                </div>

                <div className="px-5 py-[30px] text-center">
                  <div className="relative mx-auto my-[30px] w-[200px] animate-pulse">
                    <svg viewBox="0 0 512 512" className="w-full fill-[#f796a8]">
                      <path d="M471.7 73.1c-54.5-46.4-136-38.3-186.4 13.7L256 116.6l-29.3-29.8C176.3 34.8 94.8 26.7 40.3 73.1-23.6 127.4-10.6 230.8 43 284.3l193.5 199.8c10.5 10.9 27.5 10.9 38 0L469 284.3c53.6-53.5 66.6-156.9 2.7-211.2z" />
                    </svg>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] text-[38px] font-bold text-white">
                      {gunaMilanResult.totalScore}/{gunaMilanResult.maxScore}
                    </div>
                  </div>
                  <h2 className="mt-[10px] text-[28px] font-bold">{gunaMilanResult.verdict}</h2>
                  <div className="mt-[15px] flex flex-wrap justify-center gap-[10px]">
                    {gunaMilanResult.gunas
                      .filter((g) => g.score === g.maxScore)
                      .map((guna, i) => (
                        <span
                          key={i}
                          className="rounded-[20px] bg-[#ffe4ec] px-[14px] py-2 text-[14px] text-[#d63384]"
                        >
                          ✨ {guna.name}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="mb-5 text-[22px] font-semibold">Compatibility Parameters</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {gunaMilanResult.gunas.map((guna, index) => (
                      <div
                        key={index}
                        className="cursor-pointer rounded-[16px] bg-white p-5 shadow-[0_4px_10px_rgba(0,0,0,0.05)]"
                        onClick={() => setSelectedGunaIndex(index)}
                      >
                        <div className="mb-[10px] flex items-center justify-between">
                          <span className="text-[18px] font-semibold">
                            {guna.score}/{guna.maxScore}
                          </span>
                        </div>
                        <h4 className="text-[18px] font-semibold text-[#1f2937]">{guna.name}</h4>
                        {guna.parameterMeaning && (
                          <p
                            className="mb-0 mt-[6px] text-[12px] leading-[1.35] text-[#555]"
                            title={guna.parameterMeaning}
                          >
                            {guna.parameterMeaning.slice(0, 80)}
                            {guna.parameterMeaning.length > 80 ? "…" : ""}
                          </p>
                        )}
                        <progress
                          value={guna.score}
                          max={guna.maxScore}
                          className="mt-[10px] h-[6px] w-full overflow-hidden rounded-[6px] [&::-webkit-progress-bar]:bg-[#eee] [&::-webkit-progress-value]:rounded-[6px] [&::-webkit-progress-value]:bg-[#ff6b9d] [&::-moz-progress-bar]:bg-[#ff6b9d]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {selectedGunaIndex !== null && (
                  <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
                    <div className="relative w-[90%] max-w-[450px] rounded-[12px] bg-[rgb(220,199,214)] p-[30px] text-center">
                      <button
                        className="absolute right-[10px] top-[10px] border-none bg-transparent text-[20px]"
                        onClick={() => setSelectedGunaIndex(null)}
                      >
                        ✕
                      </button>
                      <h2 className="text-[24px] font-bold">
                        {gunaMilanResult.gunas[selectedGunaIndex].name}
                      </h2>
                      <p className="font-bold">
                        Score: {gunaMilanResult.gunas[selectedGunaIndex].score}/
                        {gunaMilanResult.gunas[selectedGunaIndex].maxScore}
                      </p>
                      {gunaMilanResult.gunas[selectedGunaIndex].parameterMeaning && (
                        <p className="mb-3 text-[14px] leading-[1.6] text-[#6b7280]">
                          {gunaMilanResult.gunas[selectedGunaIndex].parameterMeaning}
                        </p>
                      )}
                      <p>{gunaMilanResult.gunas[selectedGunaIndex].description}</p>
                      <div className="mt-5 flex justify-between">
                        <button
                          disabled={selectedGunaIndex === 0}
                          onClick={() => setSelectedGunaIndex((i) => i! - 1)}
                        >
                          ← Previous
                        </button>
                        <button
                          disabled={selectedGunaIndex === gunaMilanResult.gunas.length - 1}
                          onClick={() => setSelectedGunaIndex((i) => i! + 1)}
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <ResultActions
                  token={token}
                  reportDownload={reportDownload}
                  reportPaying={reportPaying}
                  onGetPdfReport={handleGetPdfReport}
                  reportUnlocked={reportUnlocked}
                  leadEmail={leadEmail}
                  setLeadEmail={setLeadEmail}
                  unlockLoading={unlockLoading}
                  onUnlock={handleUnlock}
                  leadGateText="See detailed guna-wise breakdown and descriptions."
                  onShareWhatsApp={handleShareWhatsApp}
                />
              </div>
            )}

            {marriageResult && (
              <div className={sectionCardClass}>
                <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                  Marriage Compatibility Results
                </h2>
                {(!isCityRecognized(partner1.birthPlace) ||
                  !isCityRecognized(partner2.birthPlace)) && (
                  <div
                    className="mb-4 rounded-[8px] border border-[#e6c84a] bg-[#fef3cd] px-4 py-3 text-[14px] text-[#856404]"
                    role="alert"
                  >
                    We resolve city, town or village names for coordinates. For best accuracy, pick
                    a suggestion or enter the full place (e.g. City, State, Country).
                  </div>
                )}
                <div className="mb-[30px]">
                  <div className="mx-auto max-w-[500px] rounded-[12px] border border-[#e8ddd0] bg-[linear-gradient(135deg,#f5ebe0_0%,#ede4d8_100%)] p-[30px] text-center">
                    <h3 className="text-[20px] font-bold text-[#6b4423]">Guna Milan Score</h3>
                    <p className="my-[10px] text-[2rem] font-semibold text-[#6b4423]">
                      {marriageResult.gunaMilan.totalScore} / {marriageResult.gunaMilan.maxScore}
                    </p>
                    <p
                      className={`m-0 text-[1.25rem] font-bold ${getVerdictColorClass(marriageResult.gunaMilan.verdict)}`}
                    >
                      {marriageResult.gunaMilan.percentage}% - {marriageResult.gunaMilan.verdict}
                    </p>
                  </div>
                </div>

                <ResultActions
                  token={token}
                  reportDownload={reportDownload}
                  reportPaying={reportPaying}
                  onGetPdfReport={handleGetPdfReport}
                  reportUnlocked={reportUnlocked}
                  leadEmail={leadEmail}
                  setLeadEmail={setLeadEmail}
                  unlockLoading={unlockLoading}
                  onUnlock={handleUnlock}
                  leadGateText="See doshas (Manglik, Nadi, Bhakoot), strengths, challenges, remedies and overall verdict."
                  onShareWhatsApp={handleShareWhatsApp}
                />

                {reportUnlocked && (
                  <>
                    <div className="my-[30px] rounded-[8px] bg-[#f9fafb] p-5">
                      <h3 className="text-[20px] font-bold text-[#6b4423]">Dosha Compatibility</h3>
                      <div className="mt-[15px] flex flex-col gap-3">
                        <div className="rounded-[6px] bg-white p-[10px] text-[14px] text-[#374151]">
                          <strong>Manglik:</strong> {marriageResult.doshas.manglik}
                        </div>
                        <div className="rounded-[6px] bg-white p-[10px] text-[14px] text-[#374151]">
                          <strong>Nadi:</strong> {marriageResult.doshas.nadi}
                        </div>
                        <div className="rounded-[6px] bg-white p-[10px] text-[14px] text-[#374151]">
                          <strong>Bhakoot:</strong> {marriageResult.doshas.bhakoot}
                        </div>
                      </div>
                    </div>

                    <div className="my-6 rounded-[8px] border-l-[4px] border-l-[#b45309] bg-[#fef7ed] p-5">
                      <h3 className="text-[20px] font-bold text-[#6b4423]">Manglik impact</h3>
                      <p className="mb-3 mt-0 text-[14px] leading-[1.6] text-[#374151]">
                        {marriageResult.doshas.manglik.toLowerCase().includes("cancel")
                          ? "When both partners are Manglik, the dosha is considered cancelled — no additional remedies are required for Manglik in this match."
                          : marriageResult.doshas.manglik.toLowerCase().includes("remed")
                            ? "Manglik dosha is present in this match. Simple remedies can help. Below are commonly suggested practices (for guidance only; consult an expert for personalised advice)."
                            : "Manglik status has been considered in the overall compatibility above."}
                      </p>
                      {marriageResult.doshas.manglik.toLowerCase().includes("remed") && (
                        <ul className="m-0 list-none p-0">
                          <li className="border-b border-b-[#fde68a] py-2 text-[14px] leading-[1.5] text-[#4b5563]">
                            <strong>Tuesday fasting:</strong> Observe a simple fast on Tuesdays, or
                            avoid non-veg and alcohol.
                          </li>
                          <li className="border-b border-b-[#fde68a] py-2 text-[14px] leading-[1.5] text-[#4b5563]">
                            <strong>Hanuman mantra:</strong> Chant “Om Hanumate Namah” or “Hanuman
                            Chalisa” regularly for strength and calm.
                          </li>
                          <li className="py-2 text-[14px] leading-[1.5] text-[#4b5563]">
                            <strong>Donation:</strong> Donate red items (e.g. cloth, lentils) or
                            offer at Hanuman temple on Tuesdays.
                          </li>
                        </ul>
                      )}
                    </div>

                    {marriageResult.strengths.length > 0 && (
                      <div className="my-5 rounded-[8px] bg-[#f9fafb] p-5">
                        <h3 className="text-[20px] font-bold text-[#10b981]">Strengths</h3>
                        <ul className="m-0 mt-[15px] list-none p-0">
                          {marriageResult.strengths.map((strength, index) => (
                            <li
                              key={index}
                              className="mb-2 rounded-[6px] border-l-[4px] border-l-[#10b981] bg-white p-[10px] text-[14px] text-[#374151]"
                            >
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {marriageResult.challenges.length > 0 && (
                      <div className="my-5 rounded-[8px] bg-[#f9fafb] p-5">
                        <h3 className="text-[20px] font-bold text-[#dc2626]">Challenges</h3>
                        <ul className="m-0 mt-[15px] list-none p-0">
                          {marriageResult.challenges.map((challenge, index) => (
                            <li
                              key={index}
                              className="mb-2 rounded-[6px] border-l-[4px] border-l-[#6b4423] bg-white p-[10px] text-[14px] text-[#374151]"
                            >
                              {challenge}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-[30px] rounded-[8px] border border-[#e8ddd0] bg-[linear-gradient(135deg,#f5ebe0_0%,#ede4d8_100%)] p-5 text-center">
                      <h3 className="text-[20px] font-bold text-[#6b4423]">Overall Verdict</h3>
                      <p className="mt-[10px] text-[16px] leading-[1.8] text-[#1f2937]">
                        {marriageResult.overallVerdict}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
