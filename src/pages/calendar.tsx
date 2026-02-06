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
} from "@/services/api";

type TabId = "today" | "festivals" | "muhurat" | "auspicious";

function getTodayStr(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function getMonthStr(): string {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

export default function CalendarPage() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [place, setPlace] = useState("Delhi");

  const [todayLoading, setTodayLoading] = useState(true);
  const [todayData, setTodayData] = useState<GuestCalendarResponse | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);

  const [festDate, setFestDate] = useState(getTodayStr());
  const [festMonth, setFestMonth] = useState(getMonthStr());
  const [festivalsLoading, setFestivalsLoading] = useState(false);
  const [festivalsData, setFestivalsData] = useState<FestivalsResponse | null>(null);
  const [festivalsError, setFestivalsError] = useState<string | null>(null);
  const [festivalsByMonth, setFestivalsByMonth] = useState(false);

  const [muhuratDate, setMuhuratDate] = useState(getTodayStr());
  const [muhuratLoading, setMuhuratLoading] = useState(false);
  const [muhuratData, setMuhuratData] = useState<MuhuratResponse | null>(null);
  const [muhuratError, setMuhuratError] = useState<string | null>(null);

  const [auspiciousDate, setAuspiciousDate] = useState(getTodayStr());
  const [auspiciousLoading, setAuspiciousLoading] = useState(false);
  const [auspiciousData, setAuspiciousData] = useState<AuspiciousDayResponse | null>(null);
  const [auspiciousError, setAuspiciousError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab !== "today") return;
    const fetchToday = async () => {
      try {
        setTodayLoading(true);
        setTodayError(null);
        const data = await astroApi.getGuestCalendar(place);
        setTodayData(data);
      } catch (e) {
        setTodayError(e instanceof Error ? e.message : "Failed to load calendar");
      } finally {
        setTodayLoading(false);
      }
    };
    fetchToday();
  }, [activeTab, place]);

  const fetchFestivals = async () => {
    try {
      setFestivalsLoading(true);
      setFestivalsError(null);
      const dateOrMonth = festivalsByMonth ? festMonth : festDate;
      const data = await astroApi.getFestivals(dateOrMonth);
      setFestivalsData(data);
    } catch (e) {
      setFestivalsError(e instanceof Error ? e.message : "Failed to load festivals");
    } finally {
      setFestivalsLoading(false);
    }
  };

  const fetchMuhurat = async () => {
    try {
      setMuhuratLoading(true);
      setMuhuratError(null);
      const data = await astroApi.getMuhurat(muhuratDate, place);
      setMuhuratData(data);
    } catch (e) {
      setMuhuratError(e instanceof Error ? e.message : "Failed to load muhurat");
    } finally {
      setMuhuratLoading(false);
    }
  };

  const fetchAuspicious = async () => {
    try {
      setAuspiciousLoading(true);
      setAuspiciousError(null);
      const data = await astroApi.getAuspiciousDay(auspiciousDate, place);
      setAuspiciousData(data);
    } catch (e) {
      setAuspiciousError(e instanceof Error ? e.message : "Failed to check auspicious day");
    } finally {
      setAuspiciousLoading(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "festivals", label: "Festivals" },
    { id: "muhurat", label: "Muhurat" },
    { id: "auspicious", label: "Auspicious Day" },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />

      <div className={styles.dashboardContent}>
        <AppSidebar />

        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <h1 className={styles.pageTitle}>Festival Calendar</h1>

            <div className={styles.formTabs} style={{ borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={activeTab === t.id ? styles.activeTab : styles.tab}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === "today" && (
              <>
                <div className={styles.formRow} style={{ marginBottom: 16, maxWidth: 400 }}>
                  <div className={styles.searchForm} style={{ alignItems: "center", gap: 12 }}>
                    <label className={formStyles.label} style={{ marginBottom: 0 }}>Place</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="e.g. Delhi"
                      style={{ marginBottom: 0, maxWidth: 200 }}
                    />
                  </div>
                </div>
                {todayLoading && (
                  <div className={styles.loadingContainer}>
                    <p><span className={styles.loadingSpinner} /> Loading today&apos;s calendar…</p>
                  </div>
                )}
                {!todayLoading && todayError && (
                  <div className={styles.noDataContainer}>
                    <div className={styles.noDataIcon}>⚠️</div>
                    <h3 className={styles.noDataTitle}>Error</h3>
                    <p className={styles.noDataMessage}>{todayError}</p>
                  </div>
                )}
                {!todayLoading && todayData && !todayError && (
                  <>
                    <span className={styles.youAreHereBadge}>Today</span>
                    <p className={styles.explanationLine}>
                      Moon phase, tithi, nakshatra and major events for your chosen place.
                    </p>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>{todayData.date}</span>
                      <span style={{ fontSize: 14, color: "#6b7280" }}>
                        {todayData.moonPhase} · {todayData.tithi} · {todayData.nakshatra}
                      </span>
                    </div>
                    {todayData.majorPlanetaryEvents?.length > 0 && (
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Events</span>
                        <span className={styles.infoValue}>{todayData.majorPlanetaryEvents.join(", ")}</span>
                      </div>
                    )}
                    {todayData.source && (
                      <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>Source: {todayData.source}</p>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "festivals" && (
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      checked={!festivalsByMonth}
                      onChange={() => setFestivalsByMonth(false)}
                    />
                    By date
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      checked={festivalsByMonth}
                      onChange={() => setFestivalsByMonth(true)}
                    />
                    By month
                  </label>
                  {festivalsByMonth ? (
                    <input
                      type="month"
                      className={formStyles.input}
                      value={festMonth}
                      onChange={(e) => setFestMonth(e.target.value)}
                      style={{ marginBottom: 0, maxWidth: 180 }}
                    />
                  ) : (
                    <input
                      type="date"
                      className={formStyles.input}
                      value={festDate}
                      onChange={(e) => setFestDate(e.target.value)}
                      style={{ marginBottom: 0, maxWidth: 180 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={fetchFestivals}
                    disabled={festivalsLoading}
                    className={styles.retryButton}
                  >
                    {festivalsLoading ? "Loading…" : "Get Festivals"}
                  </button>
                </div>
                {festivalsError && (
                  <p className={styles.noDataMessage} style={{ marginBottom: 12 }}>{festivalsError}</p>
                )}
                {festivalsData && (
                  <>
                    <h3 className={styles.sectionTitle}>
                      Festivals {festivalsByMonth ? `in ${festivalsData.dateOrMonth}` : `on ${festivalsData.dateOrMonth}`}
                    </h3>
                    {festivalsData.festivals.length === 0 ? (
                      <p className={styles.noDataMessage}>No festivals found for this date or month.</p>
                    ) : (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {festivalsData.festivals.map((f, i) => (
                          <li key={i} className={styles.infoItem} style={{ marginBottom: 10 }}>
                            <span className={styles.cardTitle}>{f.name}</span>
                            {f.note && (
                              <span className={styles.cardDescription} style={{ marginTop: 4, display: "block" }}>
                                {f.note}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </>
            )}

            {activeTab === "muhurat" && (
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <label className={formStyles.label} style={{ marginBottom: 0 }}>Date</label>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={muhuratDate}
                    onChange={(e) => setMuhuratDate(e.target.value)}
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
                    onClick={fetchMuhurat}
                    disabled={muhuratLoading}
                    className={styles.retryButton}
                  >
                    {muhuratLoading ? "Loading…" : "Get Muhurat"}
                  </button>
                </div>
                {muhuratError && (
                  <p className={styles.noDataMessage} style={{ marginBottom: 12 }}>{muhuratError}</p>
                )}
                {muhuratData && (
                  <>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>{muhuratData.date}</span>
                    </div>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Sun (UTC)</span>
                      <span className={styles.infoValue}>
                        Sunrise {muhuratData.sunrise} · Sunset {muhuratData.sunset} · Solar noon {muhuratData.solarNoon}
                      </span>
                    </div>
                    <div className={styles.infoItem} style={{ marginBottom: 12 }}>
                      <span className={styles.infoLabel}>Abhijit Muhurat (UTC)</span>
                      <span className={styles.infoValue}>
                        {muhuratData.abhijitMuhurat.start} – {muhuratData.abhijitMuhurat.end}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle} style={{ marginBottom: 10 }}>Good periods (UTC)</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {muhuratData.goodPeriods.map((p, i) => (
                        <li key={i} className={styles.infoItem} style={{ marginBottom: 8 }}>
                          <span className={styles.infoLabel}>{p.name}</span>
                          <span className={styles.infoValue}>{p.start} – {p.end}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {activeTab === "auspicious" && (
              <>
                <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <label className={formStyles.label} style={{ marginBottom: 0 }}>Date</label>
                  <input
                    type="date"
                    className={formStyles.input}
                    value={auspiciousDate}
                    onChange={(e) => setAuspiciousDate(e.target.value)}
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
                    onClick={fetchAuspicious}
                    disabled={auspiciousLoading}
                    className={styles.retryButton}
                  >
                    {auspiciousLoading ? "Loading…" : "Check"}
                  </button>
                </div>
                {auspiciousError && (
                  <p className={styles.noDataMessage} style={{ marginBottom: 12 }}>{auspiciousError}</p>
                )}
                {auspiciousData && (
                  <>
                    <div
                      className={styles.infoItem}
                      style={{
                        marginBottom: 12,
                        borderLeftColor: auspiciousData.isAuspicious ? "#10b981" : "#6b4423",
                      }}
                    >
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>{auspiciousData.date}</span>
                      <span
                        className={styles.doshaBadge}
                        style={{
                          background: auspiciousData.isAuspicious ? "#10b981" : "#6b4423",
                          color: "#fff",
                          padding: "4px 12px",
                          borderRadius: 12,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginTop: 8,
                          display: "inline-block",
                        }}
                      >
                        {auspiciousData.isAuspicious ? "Auspicious" : "Not auspicious"}
                      </span>
                      {(auspiciousData.tithi || auspiciousData.nakshatra) && (
                        <p className={styles.cardDescription} style={{ marginTop: 8, marginBottom: 0 }}>
                          {auspiciousData.tithi && `Tithi: ${auspiciousData.tithi}`}
                          {auspiciousData.tithi && auspiciousData.nakshatra && " · "}
                          {auspiciousData.nakshatra && `Nakshatra: ${auspiciousData.nakshatra}`}
                        </p>
                      )}
                    </div>
                    <p className={styles.explanationLine}>{auspiciousData.reason}</p>
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
