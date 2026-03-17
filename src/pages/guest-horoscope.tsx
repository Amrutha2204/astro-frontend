import { useState } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { horoscopeApi } from "@/services/horoscopeService";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function GuestHoroscopePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    dayType: string;
    mainTheme: string;
    reason: string;
    date: string;
    source: string;
    doAvoid?: string;
    goodTime?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !birthTime.trim() || !placeOfBirth.trim()) {
      setError("Please enter birth date, time and place.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const r = await horoscopeApi.getDailyHoroscopeGuest({
        dob: dob.trim(),
        birthTime: birthTime.trim(),
        placeOfBirth: placeOfBirth.trim(),
      });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch horoscope");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="mx-auto mb-6 w-full max-w-[520px] rounded-[20px] border-[2px] border-[#e4cfa6] bg-[linear-gradient(135deg,#fff9f1_0%,#fffaf2_100%)] px-[52px] py-12 shadow-[0_20px_60px_rgba(122,46,46,0.15),0_0_100px_rgba(180,123,69,0.08)] backdrop-blur-[12px]">
            <h2 className="m-0 mb-[14px] text-center text-[32px] font-extrabold tracking-[-0.02em] text-transparent bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] bg-clip-text">
              Daily Horoscope (Guest)
            </h2>
            <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
              Personalized by your birth chart. No login required.
            </p>
            <form onSubmit={handleSubmit}>
              <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                Full name (optional)
              </label>
              <input
                type="text"
                className="w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
              />
              <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                Birth date *
              </label>
              <input
                type="date"
                className="w-full formDateInput"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
              <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                Birth time *
              </label>
              <input
                type="time"
                className="w-full formDateInput"
                value={birthTime}
                onChange={(e) => setBirthTime(e.target.value)}
                step="1"
                required
              />
              <label className="mb-[10px] block text-[14px] font-bold uppercase tracking-[0.08em] text-[#6b4423]">
                Birth place (city, town or village) *
              </label>
              <PlaceAutocomplete
                value={placeOfBirth}
                onChange={setPlaceOfBirth}
                placeholder="e.g. Mumbai, Maharashtra, India or town/village"
                required
                aria-label="Birth place"
              />
              {error && <p className="text-red-600 text-sm my-3">{error}</p>}
              <button
                type="submit"
                className="mt-[14px] w-full rounded-[12px] bg-[linear-gradient(135deg,#8b5e34_0%,#6b4423_100%)] px-5 py-4 text-[16px] font-bold text-white shadow-[0_8px_24px_rgba(107,68,35,0.3)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-[2px] hover:bg-[linear-gradient(135deg,#a67a4a_0%,#7d5a3c_100%)] hover:shadow-[0_12px_36px_rgba(107,68,35,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                disabled={loading}
              >
                {loading ? "Loading…" : "See today’s horoscope"}
              </button>
            </form>
          </div>
          {result && (
            <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-8 shadow-[0_8px_32px_rgba(107,68,35,0.12)]">
              <span className="mb-3 inline-flex rounded-full bg-[#ffe6ec] px-3 py-1 text-[12px] font-semibold text-[#d63384]">
                Today
              </span>
              <h3 className="mb-2">
                {fullName.trim() ? `Today for ${fullName.trim()}` : "Today’s focus"}:{" "}
                {result.dayType}
              </h3>
              <p>
                <strong>Focus:</strong> {result.mainTheme}
              </p>
              {result.reason && (
                <p>
                  <strong>Why:</strong> {result.reason}
                </p>
              )}
              {result.doAvoid && (
                <p>
                  <strong>Do / Avoid today:</strong> {result.doAvoid}
                </p>
              )}
              {result.goodTime && (
                <p>
                  <strong>Good time:</strong> {result.goodTime}
                </p>
              )}
              <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                Today’s focus is based on your Moon sign and current planetary positions.
              </p>
              <CalculationInfo showDasha={false} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">
                Date: {result.date} · {result.source}
              </p>

              <div className="relative mt-8 rounded-[10px] border border-[#e8ddd0] bg-[#faf8f5] p-5">
                <h3>Next 7 days</h3>
                <div className="min-h-[180px] select-none blur-[5px]">
                  <p>Mon — Steady progress; good for routine tasks.</p>
                  <p>Tue — Focus on communication and short travel.</p>
                  <p>Wed — Favorable for finances and decisions.</p>
                  <p>Thu — Emotional clarity; relationships in focus.</p>
                  <p>Fri — Creative energy; avoid haste.</p>
                  <p>Sat — Rest and reflection recommended.</p>
                  <p>Sun — New beginnings; plan for the week ahead.</p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[10px] bg-[rgba(253,248,243,0.85)] p-4 text-center">
                  <p>Sign up or log in to see your personalized week ahead</p>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push("/auth/register")}
                      className="rounded-[8px] bg-[#6b4423] px-5 py-[10px] text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f]"
                    >
                      Sign up free
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/auth/login")}
                      className="rounded-[8px] border-[2px] border-[#6b4423] bg-transparent px-5 py-[10px] text-[14px] font-semibold text-[#6b4423] transition-colors duration-200 hover:bg-[#f5ebe0] hover:text-[#5c3a1f]"
                    >
                      Log in
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
