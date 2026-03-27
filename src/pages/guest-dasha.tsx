import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { dashaApi, type GuestBirthDto } from "@/services/dashaService";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function GuestDashaPage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<{
    mahadasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
    planet: string;
    remainingDays: number;
    source: string;
  } | null>(null);
  const [timeline, setTimeline] = useState<Array<{
    dasha: string;
    antardasha: string;
    startDate: string;
    endDate: string;
    planet: string;
    duration: number;
  }> | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob.trim() || !birthTime.trim() || !placeOfBirth.trim()) {
      setError("Please enter birth date, time and place.");
      return;
    }
    setError(null);
    setLoading(true);
    setCurrent(null);
    setTimeline(null);
    const dto: GuestBirthDto = {
      dob: dob.trim(),
      birthTime: birthTime.trim(),
      placeOfBirth: placeOfBirth.trim(),
    };
    try {
      const [c, t] = await Promise.all([
        dashaApi.getGuestDasha(dto),
        dashaApi.getGuestDashaTimeline(dto, 10),
      ]);
      setCurrent(c);
      setTimeline(t.timeline || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to calculate dasha");
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
              Dasha (Guest)
            </h2>
            <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
              Enter birth details to get current Mahadasha and Antardasha. No login required.
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
                {loading ? "Calculating…" : "See my period"}
              </button>
            </form>
          </div>
          {current && (
            <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-8 shadow-[0_8px_32px_rgba(107,68,35,0.12)]">
              <span className="mb-3 inline-flex rounded-full bg-[#ffe6ec] px-3 py-1 text-[12px] font-semibold text-[#d63384]">
                You are here
              </span>
              <h3 className="mb-2 text-[24px] font-bold text-[#6b4423]">
                {fullName.trim() ? `Period for ${fullName.trim()}` : "Your current period"}
              </h3>
              <p>
                <strong>Mahadasha:</strong> {current.mahadasha}
              </p>
              <p>
                <strong>Antardasha:</strong> {current.antardasha}
              </p>
              <p>
                <strong>From</strong> {current.startDate} <strong>to</strong> {current.endDate}
              </p>
              <p>
                <strong>Planet:</strong> {current.planet}
              </p>
              {current.remainingDays !== null && (
                <p>
                  <strong>Time left in this period:</strong> {current.remainingDays} days
                </p>
              )}
              <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                You’re in this period because your birth chart places you in {current.mahadasha}{" "}
                from {current.startDate}.
              </p>
              <CalculationInfo showDasha={true} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Source: {current.source}</p>
            </div>
          )}
          {timeline && timeline.length > 0 && (
            <div className="mt-6 rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-8 shadow-[0_8px_32px_rgba(107,68,35,0.12)]">
              <h3 className="mb-4 text-[24px] font-bold text-[#6b4423]">
                What’s next (next 10 years)
              </h3>
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-amber-200">
                      <th className="text-left p-2">Period</th>
                      <th className="text-left p-2">From</th>
                      <th className="text-left p-2">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const now = new Date();
                      const currentIdx = timeline.findIndex((row) => {
                        const s = new Date(row.startDate),
                          e = new Date(row.endDate);
                        return s <= now && e >= now;
                      });
                      return timeline.slice(0, 30).map((r, i) => {
                        const start = new Date(r.startDate);
                        const end = new Date(r.endDate);
                        const isPast = end < now;
                        const isCurrent = start <= now && end >= now;
                        const isNext = currentIdx >= 0 && i === currentIdx + 1;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-amber-100 ${isCurrent ? "bg-amber-50 font-semibold" : isPast ? "opacity-60 text-gray-500" : ""}`}
                          >
                            <td className="p-2">
                              {isCurrent && (
                                <span className="mr-2 inline-flex rounded-full bg-[#ffe6ec] px-3 py-1 text-[12px] font-semibold text-[#d63384]">
                                  Now
                                </span>
                              )}
                              {isNext && (
                                <span className="mr-2 inline-flex rounded-full bg-[#fff2cc] px-3 py-1 text-[12px] font-semibold text-[#8a6d1d]">
                                  Up next
                                </span>
                              )}
                              {r.dasha} – {r.antardasha}
                            </td>
                            <td className="p-2">{r.startDate}</td>
                            <td className="p-2">{r.endDate}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
