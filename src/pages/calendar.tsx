import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import Loading from "@/components/ui/Loading";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { showError } from "@/utils/toast";
import Image from "next/image";
import {
  astroApi,
  type GuestCalendarResponse,
  type FestivalsResponse,
  type MuhuratResponse,
  type AuspiciousDayResponse,
  type RahuYamagandamResponse,
} from "@/services/api";

type TabId = "today" | "festivals" | "muhurat" | "auspicious" | "rahu";
type StoredUser = { birthPlace?: string };

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function getMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const filterBarClass =
  "mb-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#e8dfd2] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]";
const filterLabelClass =
  "inline-flex cursor-pointer items-center gap-2 text-[14px] font-medium text-[#4a4238]";
const primaryButtonClass =
  "rounded-[10px] bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-5 py-[10px] text-[14px] font-semibold text-white shadow-[0_2px_8px_rgba(107,68,35,0.2)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(107,68,35,0.3)] disabled:cursor-not-allowed disabled:opacity-70";
const errorMessageClass =
  "mb-4 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[14px] text-[#b91c1c]";

export default function CalendarPage() {
  const router = useRouter();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [place, setPlace] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("today");

  const [todayLoading, setTodayLoading] = useState(true);
  const [todayData, setTodayData] = useState<GuestCalendarResponse | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);

  const [festDate, setFestDate] = useState(getTodayStr());
  const [festMonth, setFestMonth] = useState(getMonthStr());
  const [festivalsByMonth, setFestivalsByMonth] = useState(false);
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [festivalsData, setFestivalsData] = useState<FestivalsResponse | null>(null);
  const [festivalsError, setFestivalsError] = useState<string | null>(null);

  const [muhuratDate, setMuhuratDate] = useState(getTodayStr());
  const [muhuratLoading, setMuhuratLoading] = useState(false);
  const [muhuratData, setMuhuratData] = useState<MuhuratResponse | null>(null);

  const [auspiciousDate, setAuspiciousDate] = useState(getTodayStr());
  const [auspiciousLoading, setAuspiciousLoading] = useState(false);
  const [auspiciousData, setAuspiciousData] = useState<AuspiciousDayResponse | null>(null);

  const [rahuDate, setRahuDate] = useState(getTodayStr());
  const [rahuLoading, setRahuLoading] = useState(false);
  const [rahuData, setRahuData] = useState<RahuYamagandamResponse | null>(null);
  const [rahuError, setRahuError] = useState<string | null>(null);

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
    if (activeTab !== "today" || !place) {
      return;
    }

    const fetchToday = async () => {
      try {
        setTodayLoading(true);
        setTodayError(null);
        const data = await astroApi.getGuestCalendar(place);
        setTodayData(data);
      } catch {
        setTodayError("Failed to load today calendar");
      } finally {
        setTodayLoading(false);
      }
    };

    fetchToday();
  }, [activeTab, place]);

  const fetchFestivals = useCallback(async () => {
    try {
      setFestivalsLoading(true);
      setFestivalsError(null);
      const dateOrMonth = festivalsByMonth ? festMonth : festDate;
      const data = await astroApi.getFestivals(dateOrMonth);
      setFestivalsData(data);
    } catch {
      setFestivalsError("Failed to load festivals");
    } finally {
      setFestivalsLoading(false);
    }
  }, [festDate, festMonth, festivalsByMonth]);

  const fetchMuhurat = useCallback(async () => {
    if (!place) {
      showError("Please enter birth place");
      return;
    }
    try {
      setMuhuratLoading(true);
      const data = await astroApi.getMuhurat(muhuratDate, place);
      setMuhuratData(data);
    } finally {
      setMuhuratLoading(false);
    }
  }, [muhuratDate, place]);

  const fetchAuspicious = useCallback(async () => {
    try {
      setAuspiciousLoading(true);
      const data = await astroApi.getAuspiciousDay(auspiciousDate, place);
      setAuspiciousData(data);
    } finally {
      setAuspiciousLoading(false);
    }
  }, [auspiciousDate, place]);

  const fetchRahuYamagandam = useCallback(async () => {
    try {
      setRahuLoading(true);
      setRahuError(null);
      const data = await astroApi.getRahuYamagandam(rahuDate, place);
      setRahuData(data);
    } catch (e) {
      setRahuError(e instanceof Error ? e.message : "Failed to load Rahu Kaal / Yamagandam");
    } finally {
      setRahuLoading(false);
    }
  }, [place, rahuDate]);

  const handleRefresh = useCallback(() => {
    if (activeTab === "today") {
      if (!place) {
        return;
      }
      (async () => {
        try {
          setTodayLoading(true);
          const data = await astroApi.getGuestCalendar(place);
          setTodayData(data);
          setTodayError(null);
        } catch {
          setTodayError("Failed to load today calendar");
        } finally {
          setTodayLoading(false);
        }
      })();
      return;
    }
    if (activeTab === "festivals") {
      fetchFestivals();
    }
    if (activeTab === "muhurat") {
      fetchMuhurat();
    }
    if (activeTab === "auspicious") {
      fetchAuspicious();
    }
    if (activeTab === "rahu") {
      fetchRahuYamagandam();
    }
  }, [activeTab, fetchAuspicious, fetchFestivals, fetchMuhurat, fetchRahuYamagandam, place]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "festivals", label: "Festivals" },
    { id: "muhurat", label: "Muhurat" },
    { id: "auspicious", label: "Auspicious Day" },
    { id: "rahu", label: "Rahu Kaal / Yamagandam" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader
              title="Calendar"
              onTitleClick={handleRefresh}
              onBack={() => router.push("/dashboard")}
              backAriaLabel="Go back to dashboard"
              onRefresh={handleRefresh}
              refreshAriaLabel="Refresh calendar"
              disableRefresh={
                todayLoading ||
                festivalsLoading ||
                muhuratLoading ||
                auspiciousLoading ||
                rahuLoading
              }
            />
            <div className="mx-auto max-w-[900px]">
              <div className="mb-7 flex items-center gap-4 rounded-[16px] border border-[#ecdcc4] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] px-6 py-5 shadow-[0_2px_12px_rgba(107,68,35,0.06)]">
                <div
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] text-[20px] text-white"
                  aria-hidden
                >
                  📍
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8b7355]">
                    Birth place
                  </div>
                  {storedUser?.birthPlace ? (
                    <div className="text-[18px] font-semibold text-[#2d2a26]">{place}</div>
                  ) : (
                    <PlaceAutocomplete
                      value={place}
                      onChange={setPlace}
                      placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                      aria-label="Birth place"
                    />
                  )}
                </div>
              </div>

              <div className="mb-7 flex flex-wrap gap-2 rounded-[14px] border border-[#ebe4d8] bg-[#f8f5f0] p-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={
                      activeTab === t.id
                        ? "cursor-pointer rounded-[10px] bg-[linear-gradient(135deg,#7d5a3c_0%,#6b4423_100%)] px-[18px] py-[10px] text-[14px] font-medium text-white shadow-[0_2px_8px_rgba(107,68,35,0.25)] transition-all duration-200"
                        : "cursor-pointer rounded-[10px] bg-transparent px-[18px] py-[10px] text-[14px] font-medium text-[#6b5b52] transition-all duration-200 hover:bg-[rgba(107,68,35,0.08)] hover:text-[#6b4423]"
                    }
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === "today" && (
                <div>
                  {todayLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                      <Loading text="Loading today’s panchang..." variant="page" />
                    </div>
                  )}
                  {todayError && <p className={errorMessageClass}>{todayError}</p>}
                  {!todayLoading && todayData && (
                    <div className="relative mb-8 overflow-hidden rounded-[24px] border border-[rgba(148,163,184,0.2)] bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_50%,#334155_100%)] px-12 py-10 text-white shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_100px_rgba(59,130,246,0.1)] before:pointer-events-none before:absolute before:right-[-20%] before:top-[-50%] before:h-[140%] before:w-[70%] before:bg-[radial-gradient(ellipse,rgba(59,130,246,0.15)_0%,transparent_70%)] before:content-[''] after:pointer-events-none after:absolute after:bottom-[-50%] after:left-[-10%] after:h-[120%] after:w-[60%] after:bg-[radial-gradient(ellipse,rgba(139,92,246,0.1)_0%,transparent_70%)] after:content-['']">
                      <div className="mb-2 bg-[linear-gradient(135deg,#38bdf8_0%,#0ea5e9_100%)] bg-clip-text text-[32px] font-extrabold tracking-[-0.01em] text-transparent">
                        {todayData.date}
                      </div>
                      <div className="mb-7 text-[16px] font-medium text-[#cbd5e1] opacity-80">
                        {todayData.moonPhase} · {todayData.tithi} · {todayData.nakshatra}
                      </div>
                      <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-[14px]">
                        {[
                          ["Tithi", todayData.tithi],
                          ["Nakshatra", todayData.nakshatra],
                          ["Moon phase", todayData.moonPhase],
                          ["Paksha", todayData.paksha],
                          ["Ritu", todayData.ritu],
                          ["Hindu month", todayData.hinduMonth],
                        ].map(([label, value]) =>
                          value ? (
                            <div
                              key={label}
                              className="cursor-default rounded-[14px] border border-[rgba(148,163,184,0.3)] bg-[linear-gradient(135deg,rgba(71,85,105,0.4)_0%,rgba(51,65,85,0.3)_100%)] px-4 py-[18px] text-center backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(148,163,184,0.5)] hover:bg-[linear-gradient(135deg,rgba(71,85,105,0.6)_0%,rgba(51,65,85,0.5)_100%)]"
                            >
                              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[rgba(148,163,184,0.8)]">
                                {label}
                              </div>
                              <div className="text-[15px] font-bold leading-[1.35] text-white">
                                {value}
                              </div>
                            </div>
                          ) : null,
                        )}
                      </div>
                      {((todayData.sunrise ?? todayData.sunset) ||
                        (todayData.moonRise ?? todayData.moonSet)) && (
                        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-[18px]">
                          {(todayData.sunrise ?? todayData.sunset) && (
                            <div className="cursor-default overflow-hidden rounded-[18px] border border-[rgba(148,163,184,0.3)] bg-[linear-gradient(135deg,rgba(71,85,105,0.4)_0%,rgba(51,65,85,0.3)_100%)] shadow-[0_8px_24px_rgba(0,0,0,0.15)] backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(148,163,184,0.5)] hover:bg-[linear-gradient(135deg,rgba(71,85,105,0.6)_0%,rgba(51,65,85,0.5)_100%)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.15)]">
                              <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden border-b-[2px] border-b-[rgba(148,163,184,0.2)] bg-[linear-gradient(135deg,#1e3a8a_0%,#1e40af_50%,#0284c7_100%)]">
                                <Image
                                  src="https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319718/sunrise_kw5rub.jpg"
                                  alt="Sunrise"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-4 p-5">
                                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#fbbf24_0%,#f59e0b_100%)] text-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                                  ☀
                                </div>
                                <div className="text-[15px] font-semibold leading-[1.6] text-[rgba(255,255,255,0.95)]">
                                  {todayData.sunrise ? `SunRise ${todayData.sunrise}` : ""}
                                  {todayData.sunrise && todayData.sunset ? " · " : ""}
                                  {todayData.sunset ? `SunSet ${todayData.sunset}` : ""}
                                </div>
                              </div>
                            </div>
                          )}
                          {(todayData.moonRise ?? todayData.moonSet) && (
                            <div className="cursor-default overflow-hidden rounded-[18px] border border-[rgba(148,163,184,0.3)] bg-[linear-gradient(135deg,rgba(71,85,105,0.4)_0%,rgba(51,65,85,0.3)_100%)] shadow-[0_8px_24px_rgba(0,0,0,0.15)] backdrop-blur-[12px] transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(148,163,184,0.5)] hover:bg-[linear-gradient(135deg,rgba(71,85,105,0.6)_0%,rgba(51,65,85,0.5)_100%)] hover:shadow-[0_16px_40px_rgba(59,130,246,0.15)]">
                              <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden border-b-[2px] border-b-[rgba(148,163,184,0.2)] bg-[linear-gradient(135deg,#1e3a8a_0%,#1e40af_50%,#0284c7_100%)]">
                                <Image
                                  src="https://res.cloudinary.com/dmxmm7emu/image/upload/v1773319343/moonrise_azuvh4.jpg"
                                  alt="Moonrise"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div className="flex items-center gap-4 p-5">
                                <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#60a5fa_0%,#3b82f6_100%)] text-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
                                  ☽
                                </div>
                                <div className="text-[15px] font-semibold leading-[1.6] text-[rgba(255,255,255,0.95)]">
                                  {todayData.moonRise ? `MoonRise ${todayData.moonRise}` : ""}
                                  {todayData.moonRise && todayData.moonSet ? " · " : ""}
                                  {todayData.moonSet ? `MoonSet ${todayData.moonSet}` : ""}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {todayData.majorPlanetaryEvents?.length > 0 && (
                        <div className="mt-5 rounded-[14px] border border-[rgba(148,163,184,0.3)] bg-[linear-gradient(135deg,rgba(71,85,105,0.4)_0%,rgba(51,65,85,0.3)_100%)] px-6 py-5 backdrop-blur-[12px] transition-all duration-300 hover:border-[rgba(148,163,184,0.5)] hover:bg-[linear-gradient(135deg,rgba(71,85,105,0.6)_0%,rgba(51,65,85,0.5)_100%)]">
                          <div className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.1em] text-[rgba(148,163,184,0.8)]">
                            Planetary events
                          </div>
                          <div className="text-[15px] font-medium leading-[1.6] text-[#e8f0fe]">
                            {todayData.majorPlanetaryEvents.join(", ")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "festivals" && (
                <>
                  <div className={filterBarClass}>
                    <label className={filterLabelClass}>
                      <input
                        type="radio"
                        checked={!festivalsByMonth}
                        onChange={() => setFestivalsByMonth(false)}
                      />
                      By date
                    </label>
                    <label className={filterLabelClass}>
                      <input
                        type="radio"
                        checked={festivalsByMonth}
                        onChange={() => setFestivalsByMonth(true)}
                      />
                      By month
                    </label>
                    <input
                      type={festivalsByMonth ? "month" : "date"}
                      className="formDateInput formDateInputInline"
                      value={festivalsByMonth ? festMonth : festDate}
                      onChange={(e) =>
                        festivalsByMonth
                          ? setFestMonth(e.target.value)
                          : setFestDate(e.target.value)
                      }
                      aria-label={festivalsByMonth ? "Month" : "Date"}
                    />
                    <button
                      type="button"
                      onClick={fetchFestivals}
                      disabled={festivalsLoading}
                      className={primaryButtonClass}
                    >
                      {festivalsLoading ? "Loading…" : "Get festivals"}
                    </button>
                  </div>
                  {festivalsLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                      <Loading text="Loading festivals..." variant="page" />
                    </div>
                  )}
                  {festivalsError && <p className={errorMessageClass}>{festivalsError}</p>}
                  {!festivalsLoading && festivalsData?.festivals?.length === 0 && (
                    <p className="rounded-[14px] border border-dashed border-[#e0d4c4] bg-[#fdfcfa] px-6 py-8 text-center text-[15px] text-[#6b5b52]">
                      No festivals found for this date.
                    </p>
                  )}
                  {!festivalsLoading &&
                    festivalsData?.festivals &&
                    festivalsData.festivals.length > 0 && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
                        {festivalsData.festivals.map((f, i) => (
                          <div
                            key={i}
                            className="rounded-[14px] border border-[#e8dfd2] bg-white px-[22px] py-5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(107,68,35,0.1)]"
                          >
                            <div className="mb-2 border-b border-b-[#f0ebe3] pb-2 text-[17px] font-semibold text-[#2d2a26]">
                              {f.name}
                            </div>
                            {f.note && (
                              <p className="m-0 text-[14px] leading-[1.5] text-[#6b5b52]">
                                {f.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                </>
              )}

              {activeTab === "muhurat" && (
                <>
                  <div className={filterBarClass}>
                    <label className={filterLabelClass}>Date</label>
                    <input
                      type="date"
                      className="formDateInput formDateInputInline"
                      value={muhuratDate}
                      onChange={(e) => setMuhuratDate(e.target.value)}
                      aria-label="Date for muhurat"
                    />
                    <button
                      type="button"
                      onClick={fetchMuhurat}
                      disabled={muhuratLoading}
                      className={primaryButtonClass}
                    >
                      {muhuratLoading ? "Loading…" : "Get muhurat"}
                    </button>
                  </div>
                  {muhuratLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                      <Loading text="Loading muhurat..." variant="page" />
                    </div>
                  )}
                  {muhuratData && !muhuratLoading && (
                    <div className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 text-[18px] font-semibold text-[#2d2a26]">
                        Abhijit Muhurat
                      </div>
                      <div className="mt-3 inline-flex items-center gap-[10px] rounded-[12px] border border-[#f0dcc4] bg-[linear-gradient(135deg,#fef7ed_0%,#fdf0dc_100%)] px-[18px] py-[14px]">
                        <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#8b5e34]">
                          Time (UTC)
                        </span>
                        <span className="text-[16px] font-bold text-[#6b4423]">
                          {muhuratData.abhijitMuhurat.start} – {muhuratData.abhijitMuhurat.end}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "auspicious" && (
                <>
                  <div className={filterBarClass}>
                    <label className={filterLabelClass}>Date</label>
                    <input
                      type="date"
                      className="formDateInput formDateInputInline"
                      value={auspiciousDate}
                      onChange={(e) => setAuspiciousDate(e.target.value)}
                      aria-label="Date to check"
                    />
                    <button
                      type="button"
                      onClick={fetchAuspicious}
                      disabled={auspiciousLoading}
                      className={primaryButtonClass}
                    >
                      {auspiciousLoading ? "Checking…" : "Check auspicious"}
                    </button>
                  </div>
                  {auspiciousLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                      <Loading text="Checking..." variant="page" />
                    </div>
                  )}
                  {auspiciousData && !auspiciousLoading && (
                    <div className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 text-[18px] font-semibold text-[#2d2a26]">
                        {auspiciousData.isAuspicious ? (
                          <span className="text-[18px] font-bold text-[#0d9488]">
                            Auspicious day ✓
                          </span>
                        ) : (
                          <span className="text-[18px] font-bold text-[#b45309]">
                            Not auspicious
                          </span>
                        )}
                      </div>
                      <p className="mb-0 mt-2 text-[15px] leading-[1.6] text-[#4a4238]">
                        {auspiciousData.reason}
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "rahu" && (
                <>
                  <div className={filterBarClass}>
                    <label className={filterLabelClass}>Date</label>
                    <input
                      type="date"
                      className="formDateInput formDateInputInline"
                      value={rahuDate}
                      onChange={(e) => setRahuDate(e.target.value)}
                      aria-label="Date"
                    />
                    <label className={filterLabelClass}>Birth place</label>
                    <PlaceAutocomplete
                      value={place}
                      onChange={setPlace}
                      placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                      aria-label="Birth place"
                    />
                    <button
                      type="button"
                      onClick={fetchRahuYamagandam}
                      disabled={rahuLoading}
                      className={primaryButtonClass}
                    >
                      {rahuLoading ? "Loading…" : "Get Rahu Kaal / Yamagandam"}
                    </button>
                  </div>
                  {rahuLoading && (
                    <div className="flex min-h-[240px] items-center justify-center">
                      <Loading text="Loading..." variant="page" />
                    </div>
                  )}
                  {rahuError && !rahuLoading && <p className={errorMessageClass}>{rahuError}</p>}
                  {rahuData && !rahuLoading && (
                    <div className="mb-5 rounded-[16px] border border-[#e8dfd2] bg-white px-7 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                      <div className="mb-3 text-[18px] font-semibold text-[#2d2a26]">
                        {rahuData.date}
                      </div>
                      <p className="mb-5 rounded-[10px] border-l-[3px] border-l-[#9ca3af] bg-[#f8f7f5] px-4 py-3 text-[13px] text-[#6b7280]">
                        Sun: Sunrise {rahuData.sunrise} · Sunset {rahuData.sunset} (UTC). Convert to
                        your local time. These periods are traditionally considered inauspicious for
                        starting important work.
                      </p>
                      <div className="mb-5 rounded-[14px] border border-[#e8dfd2] border-l-[4px] border-l-[#b45309] bg-[#fdfcfa] px-[22px] py-[18px]">
                        <div className="mb-[6px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[#6b5b52]">
                          Rahu Kaal
                        </div>
                        <div className="mb-[6px] text-[16px] font-semibold text-[#2d2a26]">
                          {rahuData.rahuKaal.start} – {rahuData.rahuKaal.end}
                        </div>
                        {rahuData.rahuKaal.note && (
                          <p className="m-0 text-[13px] leading-[1.5] text-[#6b5b52]">
                            {rahuData.rahuKaal.note}
                          </p>
                        )}
                      </div>
                      <div className="mb-5 rounded-[14px] border border-[#e8dfd2] border-l-[4px] border-l-[#92400e] bg-[#fdfcfa] px-[22px] py-[18px]">
                        <div className="mb-[6px] text-[12px] font-semibold uppercase tracking-[0.05em] text-[#6b5b52]">
                          Yamagandam
                        </div>
                        <div className="mb-[6px] text-[16px] font-semibold text-[#2d2a26]">
                          {rahuData.yamagandam.start} – {rahuData.yamagandam.end}
                        </div>
                        {rahuData.yamagandam.note && (
                          <p className="m-0 text-[13px] leading-[1.5] text-[#6b5b52]">
                            {rahuData.yamagandam.note}
                          </p>
                        )}
                      </div>
                      {rahuData.source && (
                        <p className="mt-4 text-[12px] text-[#6b7280]">Source: {rahuData.source}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <CalculationInfo
                showDasha={false}
                showAyanamsa={true}
                note="Calendar data uses Swiss Ephemeris."
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
