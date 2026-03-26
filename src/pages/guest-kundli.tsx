import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { astroApi, type KundliResponse, CHART_OPTIONS } from "@/services/api";
import { onboardGuest } from "@/services/authService";
import { showError } from "@/utils/toast";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import TimePickerField from "@/components/ui/TimePickerField";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
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

type KundliHouse = KundliResponse["houses"][number];
type KundliPlanet = KundliResponse["planetaryPositions"][number];

function getStored(): GuestSession | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as GuestSession) : null;
  } catch {
    return null;
  }
}

function setStored(data: GuestSession) {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearStored() {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(SESSION_KEY);
}

function CreateAccountButton({
  birthDetails,
  router,
}: {
  birthDetails: {
    name?: string;
    dob: string;
    birthTime: string;
    placeOfBirth: string;
    unknownTime?: boolean;
  };
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
    if (!stored?.kundli?.planetaryPositions || !stored?.kundli?.houses) {
      return null;
    }

    const houseSign = stored.kundli.houses.find((h: KundliHouse) => h.house === houseNumber)?.sign;

    const planetsInHouse = stored.kundli.planetaryPositions.filter(
      (p: KundliPlanet) => p.sign === houseSign,
    );

    return (
      <div className="relative flex items-center justify-center border border-[#e2caa6]">
        <div className="absolute left-2 top-[6px] -rotate-45 text-[11px] font-semibold text-[#b08a55]">
          {houseNumber}
        </div>
        <div className="-rotate-45 text-center text-[12px] leading-[1.4] text-[#6b4423]">
          {planetsInHouse.map((p: KundliPlanet, i: number) => (
            <div key={i} className="font-medium">
              {p.planet.slice(0, 2)} {p.degree !== null ? p.degree.toFixed(0) + "°" : ""}
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
    const dateOfBirth =
      day && month && year
        ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
        : dob;

    if (!dateOfBirth.trim() || !placeOfBirth.trim()) {
      setError("Please fill Date of Birth and Place of Birth.");
      return;
    }
    if (!unknownTime && !birthTime.trim()) {
      setError('Please enter birth time or select "I don\'t know my birth time".');
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
    if (!details) {
      return;
    }
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
    <div className="flex min-h-[280px] items-center justify-center p-10">
      <Loading text="Loading..." variant="page" />
    </div>
  ) : stored && k && b ? (
    <div className="w-full max-w-[1100px] px-5">
      <button
        type="button"
        onClick={handleCalculateNew}
        className="mb-7 rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] px-7 py-[14px] text-[15px] font-bold text-white shadow-[0_8px_24px_rgba(107,68,35,0.3)] transition-all duration-300 hover:-translate-y-[2px] hover:bg-[linear-gradient(135deg,#a67a4a_0%,#7d5a3c_100%)] hover:shadow-[0_12px_36px_rgba(107,68,35,0.4)]"
      >
        Enter different details
      </button>
      <div className="relative mx-auto max-w-[1200px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="m-0 mb-8 bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text text-[36px] font-extrabold tracking-[-0.01em] text-transparent">
            {b.name
              ? `Kundli for ${b.name}${b.gender ? ` (${b.gender === "male" ? "Male" : "Female"})` : ""}`
              : "Your Kundli"}
          </h1>
          <label className="mb-0 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
            <span>Chart:</span>
            <select
              value={currentChartSelection}
              onChange={(e) => handleChartChange(e.target.value)}
              className="formSelect formSelectInline min-w-[220px] cursor-pointer rounded-[8px] border border-[var(--border-color,#e5e7eb)] bg-[var(--bg-main)] px-3 py-2 text-[14px] text-[var(--text-main)]"
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
          <div className="mb-4 flex items-center justify-center rounded-[12px] border border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.15)_0%,rgba(212,165,116,0.15)_100%)] px-[18px] py-[14px] backdrop-blur-[8px]">
            <Loading text="Loading chart..." variant="inline" />
          </div>
        )}
        <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-10 shadow-[0_8px_32px_rgba(107,68,35,0.15)]">
          <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
            <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              {k.chartLabel || (isWestern ? "Chart overview (Western)" : "Chart overview")}
            </h2>
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[14px]">
              <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] px-5 py-[18px]">
                <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                  {isWestern ? "Ascendant:" : "Lagna (Ascendant):"}
                </span>
                <span className="text-[20px] font-bold text-[#845127]">{k.lagna || "N/A"}</span>
              </div>
              <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] px-5 py-[18px]">
                <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                  Moon Sign:
                </span>
                <span className="text-[20px] font-bold text-[#845127]">{k.moonSign || "N/A"}</span>
              </div>
              {!isWestern && (
                <>
                  <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] px-5 py-[18px]">
                    <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                      Nakshatra:
                    </span>
                    <span className="text-[20px] font-bold text-[#845127]">
                      {k.nakshatra || "N/A"}
                    </span>
                  </div>
                  {k.pada !== null && (
                    <div className="overflow-hidden rounded-[12px] border-[1.5px] border-[rgba(180,123,69,0.3)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] px-5 py-[18px]">
                      <span className="mb-[6px] block text-[12px] font-bold uppercase tracking-[0.08em] text-[#f1eeeb]">
                        Pada:
                      </span>
                      <span className="text-[20px] font-bold text-[#845127]">{k.pada}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {k.planetaryPositions &&
            Array.isArray(k.planetaryPositions) &&
            k.planetaryPositions.length > 0 && (
              <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                  Kundli Chart
                </h2>
                <p className="mb-3 mt-[-6px] text-[13px] text-[#6b5b52]">* = retrograde</p>
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

          {k.planetaryPositions &&
            Array.isArray(k.planetaryPositions) &&
            k.planetaryPositions.length > 0 && (
              <div className="mb-6 rounded-[14px] border-[1.5px] border-[#e4cfa6] bg-[linear-gradient(135deg,rgba(255,251,245,0.8)_0%,rgba(253,246,235,0.9)_100%)] px-8 py-7 shadow-[0_4px_16px_rgba(107,68,35,0.08)] backdrop-blur-[8px] last:mb-0">
                <h2 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
                  Planet positions
                </h2>
                <p className="mb-3 mt-[-6px] text-[13px] text-[#6b5b52]">* = retrograde</p>
                <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
                  {k.planetaryPositions.map((planetData) => (
                    <div
                      key={planetData.planet}
                      className="rounded-[8px] border border-[rgba(180,123,69,0.2)] bg-[linear-gradient(135deg,rgba(180,123,69,0.1)_0%,rgba(212,165,116,0.08)_100%)] p-3"
                    >
                      <div className="text-[14px] font-bold text-[#6b4423]">
                        {planetData.planet}
                        {planetData.retrograde ? " *" : ""}
                      </div>
                      <div className="mt-1 text-[13px] text-[#8b5e34]">{planetData.sign}</div>
                      {typeof planetData.degree === "number" && (
                        <div className="mt-[2px] text-[12px] text-[#6b5b52]">
                          {planetData.degree.toFixed(2)}°
                        </div>
                      )}
                      {planetData.nakshatra && (
                        <div className="mt-[2px] text-[12px] text-[#8b5e34]">
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
            <p className="mb-[18px] rounded-[12px] border-l-[4px] border-l-[#d4a574] bg-[linear-gradient(135deg,rgba(180,123,69,0.15)_0%,rgba(212,165,116,0.15)_100%)] px-[18px] py-[14px] text-[14px] text-[#6b5b52] backdrop-blur-[8px]">
              Birth time was not provided; noon (12:00) was used for this chart. Lagna and house
              positions may be approximate.
            </p>
          )}
          <CalculationInfo
            showDasha={true}
            showAyanamsa={true}
            className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 rounded-[8px] border border-[#e8ddd0] bg-[#f5ebe0] px-4 py-3 text-[13px] text-[#5c4033]"
          />
          <TrustNote variant="guest" showAccuracyTip />
          <div className="mt-[30px] flex items-center gap-2 border-t border-t-[#e5e7eb] pt-5 text-[14px]">
            <span className="font-semibold text-[#6b7280]">Source:</span>
            <span className="font-medium text-[#1f2937]">{k.source}</span>
          </div>
        </div>
      </div>
      <p className="mt-5 text-center text-[14px] leading-[1.7] text-[#6b5b52]">
        We do not keep any record of your birth details. This Kundli is stored only in this browser
        session (sessionStorage) and will be cleared when you close the tab.{" "}
        <CreateAccountButton birthDetails={b} router={router} /> to save your birth details and
        access your Kundli anytime.
      </p>
    </div>
  ) : (
    <div className="flex items-center justify-center p-6">
      <div className="mx-auto mb-6 w-full max-w-[440px] rounded-[20px] border-[2px] border-[#e4cfa6] bg-[linear-gradient(135deg,#fff9f1_0%,#fffaf2_100%)] px-[52px] py-12 shadow-[0_20px_60px_rgba(122,46,46,0.15),0_0_100px_rgba(180,123,69,0.08)] backdrop-blur-[12px]">
        <h2 className="m-0 mb-[14px] text-center text-[32px] font-extrabold tracking-[-0.02em] text-transparent bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text">
          Free Kundli (Guest)
        </h2>
        <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
          Enter birth details. No login required. We do not store or keep any record — your Kundli
          is held only in this browser session (sessionStorage) and is cleared when you close the
          tab.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
            Full name (optional)
          </label>
          <input
            type="text"
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
          />

          <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
            Gender (optional)
          </label>
          <select
            className="formSelect w-full"
            value={gender}
            onChange={(e) => setGender((e.target.value || "") as "male" | "female" | "")}
          >
            <option value="">— Select —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
            Birth date *
          </label>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#6b5b52]">Day</label>
              <input
                type="number"
                min="1"
                max="31"
                className="w-full"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="01"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#6b5b52]">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="01"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-[#6b5b52]">Year</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="1990"
                required
              />
            </div>
          </div>

          <div className="mb-2 flex flex-wrap items-center gap-4">
            <label className="mb-0 block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
              Birth time {unknownTime ? "" : "*"}
            </label>
            <button
              type="button"
              className={`whitespace-nowrap rounded-[10px] border-[1.5px] px-5 py-[11px] text-[14px] font-bold transition-all duration-300 ${
                unknownTime
                  ? "border-[#6b4423] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] text-white shadow-[0_4px_12px_rgba(107,68,35,0.4)]"
                  : "border-[rgba(180,123,69,0.5)] bg-[linear-gradient(135deg,rgba(180,123,69,0.2)_0%,rgba(212,165,116,0.2)_100%)] text-[#8b5e34] hover:border-[rgba(180,123,69,0.8)] hover:bg-[linear-gradient(135deg,rgba(180,123,69,0.3)_0%,rgba(212,165,116,0.3)_100%)]"
              }`}
              onClick={() => {
                setUnknownTime((prev) => {
                  if (!prev) {
                    setBirthTime("12:00");
                  }
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
              <p className="mb-4 mt-[-12px] text-[13px] italic leading-[1.6] text-[#8b7355]">
                Enter birth time (HH:MM:SS). Seconds are optional but improve accuracy.
              </p>
            </>
          )}
          {unknownTime && (
            <p className="mb-4 mt-[-12px] text-[13px] italic leading-[1.6] text-[#8b7355]">
              Noon (12:00) will be used — Lagna and house positions may be approximate.
            </p>
          )}

          <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
            Birth place (city, town or village) *
          </label>
          <PlaceAutocomplete
            value={placeOfBirth}
            onChange={setPlaceOfBirth}
            placeholder="e.g. Mumbai, Maharashtra, India or town/village"
            required
            aria-label="Birth place"
          />
          <p className="mb-4 mt-[-12px] text-[13px] italic leading-[1.6] text-[#8b7355]">
            Start typing for suggestions worldwide. Full place (e.g. City, State, Country) is used
            for accurate positions.
          </p>

          <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
            Chart type
          </label>
          <select
            className="formSelect w-full"
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

          <button
            type="submit"
            className="mt-[14px] w-full rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] px-5 py-4 text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(107,68,35,0.3)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[2px] hover:bg-[linear-gradient(135deg,#a67a4a_0%,#7d5a3c_100%)] hover:shadow-[0_12px_36px_rgba(107,68,35,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span
                  className="inline-block h-[18px] w-[18px] shrink-0 animate-spin rounded-full border-[2px] border-[var(--border-color,#e8ddd0)] border-t-[#6b4423]"
                  aria-hidden
                />
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          {mainContent}
        </main>
      </div>
    </div>
  );
}
