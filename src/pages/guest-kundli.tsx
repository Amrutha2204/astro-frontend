import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { astroApi, KundliResponse } from "@/services/api";
import { onboardGuest } from "@/services/authService";
import { showError } from "@/utils/toast";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
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
  const [birthTime, setBirthTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [placeOfBirth, setPlaceOfBirth] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStoredState(getStored());
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !placeOfBirth.trim()) {
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
        dob: dob.trim(),
        birthTime: unknownTime ? undefined : birthTime.trim(),
        placeOfBirth: placeOfBirth.trim(),
        unknownTime: unknownTime || undefined,
      });
      const session: GuestSession = {
        birthDetails: {
          name: name.trim() || undefined,
          gender: gender || undefined,
          dob: dob.trim(),
          birthTime: unknownTime ? "12:00:00" : birthTime.trim(),
          placeOfBirth: placeOfBirth.trim(),
          unknownTime: unknownTime || undefined,
        },
        kundli,
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
    setBirthTime("");
    setUnknownTime(false);
    setPlaceOfBirth("");
  };

  const k = stored?.kundli;
  const b = stored?.birthDetails;

  const mainContent = !mounted ? (
    <div className={styles.loadingWrap}>Loading...</div>
  ) : stored && k && b ? (
    <div className={styles.resultWrapper}>
            <button type="button" className={styles.calculateNewBtn} onClick={handleCalculateNew}>
              Enter different details
            </button>
            <div className={dStyles.kundliContainer}>
              <h1 className={dStyles.pageTitle}>
                {b.name
                  ? `Kundli for ${b.name}${b.gender ? ` (${b.gender === "male" ? "Male" : "Female"})` : ""}`
                  : "Your Kundli"}
              </h1>
              <div className={dStyles.kundliContent}>
                <div className={dStyles.kundliSection}>
                  <h2 className={dStyles.sectionTitle}>Chart overview</h2>
                  <div className={dStyles.infoGrid}>
                    <div className={dStyles.infoItem}>
                      <span className={dStyles.infoLabel}>Lagna (Ascendant):</span>
                      <span className={dStyles.infoValue}>{k.lagna || "N/A"}</span>
                    </div>
                    <div className={dStyles.infoItem}>
                      <span className={dStyles.infoLabel}>Moon Sign:</span>
                      <span className={dStyles.infoValue}>{k.moonSign || "N/A"}</span>
                    </div>
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
                  </div>
                </div>

                {k.planetaryPositions && Array.isArray(k.planetaryPositions) && k.planetaryPositions.length > 0 && (
                  <div className={dStyles.kundliSection}>
                    <h2 className={dStyles.sectionTitle}>Planet positions</h2>
                    <div className={dStyles.planetsGrid}>
                      {k.planetaryPositions.map((planetData) => (
                        <div key={planetData.planet} className={dStyles.planetCard}>
                          <div className={dStyles.planetName}>{planetData.planet}</div>
                          <div className={dStyles.planetSign}>{planetData.sign}</div>
                          {typeof planetData.degree === "number" && (
                            <div className={dStyles.planetDegree}>
                              {planetData.degree.toFixed(2)}°
                            </div>
                          )}
                          {planetData.nakshatra && (
                            <div className={dStyles.planetNakshatra}>
                              {planetData.nakshatra}
                              {planetData.pada ? ` - Pada ${planetData.pada}` : ""}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {k.houses && Array.isArray(k.houses) && k.houses.length > 0 && (
                  <div className={dStyles.kundliSection}>
                    <h2 className={dStyles.sectionTitle}>Houses</h2>
                    <div className={dStyles.housesGrid}>
                      {k.houses.map((houseData) => (
                        <div key={houseData.house} className={dStyles.houseCard}>
                          <div className={dStyles.houseNumber}>House {houseData.house}</div>
                          <div className={dStyles.houseSign}>{houseData.sign}</div>
                          <div className={dStyles.houseCusp}>
                            {typeof houseData.degree === "number"
                              ? `${houseData.degree.toFixed(2)}°`
                              : "N/A"}
                          </div>
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
              className={formStyles.input}
              value={gender}
              onChange={(e) => setGender((e.target.value || "") as "male" | "female" | "")}
            >
              <option value="">— Select —</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <label className={formStyles.label}>Birth date *</label>
            <input
              type="date"
              className={formStyles.input}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />

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
                <input
                  type="time"
                  className={formStyles.input}
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  step="1"
                  required
                />
                <p className={formStyles.hint}>Use hours and minutes; add seconds if known for better accuracy.</p>
              </>
            )}
            {unknownTime && (
              <p className={formStyles.hint}>Noon (12:00) will be used — Lagna and house positions may be approximate.</p>
            )}

            <label className={formStyles.label}>Birth place (city) *</label>
            <input
              type="text"
              className={formStyles.input}
              value={placeOfBirth}
              onChange={(e) => setPlaceOfBirth(e.target.value)}
              placeholder="e.g. Mumbai, Delhi"
              minLength={3}
              required
            />
            <p className={formStyles.hint}>City name is used to fetch coordinates for accurate planetary positions.</p>

            {error && <p className="text-amber-900 text-sm mb-3">{error}</p>}

            <button type="submit" className={formStyles.button} disabled={loading}>
              {loading ? "Calculating…" : "Get My Kundli"}
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
