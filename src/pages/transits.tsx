import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
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

export default function TransitsPage() {
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
  const [eclipseFrom, setEclipseFrom] = useState(todayStr());
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
     if (!place) {
    setError("Please enter birth place");
    return;
  }
  try {
    const data = await astroApi.getEclipses(eclipseFrom);
    setSolarEclipses(data.solar);
    setLunarEclipses(data.lunar);
  } catch {
    setError("Unable to load eclipses. Please try again later.");
  }
};

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <AppHeader />
      <div className={dashboardStyles.dashboardContent}>
        <AppSidebar />
        <main className={dashboardStyles.mainContent}>
          <h1 className={styles.pageTitle}>Planetary Transits</h1>
          {loading && <div>Loading...</div>}
          <div className={styles.filterCard}>
          <h3>📍 Birth Place</h3>

          {storedUser?.birthPlace ? (
          <p><strong>{place}</strong></p>
        ) : (
        <input
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
              { id: "retrogrades", label: "Retrogrades" },
              { id: "major", label: "Major Transits" },
              { id: "eclipses", label: "Eclipses" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as TabId)}
                className={activeTab === t.id ? styles.activeTab : styles.tab}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TODAY */}
          {activeTab === "today" && todayData && (
            <div className={styles.cardGrid}>
              {Object.values(todayData.currentPlanetPositions || {}).map((p) => (
                <div key={p.name} className={styles.card}>
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
                    <input type="date" value={retroFrom} onChange={(e) => setRetroFrom(e.target.value)} />
                  </div>
                  <div className={styles.dateBox}>
                    <input type="date" value={retroTo} onChange={(e) => setRetroTo(e.target.value)} />
                  </div>
                  <button onClick={loadRetrogrades}>Get Retrogrades</button>
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
                    <input type="date" value={majorFrom} onChange={(e) => setMajorFrom(e.target.value)} />
                  </div>
                  <div className={styles.dateBox}>
                    <input type="date" value={majorTo} onChange={(e) => setMajorTo(e.target.value)} />
                  </div>
                  <button onClick={loadMajor} disabled={majorLoading}>
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
                  <div className={styles.dateBox}>
                    <input type="date" value={eclipseFrom} onChange={(e) => setEclipseFrom(e.target.value)} />
                  </div>
                  <button onClick={loadEclipses}>Get Eclipses</button>
                </div>
              </div>

              <h3 className={styles.monthHeader}>🌞 Solar Eclipses</h3>
              <div className={styles.cardGrid}>
                {solarEclipses.map((e) => (
                  <div key={e.date} className={styles.card}>
                    <span className={styles.badge}>Solar</span>
                    <h4>{formatDate(e.date)}</h4>
                    <p>{e.type}</p>
                  </div>
                ))}
              </div>

              <h3 className={styles.monthHeader}>🌕 Lunar Eclipses</h3>
              <div className={styles.cardGrid}>
                {lunarEclipses.map((e) => (
                  <div key={e.date} className={styles.card}>
                    <span className={styles.badge}>Lunar</span>
                    <h4>{formatDate(e.date)}</h4>
                    <p><strong>Type:</strong> {e.type}</p>
                    <p><strong>Maximum:</strong> {e.maximum ? new Date(e.maximum).toLocaleString() : "-"}</p>
                    {e.umbralMagnitude !== undefined && <p><strong>Umbral Mag:</strong> {e.umbralMagnitude}</p>}
                    {e.penumbralMagnitude !== undefined && <p><strong>Penumbral Mag:</strong> {e.penumbralMagnitude.toFixed(3)}</p>}
                    {e.sarosNumber && <p><strong>Saros:</strong> {e.sarosNumber} / {e.sarosMember}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          <CalculationInfo showDasha={false} showAyanamsa />
        </main>
      </div>
    </div>
  );
}