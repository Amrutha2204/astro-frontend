import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { astroApi, CreateShareableCardDto, StoredCardResponse } from "@/services/api";
import { ASTRO_BASE } from "@/services/fetcher";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import formStyles from "@/styles/birthDetails.module.css";

const REDIRECT_DELAY_MS = 2000;

function getDefaultDate(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

export default function ShareableCardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [type, setType] = useState<"horoscope" | "kundli_summary">("horoscope");
  const [title, setTitle] = useState("Today's Horoscope");
  const [date, setDate] = useState("");
  const [dayType, setDayType] = useState("");
  const [mainTheme, setMainTheme] = useState("");
  const [reason, setReason] = useState("");
  const [kundliPayload, setKundliPayload] = useState(
    "moonSign: Cancer\nsunSign: Leo\nlagna: Virgo"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<StoredCardResponse | null>(null);

  useEffect(() => {
    setDate(getDefaultDate());
  }, []);

  useEffect(() => {
    if (!rehydrated) return;
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
    }
  }, [rehydrated, token, dispatch, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const t = token?.trim();
      if (!t || t.split(".").length !== 3) {
        setError("Please log in to create a shareable card.");
        return;
      }
      setLoading(true);
      setError(null);
      setCard(null);
      try {
        const payload: Record<string, unknown> =
          type === "horoscope"
            ? {
                dayType: dayType || "Good",
                mainTheme: mainTheme || "—",
                reason: reason || "—",
              }
            : {};
        if (type === "kundli_summary") {
          kundliPayload.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx > 0) {
              const k = line.slice(0, idx).trim();
              const v = line.slice(idx + 1).trim();
              if (k) payload[k] = v;
            }
          });
        }
        const dto: CreateShareableCardDto = {
          type,
          title:
            title || (type === "horoscope" ? "Today's Horoscope" : "Kundli Summary"),
          date: date || undefined,
          payload: Object.keys(payload).length ? payload : undefined,
        };
        const result = await astroApi.createShareableCard(t, dto);
        setCard(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create card");
      } finally {
        setLoading(false);
      }
    },
    [token, type, title, date, dayType, mainTheme, reason, kundliPayload]
  );

  const fileUrl = useCallback((pathOrFilename: string) => {
    if (!pathOrFilename) return "";
    const filename = pathOrFilename.includes("/")
      ? pathOrFilename.split("/").pop()
      : pathOrFilename;
    const base = ASTRO_BASE.replace(/\/$/, "");
    return `${base}/api/v1/shareable-card/file/${filename}`;
  }, []);

  if (!rehydrated || !token?.trim() || token.trim().split(".").length !== 3) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Redirecting to login…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error: {error}</p>
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className={styles.backButton}
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/auth/login")}
                  className={styles.backButton}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <div className={styles.pageHeader}>
              <button
                type="button"
                onClick={() => router.back()}
                className={styles.backButton}
              >
                ← Back
              </button>
            </div>

            <h1 className={styles.sectionTitle}>Shareable Card</h1>
            <p className={styles.explanationLine}>
              Create an image or PDF card (e.g. daily horoscope or kundli summary) to
              download or share.
            </p>

            <div className={formStyles.card} style={{ maxWidth: 520, marginBottom: 24 }}>
              <h2 className={formStyles.title}>Create card</h2>
              <p className={formStyles.subtitle}>
                Choose type and fill in the content to generate a shareable image and PDF.
              </p>
              <form onSubmit={handleSubmit}>
                <label className={formStyles.label}>Type</label>
                <select
                  className={formStyles.input}
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "horoscope" | "kundli_summary")
                  }
                  style={{ cursor: "pointer" }}
                >
                  <option value="horoscope">Horoscope</option>
                  <option value="kundli_summary">Kundli Summary</option>
                </select>
                <label className={formStyles.label}>Title</label>
                <input
                  type="text"
                  className={formStyles.input}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Today's Horoscope"
                />
                <label className={formStyles.label}>Date</label>
                <input
                  type="date"
                  className={formStyles.input}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {type === "horoscope" && (
                  <>
                    <label className={formStyles.label}>Day type</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value)}
                      placeholder="e.g. Good"
                    />
                    <label className={formStyles.label}>Main theme</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={mainTheme}
                      onChange={(e) => setMainTheme(e.target.value)}
                      placeholder="e.g. Focus on opportunities"
                    />
                    <label className={formStyles.label}>Reason</label>
                    <input
                      type="text"
                      className={formStyles.input}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Jupiter supports your Moon sign"
                    />
                  </>
                )}
                {type === "kundli_summary" && (
                  <>
                    <label className={formStyles.label}>
                      Summary (one key: value per line)
                    </label>
                    <textarea
                      className={formStyles.input}
                      value={kundliPayload}
                      onChange={(e) => setKundliPayload(e.target.value)}
                      rows={5}
                      style={{ minHeight: 100, resize: "vertical" }}
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={formStyles.button}
                >
                  {loading ? "Creating…" : "Create Card"}
                </button>
              </form>
            </div>

            {card && (
              <div className={`${styles.resultBlock} ${styles.resultBlockActive}`}>
                <h3 className={styles.cardTitle}>Card created</h3>
                <p className={styles.cardDescription} style={{ marginBottom: 12 }}>
                  {card.createdAt}
                </p>
                <div style={{ marginBottom: 16 }}>
                  <img
                    src={fileUrl(card.imageUrl)}
                    alt="Shareable card"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: 8,
                      border: "1px solid #e8ddd0",
                    }}
                  />
                </div>
                <div className={styles.buttonGroup} style={{ justifyContent: "flex-start" }}>
                  <a
                    href={fileUrl(card.imageUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.retryButton}
                    style={{ textDecoration: "none", color: "#fff" }}
                  >
                    Download PNG
                  </a>
                  {card.pdfUrl && (
                    <a
                      href={fileUrl(card.pdfUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.retryButton}
                      style={{ textDecoration: "none", color: "#fff" }}
                    >
                      Download PDF
                    </a>
                  )}
                </div>
                <CalculationInfo
                  showDasha={false}
                  showAyanamsa={true}
                  note="Card is generated and stored for download."
                />
                <TrustNote variant="loggedIn" />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
