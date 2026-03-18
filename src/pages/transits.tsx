import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import ErrorMessage from "@/components/ui/ErrorMessage";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import {
  astroApi,
  type TransitsTodayResponse,
  type RetrogradesResponse,
  type MajorTransitsResponse,
  type Eclipse,
} from "@/services/api";

type TabId = "today" | "retrogrades" | "major" | "eclipses";
type StoredUser = { birthPlace?: string };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function groupByMonth<T extends { date?: string; startDate?: string }>(items: T[]) {
  const map: Record<string, T[]> = {};
  items.forEach((item) => {
    const raw = item.date || item.startDate;
    if (!raw) {
      return;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      return;
    }
    const key = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(item);
  });
  return map;
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) {
    return "-";
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const planetBgClasses: Record<string, string> = {
  Sun: "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319062/sun-transit_laedud.png')]",
  Moon: "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319046/moon-transit_fiy8gj.jpg')]",
  Mercury:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319042/mercury_xvca9z.jpg')]",
  Venus:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318892/venus-transit_mhfkoy.jpg')]",
  Mars: "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318878/mars-transit_ecotew.jpg')]",
  Jupiter:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318836/jupiter-transit_z90jz1.jpg')]",
  Saturn:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319053/saturn-transit_hh1usy.jpg')]",
  Uranus:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319062/uranus-transit_ddo89i.jpg')]",
  Neptune:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318831/neptune-transit_m3sgas.jpg')]",
  Pluto:
    "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773318832/pluto-transit_dw7fpx.jpg')]",
  Rahu: "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319053/rahu-transit_cyzale.jpg')]",
  Ketu: "bg-[url('https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319041/ketu-transit_gplyfh.jpg')]",
};

const filterCardClass =
  "mb-6 rounded-[16px] border border-[#eadfd3] bg-white px-6 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.05)]";
const dateBoxClass =
  "rounded-[14px] border border-[#e2d4c8] bg-[#fffaf5] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-colors duration-200 hover:border-[#c7ab8b]";
const primaryButtonClass =
  "rounded-[12px] bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(107,68,35,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_16px_rgba(107,68,35,0.28)] disabled:cursor-not-allowed disabled:opacity-70";
const badgeClass =
  "mb-3 inline-flex rounded-full bg-[#f5ebe0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b5e34]";
const cardClass =
  "rounded-[18px] border border-[#eadfd3] bg-white px-6 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(139,94,52,0.12)]";

export default function TransitsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState("");
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const [todayData, setTodayData] = useState<TransitsTodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [retroFrom, setRetroFrom] = useState(todayStr());
  const [retroTo, setRetroTo] = useState(todayStr());
  const [retroData, setRetroData] = useState<RetrogradesResponse["retrogrades"]>([]);
  const [retroOnDate, setRetroOnDate] = useState(todayStr());
  const [retroOnDateResult, setRetroOnDateResult] = useState<{
    date: string;
    planetsRetrograde: string[];
  } | null>(null);
  const [retroOnDateLoading, setRetroOnDateLoading] = useState(false);

  const [majorFrom, setMajorFrom] = useState(todayStr());
  const [majorTo, setMajorTo] = useState(todayStr());
  const [majorData, setMajorData] = useState<MajorTransitsResponse["transits"]>([]);
  const [majorLoading, setMajorLoading] = useState(false);
  const [majorError, setMajorError] = useState<string | null>(null);

  const [eclipseFrom, setEclipseFrom] = useState("1900-01-01");
  const [eclipseTo, setEclipseTo] = useState("2100-01-01");
  const [solarEclipses, setSolarEclipses] = useState<Eclipse[]>([]);
  const [lunarEclipses, setLunarEclipses] = useState<Eclipse[]>([]);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) {
      return;
    }
    const parsed = JSON.parse(rawUser) as StoredUser;
    setStoredUser(parsed);
    setPlace(parsed.birthPlace || "");
  }, []);

  useEffect(() => {
    setLoading(true);
    astroApi
      .getTransitsToday()
      .then(setTodayData)
      .catch(() => {
        setError("Unable to load transits. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const loadRetrogrades = useCallback(async () => {
    try {
      const data = await astroApi.getRetrogrades(retroFrom, retroTo);
      setRetroData(data.retrogrades);
      setError(null);
    } catch {
      setError("Unable to load retrogrades. Please try again later.");
    }
  }, [retroFrom, retroTo]);

  const loadRetrogradesOnDate = useCallback(async () => {
    setRetroOnDateLoading(true);
    setRetroOnDateResult(null);
    try {
      const data = await astroApi.getRetrogradesOnDate(retroOnDate);
      setRetroOnDateResult(data);
      setError(null);
    } catch {
      setError("Unable to load retrogrades for this date.");
    } finally {
      setRetroOnDateLoading(false);
    }
  }, [retroOnDate]);

  const loadMajor = useCallback(async () => {
    setMajorError(null);
    setMajorLoading(true);
    try {
      const data = await astroApi.getMajorTransits(majorFrom, majorTo);
      setMajorData(data.transits ?? []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load transits.";
      setMajorError(msg);
      setMajorData([]);
    } finally {
      setMajorLoading(false);
    }
  }, [majorFrom, majorTo]);

  const loadEclipses = useCallback(async () => {
    try {
      const data = await astroApi.getEclipses(eclipseFrom);
      setSolarEclipses(data.solar || []);
      setLunarEclipses(data.lunar || []);
    } catch {
      setError("Unable to load eclipses. Please try again later.");
    }
  }, [eclipseFrom]);

  useEffect(() => {
    loadEclipses();
  }, [loadEclipses]);

  useEffect(() => {
    if (activeTab === "eclipses") {
      loadEclipses();
    }
  }, [activeTab, loadEclipses]);

  const handleRefresh = useCallback(() => {
    if (activeTab === "today") {
      setLoading(true);
      astroApi
        .getTransitsToday()
        .then(setTodayData)
        .catch(() => {
          setError("Unable to load transits. Please try again later.");
        })
        .finally(() => setLoading(false));
      return;
    }
    if (activeTab === "retrogrades") {
      loadRetrogrades();
    }
    if (activeTab === "major") {
      loadMajor();
    }
    if (activeTab === "eclipses") {
      loadEclipses();
    }
  }, [activeTab, loadEclipses, loadMajor, loadRetrogrades]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <PageHeader
            onBack={() => router.push("/dashboard")}
            backAriaLabel="Go back to dashboard"
            onRefresh={handleRefresh}
            refreshAriaLabel="Refresh transits"
            disableRefresh={loading || majorLoading}
          />
          <h1 className="mb-7 text-[32px] font-bold text-[#6b4423]">Planetary Transits</h1>
          {loading && <div>Loading...</div>}
          <div className="mb-7 rounded-[16px] border border-[#e8d7c8] bg-[linear-gradient(135deg,#fffaf4_0%,#fff5ea_100%)] px-[26px] py-5 shadow-[0_4px_20px_rgba(139,94,52,0.08)]">
            <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8b7355]">
              Birth place
            </p>
            {storedUser?.birthPlace ? (
              <h3 className="text-[20px] font-bold text-[#2d2a26]">{place}</h3>
            ) : (
              <PlaceAutocomplete
                value={place}
                onChange={setPlace}
                placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                aria-label="Birth place"
              />
            )}
          </div>
          {error && <ErrorMessage message={error} />}
          <div className="mb-7 flex flex-wrap gap-3">
            {[
              { id: "today", label: "Today" },
              { id: "eclipses", label: "Eclipses" },
              { id: "retrogrades", label: "Retrogrades" },
              { id: "major", label: "Major Transits" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabId)}
                className={
                  activeTab === t.id
                    ? "relative rounded-[12px] bg-[#6b4423] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(107,68,35,0.2)] after:absolute after:bottom-[-8px] after:left-1/2 after:h-0 after:w-0 after:-translate-x-1/2 after:border-l-[8px] after:border-r-[8px] after:border-t-[8px] after:border-l-transparent after:border-r-transparent after:border-t-[#6b4423] after:content-['']"
                    : "rounded-[12px] bg-white px-5 py-3 text-[14px] font-semibold text-[#6b5b52] shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-colors duration-200 hover:bg-[#f8eee3] hover:text-[#6b4423]"
                }
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "today" && todayData && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
              {Object.values(todayData.currentPlanetPositions || {}).map((p) => (
                <div
                  key={p.name}
                  className={`${cardClass} bg-no-repeat bg-[position:right_bottom] bg-[size:150px] ${planetBgClasses[p.name] ?? ""}`}
                >
                  <span className={badgeClass}>Planet</span>
                  <h4 className="mb-2 text-[22px] font-bold text-[#6b4423]">{p.name}</h4>
                  <p className="text-[15px] text-[#4a4238]">{p.sign.name}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "retrogrades" && (
            <>
              <div className={filterCardClass}>
                <h3 className="text-[20px] font-bold text-[#6b4423]">📅 On this day</h3>
                <p className="mt-2 text-[14px] text-[#6b7280]">
                  Which planets are retrograde on a particular date (compare with Astrosage).
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className={dateBoxClass}>
                    <input
                      type="date"
                      className="formDateInput"
                      value={retroOnDate}
                      onChange={(e) => setRetroOnDate(e.target.value)}
                      aria-label="Date"
                    />
                  </div>
                  <button
                    className={primaryButtonClass}
                    onClick={loadRetrogradesOnDate}
                    disabled={retroOnDateLoading}
                  >
                    {retroOnDateLoading ? "Checking…" : "Check"}
                  </button>
                </div>
                {retroOnDateResult && (
                  <div className="mt-4 rounded-[12px] border-l-[4px] border-l-[#6b4423] bg-[#faf8f5] px-4 py-3 text-[14px] leading-[1.6] text-[#4a4238]">
                    <strong>On {formatDate(retroOnDateResult.date)}:</strong>{" "}
                    {retroOnDateResult.planetsRetrograde.length === 0
                      ? "No planets retrograde."
                      : `${retroOnDateResult.planetsRetrograde.join(", ")} (retrograde)`}
                  </div>
                )}
              </div>

              <div className={filterCardClass}>
                <h3 className="text-[20px] font-bold text-[#6b4423]">
                  🔁 Retrograde periods (date range)
                </h3>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className={dateBoxClass}>
                    <input
                      type="date"
                      className="formDateInput"
                      value={retroFrom}
                      onChange={(e) => setRetroFrom(e.target.value)}
                    />
                  </div>
                  <div className={dateBoxClass}>
                    <input
                      type="date"
                      className="formDateInput"
                      value={retroTo}
                      onChange={(e) => setRetroTo(e.target.value)}
                    />
                  </div>
                  <button className={primaryButtonClass} onClick={loadRetrogrades}>
                    Get Retrogrades
                  </button>
                </div>
              </div>

              {Object.entries(groupByMonth(retroData)).map(([month, list]) => (
                <div key={month}>
                  <h3 className="mb-4 mt-7 text-[20px] font-bold text-[#6b4423]">📅 {month}</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                    {list.map((r) => (
                      <div key={r.planet + r.startDate} className={cardClass}>
                        <span className={badgeClass}>Retrograde</span>
                        <h4 className="mb-2 text-[22px] font-bold text-[#6b4423]">{r.planet}</h4>
                        <p className="mb-2 text-[15px] text-[#4a4238]">{r.description}</p>
                        <p className="text-[14px] text-[#4a4238]">
                          <strong>From:</strong> {formatDate(r.startDate)} | <strong>To:</strong>{" "}
                          {formatDate(r.endDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "major" && (
            <>
              <div className={filterCardClass}>
                <h3 className="text-[20px] font-bold text-[#6b4423]">🔱 Major Transits</h3>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className={dateBoxClass}>
                    <input
                      type="date"
                      className="formDateInput"
                      value={majorFrom}
                      onChange={(e) => setMajorFrom(e.target.value)}
                    />
                  </div>
                  <div className={dateBoxClass}>
                    <input
                      type="date"
                      className="formDateInput"
                      value={majorTo}
                      onChange={(e) => setMajorTo(e.target.value)}
                    />
                  </div>
                  <button
                    className={primaryButtonClass}
                    onClick={loadMajor}
                    disabled={majorLoading}
                  >
                    {majorLoading ? "Loading…" : "Get Transits"}
                  </button>
                </div>
                {majorError && (
                  <p className="mt-4 text-[14px] text-[#dc2626]" role="alert">
                    {majorError}
                  </p>
                )}
                <p className="mt-4 text-[14px] text-[#6b7280]">
                  Use a range of at least a few days to see Jupiter/Saturn sign changes. Same start
                  and end date shows transits that occurred on that day.
                </p>
              </div>

              {majorLoading ? null : Object.keys(groupByMonth(majorData)).length === 0 &&
                !majorError ? (
                <p className="rounded-[12px] border border-dashed border-[#d7cabf] bg-[#fffaf5] px-5 py-4 text-[14px] text-[#7a6658]">
                  No major sign changes (Jupiter, Saturn) in this date range. Try a wider range
                  (e.g. 1–2 months).
                </p>
              ) : null}

              {Object.entries(groupByMonth(majorData)).map(([month, list]) => (
                <div key={month}>
                  <h3 className="mb-4 mt-7 text-[20px] font-bold text-[#6b4423]">📅 {month}</h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                    {list.map((m) => (
                      <div key={m.planet + m.date} className={cardClass}>
                        <span className={badgeClass}>Major</span>
                        <h4 className="mb-2 text-[22px] font-bold text-[#6b4423]">{m.planet}</h4>
                        <p className="mb-2 text-[15px] text-[#4a4238]">{m.description}</p>
                        <p className="text-[14px] text-[#4a4238]">
                          <strong>Date:</strong> {formatDate(m.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "eclipses" && (
            <>
              <div className={filterCardClass}>
                <h3 className="text-[20px] font-bold text-[#6b4423]">🌘 Eclipses</h3>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8b7355]">
                      From
                    </label>
                    <div className={dateBoxClass}>
                      <input
                        type="date"
                        className="formDateInput"
                        value={eclipseFrom}
                        onChange={(e) => setEclipseFrom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8b7355]">
                      To
                    </label>
                    <div className={dateBoxClass}>
                      <input
                        type="date"
                        className="formDateInput"
                        value={eclipseTo}
                        onChange={(e) => setEclipseTo(e.target.value)}
                      />
                    </div>
                  </div>
                  <button className={primaryButtonClass} onClick={loadEclipses}>
                    Get Eclipses
                  </button>
                </div>
              </div>

              <div className="grid gap-8">
                <div className="rounded-[18px] bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
                  <h3 className="mb-5 text-[22px] font-bold text-[#6b4423]">🌞 Solar Eclipses</h3>
                  {solarEclipses.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                      {solarEclipses
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((e) => (
                          <div
                            key={e.date}
                            className="rounded-[18px] border border-[#fcd34d] bg-[linear-gradient(135deg,#fff7d6_0%,#ffefad_100%)] px-6 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
                          >
                            <div className="mb-2">
                              <span className={badgeClass}>Solar</span>
                            </div>
                            <h4 className="mb-2 text-[18px] font-bold text-[#6b4423]">
                              {formatDate(e.date)}
                            </h4>
                            <p className="mb-3 text-[14px] font-medium text-[#5b4534]">{e.type}</p>
                            <div className="grid gap-2 text-[14px] text-[#4a4238]">
                              {e.maximum && (
                                <p>
                                  <strong>Max:</strong> {new Date(e.maximum).toLocaleTimeString()}
                                </p>
                              )}
                              {e.umbralMagnitude !== undefined && (
                                <p>
                                  <strong>Umbral:</strong> {e.umbralMagnitude.toFixed(2)}
                                </p>
                              )}
                              {e.penumbralMagnitude !== undefined && (
                                <p>
                                  <strong>Penumbral:</strong> {e.penumbralMagnitude.toFixed(3)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="rounded-[12px] border border-dashed border-[#d7cabf] bg-[#fffaf5] px-5 py-4 text-[14px] text-[#7a6658]">
                      No solar eclipses in this period
                    </p>
                  )}
                </div>

                <div className="rounded-[18px] bg-white p-6 shadow-[0_4px_18px_rgba(0,0,0,0.05)]">
                  <h3 className="mb-5 text-[22px] font-bold text-[#6b4423]">🌕 Lunar Eclipses</h3>
                  {lunarEclipses.length > 0 ? (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                      {lunarEclipses
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((e) => (
                          <div
                            key={e.date}
                            className="rounded-[18px] border border-[#bfdbfe] bg-[linear-gradient(135deg,#e0efff_0%,#c7dfff_100%)] px-6 py-5 shadow-[0_4px_18px_rgba(0,0,0,0.05)]"
                          >
                            <div className="mb-2">
                              <span className={badgeClass}>Lunar</span>
                            </div>
                            <h4 className="mb-2 text-[18px] font-bold text-[#6b4423]">
                              {formatDate(e.date)}
                            </h4>
                            <p className="mb-3 text-[14px] font-medium text-[#5b4534]">{e.type}</p>
                            <div className="grid gap-2 text-[14px] text-[#4a4238]">
                              {e.maximum && (
                                <p>
                                  <strong>Max:</strong> {new Date(e.maximum).toLocaleTimeString()}
                                </p>
                              )}
                              {e.umbralMagnitude !== undefined && (
                                <p>
                                  <strong>Umbral:</strong> {e.umbralMagnitude.toFixed(2)}
                                </p>
                              )}
                              {e.penumbralMagnitude !== undefined && (
                                <p>
                                  <strong>Penumbral:</strong> {e.penumbralMagnitude.toFixed(3)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="rounded-[12px] border border-dashed border-[#d7cabf] bg-[#fffaf5] px-5 py-4 text-[14px] text-[#7a6658]">
                      No lunar eclipses in this period
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          <CalculationInfo showDasha={false} showAyanamsa />
        </main>
      </div>
    </div>
  );
}
