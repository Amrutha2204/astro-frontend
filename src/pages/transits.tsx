import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import dashboardStyles from "@/styles/dashboard.module.css";
import styles from "@/styles/transits.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Loading from "@/components/ui/Loading";
import {
  astroApi,
  TransitsTodayResponse,
  RetrogradesResponse,
  MajorTransitsResponse,
  Eclipse,
} from "@/services/api";

type TabId = "today" | "retrogrades" | "major" | "eclipses";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function groupByMonth<T extends { date?: string; startDate?: string }>(items: T[]) {
  const map: Record<string, T[]> = {};
  items.forEach((item) => {
    const raw = item.date || item.startDate;
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    const key = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const planetImages: Record<string, string> = {
  Sun: "/images/sun-transit.png",
  Moon: "/images/moon-transit.jpg",
  Mercury: "/images/mercury.jpg",
  Venus: "/images/venus-transit.jpg",
  Mars: "/images/mars-transit.jpg",
  Jupiter: "/images/jupiter-transit.jpg",
  Saturn: "/images/saturn-transit.jpg",
  Uranus: "/images/uranus-transit.jpg",
  Neptune: "/images/neptune-transit.jpg",
  Pluto: "/images/pluto-transit.jpg",
  Rahu: "/images/rahu-transit.jpg",
  Ketu: "/images/ketu-transit.jpg",
};

export default function TransitsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState("");
  const [storedUser, setStoredUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("today");

  /* TODAY */
  const [todayData, setTodayData] = useState<TransitsTodayResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  /* RETROGRADES */
  const [retroFrom, setRetroFrom] = useState(todayStr());
  const [retroTo, setRetroTo] = useState(todayStr());
  const [retroData, setRetroData] = useState<RetrogradesResponse["retrogrades"]>([]);

  /* MAJOR */
  const [majorFrom, setMajorFrom] = useState(todayStr());
  const [majorTo, setMajorTo] = useState(todayStr());
  const [majorData, setMajorData] = useState<MajorTransitsResponse["transits"]>([]);
  const [majorLoading, setMajorLoading] = useState(false);
  const [majorError, setMajorError] = useState<string | null>(null);

  /* ECLIPSES */
  const [eclipseFrom, setEclipseFrom] = useState("1900-01-01");
  const [eclipseTo, setEclipseTo] = useState("2100-01-01");
  const [solarEclipses, setSolarEclipses] = useState<Eclipse[]>([]);
  const [lunarEclipses, setLunarEclipses] = useState<Eclipse[]>([]);

  useEffect(() => {
    astroApi
      .getTransitsToday()
      .then(setTodayData)
      .catch(() => {
        setError("Unable to load transits. Please try again later.");
      });
  }, []);

  useEffect(() => {
    setIsMounted(true);

    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setStoredUser(parsed);
      setPlace(parsed.birthPlace || "");
    }
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

  useEffect(() => {
  loadEclipses();
}, []);

useEffect(() => {
  if (activeTab === "eclipses") {
    loadEclipses();
  }
}, [activeTab]);

  const loadRetrogrades = async () => {
     if (!place) {
    setError("Please enter birth place");
    return;
  }
  try {
    const data = await astroApi.getRetrogrades(retroFrom, retroTo);
    setRetroData(data.retrogrades);
  } catch {
    setError("Unable to load retrogrades. Please try again later.");
  }
};

  const loadMajor = async () => {
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
  };

  const loadEclipses = async () => {
  try {
    const data = await astroApi.getEclipses(eclipseFrom);

    setSolarEclipses(data.solar || []);
    setLunarEclipses(data.lunar || []);

  } catch {
    setError("Unable to load eclipses. Please try again later.");
  }
};

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
    } else if (activeTab === "retrogrades") {
      loadRetrogrades();
    } else if (activeTab === "major") {
      loadMajor();
    } else if (activeTab === "eclipses") {
      loadEclipses();
    }
  }, [activeTab, loadRetrogrades, loadMajor, loadEclipses]);

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.dashboardContent}>
        <AppSidebar />
        <main className={dashboardStyles.mainContent}>
          <PageHeader
            onBack={() => router.push("/dashboard")}
            backAriaLabel="Go back to dashboard"
            onRefresh={handleRefresh}
            refreshAriaLabel="Refresh transits"
            disableRefresh={loading || majorLoading}
          />
          <h1 className={styles.pageTitle}>Planetary Transits</h1>
          {loading && <div>Loading...</div>}
          <div className={styles.birthPlaceCard}>
  <p className={styles.birthPlaceLabel}>BIRTH PLACE</p>

  {storedUser?.birthPlace ? (
    <h3 className={styles.birthPlaceValue}>{place}</h3>
  ) : (
    <input
      className={styles.birthPlaceInput}
      type="text"
      placeholder="Enter birth place"
      value={place}
      onChange={(e) => setPlace(e.target.value)}
    />
  )}
</div>
          {error && <ErrorMessage message={error} />}
          <div className={styles.tabs}>
            {[
              { id: "today", label: "Today" },
              { id: "eclipses", label: "Eclipses" },
              { id: "retrogrades", label: "Retrogrades" },
              { id: "major", label: "Major Transits" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabId)}
                className={`${styles.tab} ${activeTab === t.id ? styles.activeTab : ""}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TODAY */}
          {activeTab === "today" && todayData && (
  <div className={styles.cardGrid}>
    {Object.values(todayData.currentPlanetPositions || {}).map((p) => (
      <div key={p.name} className={styles.card}
      style={{
    backgroundImage: `url(${planetImages[p.name]})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right bottom",
    backgroundSize: "150px",
  }}>

        <span className={styles.badge}>Planet</span>

        <h4>{p.name}</h4>

        <p>{p.sign.name}</p>

      </div>
    ))}
  </div>
)}

          {/* RETROGRADES */}
          {activeTab === "retrogrades" && (
            <>
              <div className={styles.filterCard}>
                <h3>🔁 Retrogrades</h3>
                <div className={styles.filters}>
                  <div className={styles.dateBox}>
                    <input type="date" className="formDateInput" value={retroFrom} onChange={(e) => setRetroFrom(e.target.value)} />
                  </div>
                  <div className={styles.dateBox}>
                    <input type="date" className="formDateInput" value={retroTo} onChange={(e) => setRetroTo(e.target.value)} />
                  </div>
                  <button className={styles.primaryButton} onClick={loadRetrogrades}>Get Retrogrades</button>
                </div>
              </div>

              {Object.entries(groupByMonth(retroData)).map(([month, list]) => (
                <div key={month}>
                  <h3 className={styles.monthHeader}>📅 {month}</h3>
                  <div className={styles.cardGrid}>
                    {list.map((r) => (
                      <div key={r.planet + r.startDate} className={styles.card}>
                        <span className={styles.badge}>Retrograde</span>
                        <h4>{r.planet}</h4>
                        <p>{r.description}</p>
                        <p><strong>From:</strong> {formatDate(r.startDate)} | <strong>To:</strong> {formatDate(r.endDate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* MAJOR TRANSITS */}
          {activeTab === "major" && (
            <>
              <div className={styles.filterCard}>
                <h3>🔱 Major Transits</h3>
                <div className={styles.filters}>
                  <div className={styles.dateBox}>
                    <input type="date" className="formDateInput" value={majorFrom} onChange={(e) => setMajorFrom(e.target.value)} />
                  </div>
                  <div className={styles.dateBox}>
                    <input type="date" className="formDateInput" value={majorTo} onChange={(e) => setMajorTo(e.target.value)} />
                  </div>
                  <button className={styles.primaryButton} onClick={loadMajor} disabled={majorLoading}>
                    {majorLoading ? "Loading…" : "Get Transits"}
                  </button>
                </div>
                {majorError && (
                  <p className={styles.errorText} role="alert">
                    {majorError}
                  </p>
                )}
                <p className={styles.hintText}>
                  Use a range of at least a few days to see Jupiter/Saturn sign changes. Same start and end date shows transits that occurred on that day.
                </p>
              </div>

              {majorLoading ? null : Object.keys(groupByMonth(majorData)).length === 0 && !majorError ? (
                <p className={styles.emptyText}>No major sign changes (Jupiter, Saturn) in this date range. Try a wider range (e.g. 1–2 months).</p>
              ) : null}

              {Object.entries(groupByMonth(majorData)).map(([month, list]) => (
                <div key={month}>
                  <h3 className={styles.monthHeader}>📅 {month}</h3>
                  <div className={styles.cardGrid}>
                    {list.map((m) => (
                      <div key={m.planet + m.date} className={styles.card}>
                        <span className={styles.badge}>Major</span>
                        <h4>{m.planet}</h4>
                        <p>{m.description}</p>
                        <p><strong>Date:</strong> {formatDate(m.date)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ECLIPSES */}
          {activeTab === "eclipses" && (
            <>
              <div className={styles.filterCard}>
                <h3>🌘 Eclipses</h3>
                <div className={styles.filters}>
                  <div className={styles.dateInputGroup}>
                    <label className={styles.dateLabel}>From</label>
                    <div className={styles.dateBox}>
                      <input type="date" value={eclipseFrom} onChange={(e) => setEclipseFrom(e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.dateInputGroup}>
                    <label className={styles.dateLabel}>To</label>
                    <div className={styles.dateBox}>
                      <input type="date" value={eclipseTo} onChange={(e) => setEclipseTo(e.target.value)} />
                    </div>
                  </div>
                  <button className={styles.primaryButton} onClick={loadEclipses}>Get Eclipses</button>
                </div>
              </div>

              <div className={styles.eclipseContainer}>
                <div className={styles.eclipseSection}>
                  <h3 className={styles.eclipseTitle}>🌞 Solar Eclipses</h3>
                  {solarEclipses.length > 0 ? (
                    <div className={styles.cardGrid}>
                      {solarEclipses
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((e) => (
                        <div key={e.date} className={`${styles.card} ${styles.eclipseCard} ${styles.solarCard}`}>
                          <div className={styles.eclipseBadgeContainer}>
                            <span className={styles.badge}>Solar</span>
                          </div>
                          <div className={styles.eclipseContent}>
                            <h4 className={styles.eclipseDate}>{formatDate(e.date)}</h4>
                            <p className={styles.eclipseType}>{e.type}</p>
                            <div className={styles.eclipseDetails}>
                              {e.maximum && <p><strong>Max:</strong> {new Date(e.maximum).toLocaleTimeString()}</p>}
                              {e.umbralMagnitude !== undefined && <p><strong>Umbral:</strong> {e.umbralMagnitude.toFixed(2)}</p>}
                              {e.penumbralMagnitude !== undefined && <p><strong>Penumbral:</strong> {e.penumbralMagnitude.toFixed(3)}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noEclipses}>No solar eclipses in this period</p>
                  )}
                </div>

                <div className={styles.eclipseSection}>
                  <h3 className={styles.eclipseTitle}>🌕 Lunar Eclipses</h3>
                  {lunarEclipses.length > 0 ? (
                    <div className={styles.cardGrid}>
                      {lunarEclipses
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((e) => (
                        <div key={e.date} className={`${styles.card} ${styles.eclipseCard} ${styles.lunarCard}`}>
                          <div className={styles.eclipseBadgeContainer}>
                            <span className={styles.badge}>Lunar</span>
                          </div>
                          <div className={styles.eclipseContent}>
                            <h4 className={styles.eclipseDate}>{formatDate(e.date)}</h4>
                            <p className={styles.eclipseType}>{e.type}</p>
                            <div className={styles.eclipseDetails}>
                              {e.maximum && <p><strong>Max:</strong> {new Date(e.maximum).toLocaleTimeString()}</p>}
                              {e.umbralMagnitude !== undefined && <p><strong>Umbral:</strong> {e.umbralMagnitude.toFixed(2)}</p>}
                              {e.penumbralMagnitude !== undefined && <p><strong>Penumbral:</strong> {e.penumbralMagnitude.toFixed(3)}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noEclipses}>No lunar eclipses in this period</p>
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