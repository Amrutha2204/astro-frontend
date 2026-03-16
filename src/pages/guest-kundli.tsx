import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { astroApi, KundliResponse, CHART_OPTIONS } from "@/services/api";
import { onboardGuest } from "@/services/authService";
import { showError } from "@/utils/toast";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import TimePickerField from "@/components/ui/TimePickerField";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import styles from "@/styles/guestKundli.module.css";
import formStyles from "@/styles/birthDetails.module.css";
import dStyles from "@/styles/dashboard.module.css";
import Loading from "@/components/ui/Loading";

const SESSION_KEY = "guestKundli";

type GuestSession = {
  birthDetails: {
    name?: string;
    gender?: "male" | "female";
    dob: string;
    birthTime: string;
    placeOfBirth: string;
    unknownTime?: boolean;
  };
  kundli: KundliResponse;
  chartSelection?: string;
};

function getStored(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as GuestSession) : null;
  } catch {
    return null;
  }
}

function setStored(data: GuestSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearStored() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

function CreateAccountButton({
  birthDetails,
  router,
}: {
  birthDetails: { name?: string; dob: string; birthTime: string; placeOfBirth: string; unknownTime?: boolean };
  router: ReturnType<typeof useRouter>;
}) {
  const [linking, setLinking] = useState(false);
  const handleCreate = async () => {
    setLinking(true);
    try {
      const res = await onboardGuest({
        name: birthDetails.name?.trim() || "Guest",
        dob: birthDetails.dob,
        birthPlace: birthDetails.placeOfBirth,
        birthTime: birthDetails.unknownTime ? "12:00:00" : birthDetails.birthTime,
      });
      router.push(`/auth/register?guestId=${encodeURIComponent(res.guestId)}`);
    } catch {
      showError("Could not link your Kundli. You can enter birth details on the next page.");
      router.push("/auth/register");
    } finally {
      setLinking(false);
    }
  };
  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={linking}
      className="bg-transparent border-none text-amber-900 underline cursor-pointer disabled:cursor-wait"
    >
      {linking ? "Linking…" : "Create an account"}
    </button>
  );
}

