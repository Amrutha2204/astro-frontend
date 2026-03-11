import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import Loading from "@/components/ui/Loading";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";
import cal from "@/styles/calendar.module.css";

import {
  astroApi,
  GuestCalendarResponse,
  FestivalsResponse,
  MuhuratResponse,
  AuspiciousDayResponse,
  RahuYamagandamResponse,
} from "@/services/api";

type TabId = "today" | "festivals" | "muhurat" | "auspicious" | "rahu";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function getMonthStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const router = useRouter();
  /** ✅ Read logged-in user from localStorage */
  const [storedUser, setStoredUser] = useState<any>(null);
const [isMounted, setIsMounted] = useState(false);
const [place, setPlace] = useState<string>(
  storedUser?.birthPlace || ""
);
  const [activeTab, setActiveTab] = useState<TabId>("today");

  /** ---------------- TODAY ---------------- */
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayData, setTodayData] = useState<GuestCalendarResponse | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);

  /** ---------------- FESTIVALS ---------------- */
  const [festDate, setFestDate] = useState(getTodayStr());
  const [festMonth, setFestMonth] = useState(getMonthStr());
  const [festivalsByMonth, setFestivalsByMonth] = useState(false);
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [festivalsData, setFestivalsData] = useState<FestivalsResponse | null>(null);
  const [festivalsError, setFestivalsError] = useState<string | null>(null);

  /** ---------------- MUHURAT ---------------- */
  const [muhuratDate, setMuhuratDate] = useState(getTodayStr());
  const [muhuratLoading, setMuhuratLoading] = useState(false);
  const [muhuratData, setMuhuratData] = useState<MuhuratResponse | null>(null);
  const [muhuratError, setMuhuratError] = useState<string | null>(null);

  /** ---------------- AUSPICIOUS ---------------- */
  const [auspiciousDate, setAuspiciousDate] = useState(getTodayStr());
  const [auspiciousLoading, setAuspiciousLoading] = useState(false);
  const [auspiciousData, setAuspiciousData] = useState<AuspiciousDayResponse | null>(
    null
  );
  const [auspiciousError, setAuspiciousError] = useState<string | null>(null);

  /** Fetch TODAY automatically when tab is today */
  const [rahuDate, setRahuDate] = useState(getTodayStr());
  const [rahuLoading, setRahuLoading] = useState(false);
  const [rahuData, setRahuData] = useState<RahuYamagandamResponse | null>(null);
  const [rahuError, setRahuError] = useState<string | null>(null);
  useEffect(() => {
    if (activeTab !== "today") return;

    const fetchToday = async () => {
      if (!place) 
  return;
      try {
        setTodayLoading(true);
        const data = await astroApi.getGuestCalendar(place);
        setTodayData(data);
      } catch (e) {
        setTodayError("Failed to load today calendar");
      } finally {
        setTodayLoading(false);
      }
    };

    fetchToday();
  }, [activeTab, place]);

  useEffect(() => {
  setIsMounted(true);

  const user = localStorage.getItem("user");
  if (user) {
    const parsed = JSON.parse(user);
    setStoredUser(parsed);
    setPlace(parsed.birthPlace || "");
  }
}, []);

  /** ---------------- API CALLS ---------------- */
  const fetchFestivals = async () => {
    try {
      setFestivalsLoading(true);
      const dateOrMonth = festivalsByMonth ? festMonth : festDate;
      const data = await astroApi.getFestivals(dateOrMonth);
      setFestivalsData(data);
    } catch {
      setFestivalsError("Failed to load festivals");
    } finally {
      setFestivalsLoading(false);
    }
  };

  const fetchMuhurat = async () => {
    if (!place) {
  alert("Please enter birth place");
  return;
}
    try {
      setMuhuratLoading(true);
      const data = await astroApi.getMuhurat(muhuratDate, place);
      setMuhuratData(data);
    } catch {
      setMuhuratError("Failed to load muhurat");
    } finally {
      setMuhuratLoading(false);
    }
  };

  const fetchAuspicious = async () => {
    
    try {
      setAuspiciousLoading(true);
      const data = await astroApi.getAuspiciousDay(auspiciousDate, place);
      setAuspiciousData(data);
    } catch {
      setAuspiciousError("Failed to check auspicious day");
    } finally {
      setAuspiciousLoading(false);
    }
  };

  /** ---------------- UI ---------------- */
  const fetchRahuYamagandam = async () => {
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
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "festivals", label: "Festivals" },
    { id: "muhurat", label: "Muhurat" },
    { id: "auspicious", label: "Auspicious Day" },
    { id: "rahu", label: "Rahu Kaal / Yamagandam" },
  ];

  const handleRefresh = useCallback(() => {
    if (activeTab === "today") {
      // Re-run today's calendar fetch
      if (!place) return;
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
    } else if (activeTab === "festivals") {
      fetchFestivals();
    } else if (activeTab === "muhurat") {
      fetchMuhurat();
    } else if (activeTab === "auspicious") {
      fetchAuspicious();
    } else if (activeTab === "rahu") {
      fetchRahuYamagandam();
    }
  }, [
    activeTab,
    place,
    fetchFestivals,
    fetchMuhurat,
    fetchAuspicious,
    fetchRahuYamagandam,
  ]);

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
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
            <div className={cal.wrapper}>
            <div className={cal.locationCard}>
              <div className={cal.locationIcon} aria-hidden>📍</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={cal.locationLabel}>Birth place</div>
                {storedUser?.birthPlace ? (
                  <div className={cal.locationValue}>{place}</div>
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

            <div className={cal.tabRow}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={activeTab === t.id ? cal.activeTab : cal.tab}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TODAY */}
            {activeTab === "today" && (
              <div className={cal.todaySection}>
                {todayLoading && (
                  <div className={cal.loadingWrap}>
                    <Loading text="Loading today’s panchang..." variant="page" />
                  </div>
                )}
                {todayError && <p className={cal.errorMessage}>{todayError}</p>}
                {!todayLoading && todayData && (
                  <div className={cal.panchangHero}>
                    <div className={cal.panchangDate}>{todayData.date}</div>
                    <div className={cal.panchangSub}>
                      {todayData.moonPhase} · {todayData.tithi} · {todayData.nakshatra}
                    </div>
                    <div className={cal.panchangGrid}>
                      {todayData.tithi && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Tithi</div>
                          <div className={cal.panchangCellValue}>{todayData.tithi}</div>
                        </div>
                      )}
                      {todayData.nakshatra && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Nakshatra</div>
                          <div className={cal.panchangCellValue}>{todayData.nakshatra}</div>
                        </div>
                      )}
                      {todayData.moonPhase && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Moon phase</div>
                          <div className={cal.panchangCellValue}>{todayData.moonPhase}</div>
                        </div>
                      )}
                      {todayData.paksha && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Paksha</div>
                          <div className={cal.panchangCellValue}>{todayData.paksha}</div>
                        </div>
                      )}
                      {todayData.ritu && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Ritu</div>
                          <div className={cal.panchangCellValue}>{todayData.ritu}</div>
                        </div>
                      )}
                      {todayData.hinduMonth && (
                        <div className={cal.panchangCell}>
                          <div className={cal.panchangCellLabel}>Hindu month</div>
                          <div className={cal.panchangCellValue}>{todayData.hinduMonth}</div>
                        </div>
                      )}
                    </div>
                    {((todayData.sunrise ?? todayData.sunset) || (todayData.moonRise ?? todayData.moonSet)) && (
                      <div className={cal.timesRow}>
                        {(todayData.sunrise ?? todayData.sunset) && (
                          <div className={cal.timesCard}>
                            <div className={`${cal.timesIcon} ${cal.timesIconSun}`}>☀</div>
                            <div className={cal.timesText}>
                              {todayData.sunrise ? `Rise ${todayData.sunrise}` : ""}
                              {todayData.sunrise && todayData.sunset ? " · " : ""}
                              {todayData.sunset ? `Set ${todayData.sunset}` : ""}
                            </div>
                          </div>
                        )}
                        {(todayData.moonRise ?? todayData.moonSet) && (
                          <div className={cal.timesCard}>
                            <div className={`${cal.timesIcon} ${cal.timesIconMoon}`}>☽</div>
                            <div className={cal.timesText}>
                              {todayData.moonRise ? `Rise ${todayData.moonRise}` : ""}
                              {todayData.moonRise && todayData.moonSet ? " · " : ""}
                              {todayData.moonSet ? `Set ${todayData.moonSet}` : ""}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {todayData.majorPlanetaryEvents?.length > 0 && (
                      <div className={cal.eventsBlock}>
                        <div className={cal.eventsLabel}>Planetary events</div>
                        <div className={cal.eventsList}>
                          {todayData.majorPlanetaryEvents.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FESTIVALS */}
            {activeTab === "festivals" && (
              <>
                <div className={cal.filterBar}>
                  <label>
                    <input
                      type="radio"
                      checked={!festivalsByMonth}
                      onChange={() => setFestivalsByMonth(false)}
                    />
                    By date
                  </label>
                  <label>
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
                    className={cal.primaryButton}
                  >
                    {festivalsLoading ? "Loading…" : "Get festivals"}
                  </button>
                </div>
                {festivalsLoading && (
                  <div className={cal.loadingWrap}>
                    <Loading text="Loading festivals..." variant="page" />
                  </div>
                )}
                {festivalsError && <p className={cal.errorMessage}>{festivalsError}</p>}
                {!festivalsLoading && festivalsData?.festivals?.length === 0 && (
                  <p className={cal.emptyMessage}>No festivals found for this date.</p>
                )}
                {!festivalsLoading && festivalsData?.festivals && festivalsData.festivals.length > 0 && (
                  <div className={cal.festivalsGrid}>
                    {festivalsData.festivals.map((f, i) => (
                      <div key={i} className={cal.festivalCard}>
                        <div className={cal.festivalName}>{f.name}</div>
                        {f.note && <p className={cal.festivalNote}>{f.note}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* MUHURAT */}
            {activeTab === "muhurat" && (
              <>
                <div className={cal.filterBar}>
                  <label style={{ marginBottom: 0 }}>Date</label>
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
                    className={cal.primaryButton}
                  >
                    {muhuratLoading ? "Loading…" : "Get muhurat"}
                  </button>
                </div>
                {muhuratLoading && (
                  <div className={cal.loadingWrap}>
                    <Loading text="Loading muhurat..." variant="page" />
                  </div>
                )}
                {muhuratData && !muhuratLoading && (
                  <div className={cal.resultCard}>
                    <div className={cal.resultCardTitle}>Abhijit Muhurat</div>
                    <div className={cal.muhuratHighlight}>
                      <span className={cal.muhuratHighlightLabel}>Time (UTC)</span>
                      <span className={cal.muhuratHighlightTime}>
                        {muhuratData.abhijitMuhurat.start} – {muhuratData.abhijitMuhurat.end}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* AUSPICIOUS */}
            {activeTab === "auspicious" && (
              <>
                <div className={cal.filterBar}>
                  <label style={{ marginBottom: 0 }}>Date</label>
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
                    className={cal.primaryButton}
                  >
                    {auspiciousLoading ? "Checking…" : "Check auspicious"}
                  </button>
                </div>
                {auspiciousLoading && (
                  <div className={cal.loadingWrap}>
                    <Loading text="Checking..." variant="page" />
                  </div>
                )}
                {auspiciousData && !auspiciousLoading && (
                  <div className={cal.resultCard}>
                    <div className={cal.resultCardTitle}>
                      {auspiciousData.isAuspicious ? (
                        <span className={cal.auspiciousYes}>Auspicious day ✓</span>
                      ) : (
                        <span className={cal.auspiciousNo}>Not auspicious</span>
                      )}
                    </div>
                    <p className={cal.resultCardContent} style={{ marginTop: 8, marginBottom: 0 }}>
                      {auspiciousData.reason}
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === "rahu" && (
              <>
                <div className={cal.filterBar}>
                  <label style={{ marginBottom: 0 }}>Date</label>
                  <input
                    type="date"
                    className="formDateInput formDateInputInline"
                    value={rahuDate}
                    onChange={(e) => setRahuDate(e.target.value)}
                    aria-label="Date"
                  />
                  <label style={{ marginBottom: 0 }}>Birth place</label>
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
                    className={cal.primaryButton}
                  >
                    {rahuLoading ? "Loading…" : "Get Rahu Kaal / Yamagandam"}
                  </button>
                </div>
                {rahuLoading && (
                  <div className={cal.loadingWrap}>
                    <Loading text="Loading..." variant="page" />
                  </div>
                )}
                {rahuError && !rahuLoading && (
                  <p className={cal.errorMessage}>{rahuError}</p>
                )}
                {rahuData && !rahuLoading && (
                  <div className={cal.resultCard}>
                    <div className={cal.resultCardTitle}>{rahuData.date}</div>
                    <p className={cal.utcNote}>
                      Sun: Sunrise {rahuData.sunrise} · Sunset {rahuData.sunset} (UTC). Convert to your local time. These periods are traditionally considered inauspicious for starting important work.
                    </p>
                    <div className={cal.rahuBlock}>
                      <div className={cal.rahuBlockLabel}>Rahu Kaal</div>
                      <div className={cal.rahuBlockValue}>
                        {rahuData.rahuKaal.start} – {rahuData.rahuKaal.end}
                      </div>
                      {rahuData.rahuKaal.note && (
                        <p className={cal.rahuBlockNote}>{rahuData.rahuKaal.note}</p>
                      )}
                    </div>
                    <div className={`${cal.rahuBlock} ${cal.rahuBlockYama}`}>
                      <div className={cal.rahuBlockLabel}>Yamagandam</div>
                      <div className={cal.rahuBlockValue}>
                        {rahuData.yamagandam.start} – {rahuData.yamagandam.end}
                      </div>
                      {rahuData.yamagandam.note && (
                        <p className={cal.rahuBlockNote}>{rahuData.yamagandam.note}</p>
                      )}
                    </div>
                    {rahuData.source && (
                      <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>Source: {rahuData.source}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <CalculationInfo showDasha={false} showAyanamsa={true} note="Calendar data uses Swiss Ephemeris." />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}