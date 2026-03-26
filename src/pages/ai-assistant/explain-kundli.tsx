import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { aiAssistantApi, type ExplainKundliResponse } from "@/services/aiAssistantService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";

export default function ExplainKundliPage() {
  const router = useRouter();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [focus, setFocus] = useState<string>("overall");
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplainKundliResponse | null>(null);
  const primaryButtonClass =
    "rounded-[14px] bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#f59e0b] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_22px_rgba(236,72,153,0.35)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_14px_32px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-60";
  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      router.replace("/auth/login");
    }
  }, [rehydrated, token, router]);

  const handleExplain = async () => {
    const t = token?.trim();
    if (!t) {
      router.push("/auth/login");
      return;
    }
    try {
      setLoading(true);
      const result = await aiAssistantApi.explainKundli(t, { focus: focus || undefined });
      setExplanation(result);
      showSuccess("Kundli explanation generated!");
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to explain kundli";
      showError(errorMessage);
      console.error("Error explaining kundli:", err);
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
          <div className="relative mx-auto max-w-[1200px]">
            <PageHeader onBack={() => router.back()} />
            <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              AI Kundli Explanation
            </h1>
            <p className="text-sm text-gray-500 mb-8">
              Get a detailed AI-powered explanation of your birth chart. Choose a focus area or get
              an overall explanation.
            </p>
            <div className="mb-[30px] rounded-[12px] bg-white p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="mx-auto flex max-w-[400px] flex-col gap-[10px]">
                <label className="text-[16px] font-semibold text-[#374151]">Focus Area:</label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className="formSelect rounded-[8px] border border-[#d1d5db] bg-white px-4 py-3 text-[14px]"
                  disabled={loading}
                >
                  <option value="overall">Overall Chart</option>
                  <option value="sun-sign">Sun Sign</option>
                  <option value="moon-sign">Moon Sign</option>
                  <option value="ascendant">Ascendant (Lagna)</option>
                  <option value="houses">Houses</option>
                  <option value="planets">Planets</option>
                </select>
              </div>
              <button
                onClick={handleExplain}
                disabled={loading}
                className="mx-auto mt-5 block w-full max-w-[300px] rounded-[12px] bg-[#6b4423] px-6 py-3 text-[16px] font-semibold text-white transition-colors duration-200 hover:bg-[#5c3a1f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating Explanation..." : "Explain My Kundli"}
              </button>
            </div>

            {explanation && (
              <div className="rounded-[12px] bg-white p-[30px] shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <div className="mb-[30px] border-b-[2px] border-b-[#e5e7eb] pb-[30px]">
                  <h3 className="text-[20px] font-bold text-[#6b4423]">Your Chart Summary</h3>
                  <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
                    <div className="flex flex-col items-center rounded-[8px] bg-[#f9fafb] p-[15px]">
                      <span className="mb-2 text-[12px] uppercase tracking-[0.5px] text-[#6b7280]">
                        Sun Sign
                      </span>
                      <span className="text-[18px] font-semibold text-[#6b4423]">
                        {explanation.chartSummary.sunSign}
                      </span>
                    </div>
                    <div className="flex flex-col items-center rounded-[8px] bg-[#f9fafb] p-[15px]">
                      <span className="mb-2 text-[12px] uppercase tracking-[0.5px] text-[#6b7280]">
                        Moon Sign
                      </span>
                      <span className="text-[18px] font-semibold text-[#6b4423]">
                        {explanation.chartSummary.moonSign}
                      </span>
                    </div>
                    <div className="flex flex-col items-center rounded-[8px] bg-[#f9fafb] p-[15px]">
                      <span className="mb-2 text-[12px] uppercase tracking-[0.5px] text-[#6b7280]">
                        Ascendant
                      </span>
                      <span className="text-[18px] font-semibold text-[#6b4423]">
                        {explanation.chartSummary.ascendant}
                      </span>
                    </div>
                    <div className="flex flex-col items-center rounded-[8px] bg-[#f9fafb] p-[15px]">
                      <span className="mb-2 text-[12px] uppercase tracking-[0.5px] text-[#6b7280]">
                        Nakshatra
                      </span>
                      <span className="text-[18px] font-semibold text-[#6b4423]">
                        {explanation.chartSummary.nakshatra}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-[30px]">
                  <h3 className="text-[20px] font-bold text-[#6b4423]">
                    Explanation ({explanation.explanation.focus.replace("-", " ")})
                  </h3>
                  <div className="mt-5 rounded-[8px] border-l-[4px] border-l-[#6b4423] bg-[#f9fafb] p-5">
                    {explanation.explanation.text.split("\n").map(
                      (paragraph, index) =>
                        paragraph.trim() && (
                          <p key={index} className="mb-4 leading-relaxed text-gray-700">
                            {paragraph.trim()}
                          </p>
                        ),
                    )}
                  </div>
                </div>

                <div className="mt-5 text-center">
                  <button onClick={handleExplain} disabled={loading} className={primaryButtonClass}>
                    🔄 Regenerate Explanation
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