export default function GuestKundliPage() {
  const router = useRouter();
  const [stored, setStoredState] = useState<GuestSession | null>(null);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [dob, setDob] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [birthTime, setBirthTime] = useState("");

  const renderHouseBox = (houseNumber: number) => {
  if (!stored?.kundli?.planetaryPositions || !stored?.kundli?.houses) return null;

  const houseSign = stored.kundli.houses.find(
    (h: any) => h.house === houseNumber
  )?.sign;

  const planetsInHouse = stored.kundli.planetaryPositions.filter(
    (p: any) => p.sign === houseSign
  );

  return (
    <div className={dStyles.house}>
      <div className={dStyles.houseNumber}>{houseNumber}</div>

      <div className={dStyles.houseContent}>
        {planetsInHouse.map((p: any, i: number) => (
          <div key={i} className={dStyles.planetText}>
            {p.planet.slice(0, 2)}{" "}
            {p.degree != null ? p.degree.toFixed(0) + "°" : ""}
            {p.retrograde ? " *" : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

  const [unknownTime, setUnknownTime] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  const [chartSelection, setChartSelection] = useState<string>("lagna");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStoredState(getStored());
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine day, month, year into ISO 8601 format (yyyy-mm-dd)
    const dateOfBirth = day && month && year 
      ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : dob;
    
    if (!dateOfBirth.trim() || !placeOfBirth.trim()) {
      setError("Please fill Date of Birth and Place of Birth.");
      return;
    }
    if (!unknownTime && !birthTime.trim()) {
      setError("Please enter birth time or select \"I don't know my birth time\".");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const kundli = await astroApi.getGuestKundli({
        dob: dateOfBirth.trim(),
        birthTime: unknownTime ? undefined : birthTime.trim(),
        placeOfBirth: placeOfBirth.trim(),
        unknownTime: unknownTime || undefined,
        chart: chartSelection,
      });
      const session: GuestSession = {
        birthDetails: {
          name: name.trim() || undefined,
          gender: gender || undefined,
          dob: dateOfBirth.trim(),
          birthTime: unknownTime ? "12:00:00" : birthTime.trim(),
          placeOfBirth: placeOfBirth.trim(),
          unknownTime: unknownTime || undefined,
        },
        kundli,
        chartSelection,
      };
      setStored(session);
      setStoredState(session);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to calculate Kundli.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateNew = () => {
    clearStored();
    setStoredState(null);
    setError(null);
    setName("");
    setGender("");
    setDob("");
    setDay("");
    setMonth("");
    setYear("");
    setBirthTime("");
    setUnknownTime(false);
    setPlaceOfBirth("");
  };

  const handleChartChange = async (newChart: string) => {
    const details = stored?.birthDetails;
    if (!details) return;
    setLoading(true);
    setError(null);
    try {
      const kundli = await astroApi.getGuestKundli({
        dob: details.dob,
        birthTime: details.unknownTime ? undefined : details.birthTime,
        placeOfBirth: details.placeOfBirth,
        unknownTime: details.unknownTime,
        chart: newChart,
      });
      const next: GuestSession = { ...stored, kundli, chartSelection: newChart };
      setStored(next);
      setStoredState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart.");
    } finally {
      setLoading(false);
    }
  };

  const k = stored?.kundli;
  const b = stored?.birthDetails;
  const currentChartSelection = stored?.chartSelection ?? "lagna";
  const isWestern = currentChartSelection === "western";

  const mainContent = !mounted ? (
    <div className={styles.loadingWrap}>
      <Loading text="Loading..." variant="page" />
    </div>
  ) : stored && k && b ? (
    <div className={styles.resultWrapper}>
            <button type="button" className={styles.calculateNewBtn} onClick={handleCalculateNew}>
              Enter different details
            </button>
            <div className={dStyles.kundliContainer}>
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h1 className={dStyles.pageTitle}>
                  {b.name
                    ? `Kundli for ${b.name}${b.gender ? ` (${b.gender === "male" ? "Male" : "Female"})` : ""}`
                    : "Your Kundli"}
                </h1>
                <label
  className={`${dStyles.infoLabel} flex items-center gap-2`}
>
                  <span>Chart:</span>
                  <select
                    value={currentChartSelection}
                    onChange={(e) => handleChartChange(e.target.value)}
                    className={`formSelect formSelectInline ${dStyles.chartSelect}`}
                    disabled={loading}
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
              {loading && (
                <div className={dStyles.chartUpdatingBar}>
                  <Loading text="Loading chart..." variant="inline" />
                </div>
              )}
              <div className={dStyles.kundliContent}>
                <div className={dStyles.kundliSection}>
                  <h2 className={dStyles.sectionTitle}>{k.chartLabel || (isWestern ? "Chart overview (Western)" : "Chart overview")}</h2>
                  <div className={dStyles.infoGrid}>
                    <div className={dStyles.infoItem}>
                      <span className={dStyles.infoLabel}>{isWestern ? "Ascendant:" : "Lagna (Ascendant):"}</span>
                      <span className={dStyles.infoValue}>{k.lagna || "N/A"}</span>
                    </div>
                    <div className={dStyles.infoItem}>
                      <span className={dStyles.infoLabel}>Moon Sign:</span>
                      <span className={dStyles.infoValue}>{k.moonSign || "N/A"}</span>
                    </div>
                    {!isWestern && (
                      <>
                        <div className={dStyles.infoItem}>
                          <span className={dStyles.infoLabel}>Nakshatra:</span>
                          <span className={dStyles.infoValue}>{k.nakshatra || "N/A"}</span>
                        </div>
                        {k.pada != null && (
                          <div className={dStyles.infoItem}>
                            <span className={dStyles.infoLabel}>Pada:</span>
                            <span className={dStyles.infoValue}>{k.pada}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {k.planetaryPositions && Array.isArray(k.planetaryPositions) && k.planetaryPositions.length > 0 && (
                  <div className={dStyles.kundliSection}>
                    <h2 className={dStyles.sectionTitle}>Kundli Chart</h2>
                    <p className={dStyles.chartLegend}>* = retrograde</p>
                    <div className={dStyles.chartWrapper}>
                      <div className={dStyles.kundaliChart}>
                        <div className={dStyles.centerWatermark}>ॐ</div>
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

                {k.planetaryPositions && Array.isArray(k.planetaryPositions) && k.planetaryPositions.length > 0 && (
                  <div className={dStyles.kundliSection}>
                    <h2 className={dStyles.sectionTitle}>Planet positions</h2>
                    <p className={dStyles.chartLegend}>* = retrograde</p>
                    <div className="grid gap-3 mt-4 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
                      {k.planetaryPositions.map((planetData) => (
                        <div
  key={planetData.planet}
  className="p-3 rounded-lg border border-[rgba(180,123,69,0.2)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)]"
>
                          <div className="text-sm font-bold text-[#6b4423]">
                            {planetData.planet}
                            {planetData.retrograde ? " *" : ""}
                          </div>
                          <div className="text-[13px] text-[#8b5e34] mt-1">{planetData.sign}</div>
                          {typeof planetData.degree === "number" && (
                            <div className="text-xs text-[#6b5b52] mt-[2px]">
                              {planetData.degree.toFixed(2)}°
                            </div>
                          )}
                          {planetData.nakshatra && (
                            <div className="text-xs text-[#8b5e34] mt-[2px]">
                              {planetData.nakshatra}
                              {planetData.pada ? ` - Pada ${planetData.pada}` : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {b.unknownTime && (
                  <p className={styles.unknownTimeNote}>Birth time was not provided; noon (12:00) was used for this chart. Lagna and house positions may be approximate.</p>
                )}
                <CalculationInfo showDasha={true} showAyanamsa={true} className={dStyles.calculationInfo} />
                <TrustNote variant="guest" showAccuracyTip />
                <div className={dStyles.sourceInfo}>
                  <span className={dStyles.sourceLabel}>Source:</span>
                  <span className={dStyles.sourceValue}>{k.source}</span>
                </div>
              </div>
            </div>
            <p className={styles.guestNote}>
              We do not keep any record of your birth details. This Kundli is stored only in this browser session (sessionStorage) and will be cleared when you close the tab.{" "}
              <CreateAccountButton birthDetails={b} router={router} />
              {" "}to save your birth details and access your Kundli anytime.
            </p>
    </div>
  ) : (
    <div className="flex items-center justify-center p-6">
      <div className={`${formStyles.card} w-full max-w-[440px]`}>
          <h2 className={formStyles.title}>Free Kundli (Guest)</h2>
          <p className={formStyles.subtitle}>
            Enter birth details. No login required. We do not store or keep any record — your Kundli is held only in this browser session (sessionStorage) and is cleared when you close the tab.
          </p>

          <form onSubmit={handleSubmit}>
            <label className={formStyles.label}>Full name (optional)</label>
            <input
              type="text"
              className={formStyles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />

            <label className={formStyles.label}>Gender (optional)</label>
            <select
              className={`${formStyles.input} formSelect`}
              value={gender}
              onChange={(e) => setGender((e.target.value || "") as "male" | "female" | "")}
            >
              <option value="">— Select —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <label className={formStyles.label}>Birth date *</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label style={{ fontSize: "12px", color: "#6b5b52", fontWeight: 500, marginBottom: "4px", display: "block" }}>Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className={formStyles.input}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="01"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#6b5b52] font-medium mb-1 block">Month</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className={formStyles.input}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="01"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#6b5b52", fontWeight: 500, marginBottom: "4px", display: "block" }}>Year</label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  className={formStyles.input}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="1990"
                  required
                />
              </div>
            </div>

            <div className={styles.timeRow}>
              <label className={`${formStyles.label} ${styles.timeRowLabel}`}>Birth time {unknownTime ? "" : "*"}</label>
              <button
                type="button"
                className={styles.unknownTimeBtn}
                onClick={() => {
                  setUnknownTime((prev) => {
                    if (!prev) setBirthTime("12:00");
                    return !prev;
                  });
                }}
                aria-pressed={unknownTime}
              >
                {unknownTime ? "✓ I don't know my birth time" : "I don't know my birth time"}
              </button>
            </div>
            {!unknownTime && (
              <>
                <TimePickerField
  value={birthTime}
  onChange={setBirthTime}
  placeholder="--:--:--"
  step={1}
  required
  aria-label="Birth time"
/>
<p className={formStyles.hint}>
  Enter birth time (HH:MM:SS). Seconds are optional but improve accuracy.
</p>
              </>
            )}
            {unknownTime && (
              <p className={formStyles.hint}>Noon (12:00) will be used — Lagna and house positions may be approximate.</p>
            )}

            <label className={formStyles.label}>Birth place (city, town or village) *</label>
            <PlaceAutocomplete
              value={placeOfBirth}
              onChange={setPlaceOfBirth}
              placeholder="e.g. Mumbai, Maharashtra, India or town/village"
              required
              aria-label="Birth place"
            />
            <p className={formStyles.hint}>Start typing for suggestions worldwide. Full place (e.g. City, State, Country) is used for accurate positions.</p>

            <label className={formStyles.label}>Chart type</label>
            <select
              className={`${formStyles.input} formSelect`}
              value={chartSelection}
              onChange={(e) => setChartSelection(e.target.value)}
              aria-label="Select chart type"
            >
              {CHART_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {error && <p className="text-amber-900 text-sm mb-3">{error}</p>}

            <button type="submit" className={formStyles.button} disabled={loading}>
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className={`${dStyles.loadingSpinner} ${dStyles.loadingSpinnerSm}`} aria-hidden />
                  Calculating…
                </span>
              ) : (
                "Get My Kundli"
              )}
            </button>
          </form>
        </div>
      </div>
  );

  return (
    <div className={dStyles.dashboardContainer}>
      <AppHeader />
      <div className={dStyles.dashboardContent}>
        <AppSidebar />
        <main className={dStyles.mainContent}>
          {mainContent}
        </main>
      </div>
    </div>
  );
}
