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
  "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";
const badgeClass =
  "mb-3 inline-flex rounded-full bg-gradient-to-r from-[#ede9fe] to-[#fce7f3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d28d9]";
const cardClass =
  "group relative overflow-hidden rounded-[22px] border border-white/60 bg-gradient-to-br from-white via-[#fff7ed] to-[#f3e8ff] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(124,58,237,0.18)]";

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

  const [eclipseFrom, setEclipseFrom] = useState("2000-01-01");
  const [eclipseLoading, setEclipseLoading] = useState(false);
  const [eclipseTo, setEclipseTo] = useState("2050-01-01");
  const [solarEclipses, setSolarEclipses] = useState<Eclipse[]>([]);
  const [lunarEclipses, setLunarEclipses] = useState<Eclipse[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

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
  const [eclipsesLoaded, setEclipsesLoaded] = useState(false);
  const [eclipsesFetching, setEclipsesFetching] = useState(false);
  const loadEclipsesSafe = useCallback(async () => {
    if (eclipsesFetching) {return;}

    try {
      setEclipsesFetching(true);
      setEclipseLoading(true);

      const data = await astroApi.getEclipses({
        fromDate: eclipseFrom,
        toDate: eclipseTo,
        page,
        pageSize,
      });

      setSolarEclipses(data.solar || []);
      setLunarEclipses(data.lunar || []);
      const totalPages = Math.max(data.solarTotalPages || 1, data.lunarTotalPages || 1);

      setTotalPages(totalPages);
      setEclipsesLoaded(true);
      setError(null);
    } catch {
      setError("Unable to load eclipses. Please try again later.");
      setEclipsesLoaded(false);
    } finally {
      setEclipseLoading(false);
      setEclipsesFetching(false);
    }
  }, [eclipseFrom, eclipseTo, page, pageSize, eclipsesFetching]);

  useEffect(() => {
    if (activeTab === "eclipses" && !eclipsesLoaded) {
      loadEclipsesSafe();
    }
  }, [activeTab, eclipsesLoaded, loadEclipsesSafe]);

  useEffect(() => {
    if (activeTab === "eclipses") {
      loadEclipsesSafe();
    }
  }, [page, activeTab, loadEclipsesSafe]);

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
      setEclipsesLoaded(false);
      loadEclipsesSafe();
    }
  }, [activeTab, loadEclipsesSafe, loadMajor, loadRetrogrades]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#ffe7d6_0%,transparent_35%),radial-gradient(circle_at_85%_10%,#e0f2fe_0%,transparent_40%),radial-gradient(circle_at_80%_80%,#ede9fe_0%,transparent_40%),linear-gradient(135deg,#fffaf5_0%,#f8f4ff_50%,#f0f9ff_100%)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-white/70 backdrop-blur-[6px] p-8 max-[768px]:ml-[200px]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#ffd7ba]/40 blur-3xl" />
            <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[#c7d2fe]/40 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#bae6fd]/40 blur-3xl" />
          </div>
          <PageHeader
            onBack={() => router.push("/dashboard")}
            backAriaLabel="Go back to dashboard"
            onRefresh={handleRefresh}
            refreshAriaLabel="Refresh transits"
            disableRefresh={loading || majorLoading}
          />
          <div className="mb-10">
            <h1 className="text-[38px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Planetary Transits
            </h1>
            <p className="mt-2 text-[15px] text-[#8b7355]">
              Explore real-time planetary movements, retrogrades, eclipses & major cosmic events
            </p>
          </div>
          {loading && <div>Loading...</div>}
          <div className="mb-8 rounded-[20px] border border-white/40 bg-white/60 px-[28px] py-6 shadow-[0_10px_30px_rgba(139,94,52,0.12)] backdrop-blur-[10px]">
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
          <div className="mb-10 flex flex-wrap gap-3 rounded-[16px] bg-white/60 p-2 shadow-[0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur">
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
                    ? "relative rounded-[12px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_6px_18px_rgba(107,68,35,0.35)]"
                    : "rounded-[12px] px-6 py-3 text-[14px] font-semibold text-[#6b5b52] transition-all duration-200 hover:bg-gradient-to-r hover:from-[#fdf2f8] hover:to-[#eff6ff] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
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
                  <div className="mt-4 rounded-[14px] border border-[#e8d7c8] bg-gradient-to-br from-[#fffaf4] to-[#fff1e6] px-5 py-4 text-[14px] leading-[1.7] text-[#4a4238] shadow-sm">
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

              {retroData.length === 0 && (
                <div className="rounded-[16px] border border-dashed border-[#d7cabf] bg-[#fffaf5] p-8 text-center">
                  <div className="text-[40px]">🛰</div>
                  <p className="mt-2 text-[15px] font-semibold text-[#6b4423]">
                    No Retrogrades Found
                  </p>
                  <p className="mt-1 text-[13px] text-[#8b7355]">
                    Try selecting a wider date range
                  </p>
                </div>
              )}

              {Object.entries(groupByMonth(retroData)).map(([month, list]) => (
                <div key={month}>
                  <div className="mt-10 mb-5 flex items-center gap-3">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />
                    <h3 className="text-[18px] font-extrabold tracking-wide text-[#6b4423]">
                      {month.toUpperCase()}
                    </h3>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                    {list.map((r) => (
                      <div key={r.planet + r.startDate} className={cardClass}>
                        {/* Top Accent Line */}
                        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#8b5e34] to-[#d4a373]" />

                        {/* Glow on hover */}
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(255,210,160,0.25),transparent_60%)]" />

                        {/* Badge */}
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#f3e8d9] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#8b5e34]">
                          🪐 Retrograde
                        </span>

                        {/* Planet Name */}
                        <h4 className="mt-3 mb-1 text-[24px] font-extrabold tracking-tight text-[#5a3b22]">
                          {r.planet}
                        </h4>
                        <p className="mb-3 text-[13px] font-medium text-[#a78a7a]">
                          Planet in Retrograde Motion
                        </p>

                        {/* Description */}
                        <p className="text-[15px] leading-relaxed text-[#4a4238]">
                          {r.description}
                        </p>

                        {/* Date Range Box */}
                        <div className="mt-4 flex items-center gap-2 rounded-[12px] bg-[#f8f4ee] px-3 py-2 text-[13px] text-[#5b4636]">
                          <span className="font-semibold">📅</span>
                          <span>
                            <strong>{formatDate(r.startDate)}</strong>
                            <span className="mx-2 text-[#b08968]">→</span>
                            <strong>{formatDate(r.endDate)}</strong>
                          </span>
                        </div>
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
                  <div className="mt-10 mb-5 flex items-center gap-3">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />
                    <h3 className="text-[18px] font-extrabold tracking-wide text-[#6b4423]">
                      {month.toUpperCase()}
                    </h3>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />
                  </div>
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
                        onChange={(e) => {
                          setEclipseFrom(e.target.value);
                          setPage(1);
                        }}
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
                        onChange={(e) => {
                          setEclipseTo(e.target.value);
                          setPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className={primaryButtonClass}
                    onClick={() => {
                      setEclipsesLoaded(false); // force reload
                      loadEclipsesSafe();
                    }}
                    disabled={eclipseLoading}
                  >
                    {eclipseLoading ? "Loading…" : "Get Eclipses"}
                  </button>
                </div>
              </div>

              <div className="relative">
                {/* 🔥 Sticky Pagination Bar */}
                {totalPages > 1 && (
                  <div
                    className="sticky top-0 z-20 mb-6 flex items-center justify-between rounded-2xl 
border border-white/40 
bg-gradient-to-r from-[#faf5ff]/95 via-white/95 to-[#fff7ed]/95 
px-6 py-4 
shadow-[0_8px_30px_rgba(124,58,237,0.15)] 
backdrop-blur-xl"
                  >
                    {/* Left: Title */}
                    <div className="font-semibold text-gray-700">Eclipse Results</div>

                    {/* Center: Page Info */}
                    <div className="text-sm font-medium text-[#6b7280]">
                      Page <span className="font-bold text-[#7c3aed]">{page}</span> of{" "}
                      <span className="font-bold text-[#db2777]">{totalPages}</span>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 1}
                        className="rounded-xl px-4 py-2 text-sm font-semibold 
text-[#6b7280] 
bg-white/70 
hover:bg-gradient-to-r hover:from-[#ede9fe] hover:to-[#fce7f3] 
hover:text-[#7c3aed] 
shadow-sm 
transition-all duration-200 
disabled:opacity-40"
                      >
                        ← Prev
                      </button>

                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {/* Content */}
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
              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-500">
                    Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
                    <span className="font-semibold text-gray-800">{totalPages}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                    {/* Prev */}
                    <button
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, i, arr) => (
                        <span key={p} className="flex items-center">
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="px-2 text-gray-400">…</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`min-w-[36px] rounded-full px-3 py-2 text-sm font-semibold transition ${
                              page === p
                                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}

                    {/* Next */}
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <CalculationInfo showDasha={false} showAyanamsa />
        </main>
      </div>
    </div>
  );
}
