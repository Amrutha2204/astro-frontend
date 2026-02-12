import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";
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

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <h1 className={styles.pageTitle}>Calendar</h1>
            <div className={styles.infoItem} style={{ marginBottom: 16 }}>
  <span className={styles.infoLabel}>Birth Place</span>

  {storedUser?.birthPlace ? (
    <span className={styles.infoValue}>{place}</span>
  ) : (
    <input
      type="text"
      placeholder="Enter birth place"
      value={place}
      onChange={(e) => setPlace(e.target.value)}
      className={formStyles.input}
    />
  )}
</div>

            {/* Tabs */}
            <div className={styles.formTabs}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={activeTab === t.id ? styles.activeTab : styles.tab}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TODAY */}
            {activeTab === "today" && (
  <>
    {todayLoading && <p>Loading today calendar...</p>}

    {todayError && <p className={styles.noDataMessage}>{todayError}</p>}

    {!todayLoading && todayData && (
      <div className={styles.infoCard}>
        <h3>{todayData.date}</h3>
        <p>
          {todayData.moonPhase} · {todayData.tithi} · {todayData.nakshatra}
        </p>

        {todayData.majorPlanetaryEvents?.length > 0 && (
          <p>
            <strong>Events:</strong>{" "}
            {todayData.majorPlanetaryEvents.join(", ")}
          </p>
        )}
      </div>
    )}
  </>
)}

            {/* FESTIVALS */}
           {activeTab === "festivals" && (
  <>
    {/* Toggle */}
    <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
      <label>
        <input
          type="radio"
          checked={!festivalsByMonth}
          onChange={() => setFestivalsByMonth(false)}
        />{" "}
        By Date
      </label>

      <label>
        <input
          type="radio"
          checked={festivalsByMonth}
          onChange={() => setFestivalsByMonth(true)}
        />{" "}
        By Month
      </label>
    </div>

    {/* Date / Month Input */}
    <input
      type={festivalsByMonth ? "month" : "date"}
      value={festivalsByMonth ? festMonth : festDate}
      onChange={(e) =>
        festivalsByMonth
          ? setFestMonth(e.target.value)
          : setFestDate(e.target.value)
      }
      className={formStyles.input}
    />

    <button onClick={fetchFestivals} className={styles.retryButton}>
      Get Festivals
    </button>

    {festivalsLoading && <p>Loading festivals...</p>}

{festivalsError && (
  <p className={styles.noDataMessage}>{festivalsError}</p>
)}

{festivalsData?.festivals?.length === 0 && (
  <p className={styles.noDataMessage}>No festivals found</p>
)}

{festivalsData?.festivals?.map((f, i) => (
  <div key={i} className={styles.infoItem}>
    <strong>{f.name}</strong>
    {f.note && <p>{f.note}</p>}
  </div>
))}
  </>
)}

            {/* MUHURAT */}
            {activeTab === "muhurat" && (
              <>
                <input
                  type="date"
                  value={muhuratDate}
                  onChange={(e) => setMuhuratDate(e.target.value)}
                  className={formStyles.input}
                />
                <button onClick={fetchMuhurat} className={styles.retryButton}>
                  Get Muhurat
                </button>

                {muhuratData && (
                  <div className={styles.infoCard}>
                    <p>
                      Abhijit: {muhuratData.abhijitMuhurat.start} –{" "}
                      {muhuratData.abhijitMuhurat.end}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* AUSPICIOUS */}
            {activeTab === "auspicious" && (
              <>
                <input
                  type="date"
                  value={auspiciousDate}
                  onChange={(e) => setAuspiciousDate(e.target.value)}
                  className={formStyles.input}
                />
                <button onClick={fetchAuspicious} className={styles.retryButton}>
                  Check
                </button>

                {auspiciousData && (
                  <div className={styles.infoCard}>
                    <strong>
                      {auspiciousData.isAuspicious
                        ? "Auspicious Day ✅"
                        : "Not Auspicious ❌"}
                    </strong>
                    <p>{auspiciousData.reason}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "rahu" && (
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <label className={formStyles.label} style={{ marginBottom: 0 }}>Date</label>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={rahuDate}
                    onChange={(e) => setRahuDate(e.target.value)}
                    style={{ marginBottom: 0, maxWidth: 160 }}
                  />
                  <label className={formStyles.label} style={{ marginBottom: 0 }}>Place</label>
                  <input
                    type="text"
                    className={formStyles.input}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="Delhi"
                    style={{ marginBottom: 0, maxWidth: 140 }}
                  />
                  <button
                    type="button"
                    onClick={fetchRahuYamagandam}
                    disabled={rahuLoading}
                    className={styles.retryButton}
                  >
                    {rahuLoading ? "Loading…" : "Get Rahu Kaal / Yamagandam"}
                  </button>
                </div>
                {rahuError && (
                  <p className={styles.noDataMessage} style={{ marginBottom: 12 }}>{rahuError}</p>
                )}
                {rahuData && (
                  <>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>{rahuData.date}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Sun (UTC)</span>
                      <span className={styles.infoValue}>
                        Sunrise {rahuData.sunrise} · Sunset {rahuData.sunset}
                      </span>
                    </div>
                    <p className={styles.explanationLine} style={{ marginBottom: 16, fontSize: 13 }}>
                      Times are in UTC. Convert to your local time zone. These periods are traditionally considered inauspicious for starting important work.
                    </p>
                    <div className={styles.infoItem} style={{ marginBottom: 12, borderLeft: "4px solid #b45309" }}>
                      <span className={styles.infoLabel}>Rahu Kaal</span>
                      <span className={styles.infoValue}>
                        {rahuData.rahuKaal.start} – {rahuData.rahuKaal.end}
                      </span>
                      <p className={styles.cardDescription} style={{ marginTop: 8, marginBottom: 0 }}>
                        {rahuData.rahuKaal.note}
                      </p>
                    </div>
                    <div className={styles.infoItem} style={{ marginBottom: 12, borderLeft: "4px solid #92400e" }}>
                      <span className={styles.infoLabel}>Yamagandam</span>
                      <span className={styles.infoValue}>
                        {rahuData.yamagandam.start} – {rahuData.yamagandam.end}
                      </span>
                      <p className={styles.cardDescription} style={{ marginTop: 8, marginBottom: 0 }}>
                        {rahuData.yamagandam.note}
                      </p>
                    </div>
                    {rahuData.source && (
                      <p style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>Source: {rahuData.source}</p>
                    )}
                  </>
                )}
              </>
            )}

            <CalculationInfo showDasha={false} showAyanamsa={true} note="Calendar data uses Swiss Ephemeris." />
          </div>
        </main>
      </div>
    </div>
  );
}