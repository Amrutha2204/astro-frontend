import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { astroApi, type CreateShareableCardDto, type StoredCardResponse } from "@/services/api";
import { ASTRO_BASE } from "@/services/fetcher";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Image from "next/image";

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
    "moonSign: Cancer\nsunSign: Leo\nlagna: Virgo",
  );
  const primaryButtonClass =
  "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<StoredCardResponse | null>(null);
  const [shareLinks, setShareLinks] = useState<{
    whatsapp: string;
    twitter: string;
    telegram: string;
  } | null>(null);

  useEffect(() => {
    setDate(getDefaultDate());
  }, []);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
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
                dayType: (dayType && dayType.trim()) || "Based on today's chart",
                mainTheme: (mainTheme && mainTheme.trim()) || "General planetary influence",
                reason:
                  (reason && reason.trim()) || "Derived from current transits and Vedic methods.",
              }
            : {};
        if (type === "kundli_summary") {
          kundliPayload.split("\n").forEach((line) => {
            const idx = line.indexOf(":");
            if (idx > 0) {
              const k = line.slice(0, idx).trim();
              const v = line.slice(idx + 1).trim();
              if (k) {
                payload[k] = v;
              }
            }
          });
        }
        const dto: CreateShareableCardDto = {
          type,
          title: title || (type === "horoscope" ? "Today's Horoscope" : "Kundli Summary"),
          date: date || undefined,
          payload: Object.keys(payload).length ? payload : undefined,
        };
        const result = await astroApi.createShareableCard(t, dto);
        setCard(result);
        setShareLinks(null);
        try {
          const links = await astroApi.getShareLinks(t, result.imageUrl, title || result.id);
          setShareLinks(links);
        } catch {
          // share links optional
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create card");
      } finally {
        setLoading(false);
      }
    },
    [token, type, title, date, dayType, mainTheme, reason, kundliPayload],
  );

  const fileUrl = useCallback((pathOrFilename: string) => {
    if (!pathOrFilename) {
      return "";
    }
    const filename = pathOrFilename.includes("/")
      ? pathOrFilename.split("/").pop()
      : pathOrFilename;
    const base = ASTRO_BASE.replace(/\/$/, "");
    return `${base}/api/v1/shareable-card/file/${filename}`;
  }, []);

  if (!rehydrated || !token?.trim() || token.trim().split(".").length !== 3) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <div className="flex min-h-[200px] items-center justify-center">
              <p>Redirecting to login…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader onBack={() => router.back()} />

            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              Shareable Card
            </h1>
            {loading && <p>Creating card, please wait…</p>}
            {error && <ErrorMessage message={error} />}
            <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
              Create an image or PDF card (e.g. daily horoscope or kundli summary) to download or
              share.
            </p>

            <div className="mx-auto mb-6 w-full max-w-[520px] rounded-[20px] border-[2px] border-[#e4cfa6] bg-[linear-gradient(135deg,#fff9f1_0%,#fffaf2_100%)] px-[52px] py-12 shadow-[0_20px_60px_rgba(122,46,46,0.15),0_0_100px_rgba(180,123,69,0.08)] backdrop-blur-[12px]">
              <h2 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent text-center">
                Create card
              </h2>
              <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
                Choose type and fill in the content to generate a shareable image and PDF.
              </p>
              <form onSubmit={handleSubmit}>
                <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  Type
                </label>
                <select
                  className="w-full formSelect"
                  value={type}
                  onChange={(e) => setType(e.target.value as "horoscope" | "kundli_summary")}
                  aria-label="Card type"
                >
                  <option value="horoscope">Horoscope</option>
                  <option value="kundli_summary">Kundli Summary</option>
                </select>
                <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Today's Horoscope"
                />
                <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                  Date
                </label>
                <input
                  type="date"
                  className="w-full formDateInput"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                {type === "horoscope" && (
                  <>
                    <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                      Day type
                    </label>
                    <input
                      type="text"
                      className="w-full"
                      value={dayType}
                      onChange={(e) => setDayType(e.target.value)}
                      placeholder="e.g. Good"
                    />
                    <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                      Main theme
                    </label>
                    <input
                      type="text"
                      className="w-full"
                      value={mainTheme}
                      onChange={(e) => setMainTheme(e.target.value)}
                      placeholder="e.g. Focus on opportunities"
                    />
                    <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                      Reason
                    </label>
                    <input
                      type="text"
                      className="w-full"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Jupiter supports your Moon sign"
                    />
                  </>
                )}
                {type === "kundli_summary" && (
                  <>
                    <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                      Summary (one key: value per line)
                    </label>
                    <textarea
                      value={kundliPayload}
                      onChange={(e) => setKundliPayload(e.target.value)}
                      rows={5}
                      className="min-h-[100px] w-full resize-y"
                    />
                  </>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={primaryButtonClass + " mt-6 w-full max-w-[300px] mx-auto block"}
                >
                  {loading ? "Creating…" : "Create Card"}
                </button>
              </form>
            </div>

            {card && (
              <div className="rounded-[16px] border-[2px] border-[#6b4423] bg-[linear-gradient(135deg,#fdf8f3_0%,#f5ebe0_100%)] p-8 shadow-[0_4px_12px_rgba(107,68,35,0.15)]">
                <h3 className="mb-2 text-[24px] font-bold text-[#6b4423]">Card created</h3>
                <p className="mb-3 text-[14px] leading-[1.6] text-[#6b7280]">{card.createdAt}</p>
                <div className="mb-4">
                  <div className="relative w-full max-w-[900px] aspect-[4/5]">
                    <Image
                      src={fileUrl(card.imageUrl)}
                      alt="Shareable card"
                      fill
                      sizes="(max-width: 768px) 100vw, 900px"
                      className="rounded-[8px] border border-[#e8ddd0] object-contain"
                    />
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap justify-start gap-2">
                  <a
                    href={fileUrl(card.imageUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white no-underline transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
                  >
                    Download PNG
                  </a>
                  {card.pdfUrl && (
                    <a
                      href={fileUrl(card.pdfUrl)}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white no-underline transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
                    >
                      Download PDF
                    </a>
                  )}
                  {shareLinks && (
                    <>
                      <a
                        href={shareLinks.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white no-underline transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
                      >
                        Share on WhatsApp
                      </a>
                      <a
                        href={shareLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white no-underline transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
                      >
                        Share on Twitter
                      </a>
                      <a
                        href={shareLinks.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white no-underline transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
                      >
                        Share on Telegram
                      </a>
                    </>
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
