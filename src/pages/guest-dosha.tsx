import { useState } from "react";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import CalculationInfo from "@/components/common/CalculationInfo";
import TrustNote from "@/components/common/TrustNote";
import { doshaApi } from "@/services/doshaService";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";

export default function GuestDoshaPage() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    manglik: { hasDosha: boolean; description: string; severity?: string };
    nadi: { hasDosha: boolean; description: string };
    bhakoot: { hasDosha: boolean; description: string };
    totalDoshas: number;
    source: string;
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
      const r = await doshaApi.checkDoshasGuest({
        dob: dob.trim(),
        birthTime: birthTime.trim(),
        placeOfBirth: placeOfBirth.trim(),
      });
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check doshas");
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
              Dosha Check (Guest)
            </h2>
            <p className="m-0 mb-8 text-center text-[15px] font-medium leading-[1.7] text-[#6b5b52]">
              Manglik, Nadi and Bhakoot. No login required.
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
                {loading ? "Checking…" : "Check doshas"}
              </button>
            </form>
          </div>
          {result && (
            <div className="rounded-[16px] border border-[#e4cfa6] bg-[linear-gradient(135deg,#fffbf5_0%,#fdf6eb_100%)] p-8 shadow-[0_8px_32px_rgba(107,68,35,0.12)]">
              <h3 className="text-[24px] font-bold text-[#6b4423]">
                {fullName.trim() ? `Dosha check for ${fullName.trim()}` : "Your dosha check"}
              </h3>
              <p className="mt-2 rounded-[6px] border-l-[3px] border-l-[#6b4423] bg-[#faf8f5] px-3 py-2 text-[14px] italic text-[#5c4033]">
                These checks are based on your birth chart’s planetary positions.
              </p>
              <div className="mt-[15px] flex flex-col gap-3">
                <div
                  className={
                    result.manglik.hasDosha
                      ? "rounded-[8px] border-l-[4px] border-l-[#6b4423] bg-[linear-gradient(135deg,#fdf8f3_0%,#f5ebe0_100%)] px-4 py-3 text-[14px] text-[#374151]"
                      : "rounded-[6px] bg-white px-4 py-3 text-[14px] text-[#374151]"
                  }
                >
                  <strong>Manglik:</strong> {result.manglik.hasDosha ? "Present" : "Not present"} –{" "}
                  {result.manglik.description}
                </div>
                <div
                  className={
                    result.nadi.hasDosha
                      ? "rounded-[8px] border-l-[4px] border-l-[#6b4423] bg-[linear-gradient(135deg,#fdf8f3_0%,#f5ebe0_100%)] px-4 py-3 text-[14px] text-[#374151]"
                      : "rounded-[6px] bg-white px-4 py-3 text-[14px] text-[#374151]"
                  }
                >
                  <strong>Nadi:</strong> {result.nadi.hasDosha ? "Present" : "Not present"} –{" "}
                  {result.nadi.description}
                </div>
                <div
                  className={
                    result.bhakoot.hasDosha
                      ? "rounded-[8px] border-l-[4px] border-l-[#6b4423] bg-[linear-gradient(135deg,#fdf8f3_0%,#f5ebe0_100%)] px-4 py-3 text-[14px] text-[#374151]"
                      : "rounded-[6px] bg-white px-4 py-3 text-[14px] text-[#374151]"
                  }
                >
                  <strong>Bhakoot:</strong> {result.bhakoot.hasDosha ? "Present" : "Not present"} –{" "}
                  {result.bhakoot.description}
                </div>
              </div>
              <p>
                <strong>Doshas present:</strong> {result.totalDoshas}
              </p>
              <CalculationInfo showDasha={false} showAyanamsa={true} />
              <TrustNote variant="guest" showAccuracyTip />
              <p className="text-xs text-gray-500 mt-2">Source: {result.source}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
