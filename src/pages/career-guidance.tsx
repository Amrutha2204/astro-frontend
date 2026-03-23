import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import { careerApi, type CareerGuidanceResponse } from "@/services/api";
import { selectToken } from "@/store/slices/authSlice";

export default function CareerGuidancePage() {
  const token = useSelector(selectToken) || "";
  const [guidance, setGuidance] = useState<CareerGuidanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuidance = async () => {
      if (!token) {
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await careerApi.getCareerGuidance(token);
        setGuidance(res);
      } catch (err: unknown) {
        console.error("Error fetching career guidance:", err);
        setError("Failed to fetch career guidance. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchGuidance();
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main
          className="ml-[260px] h-[calc(100vh-56px)] w-full overflow-y-auto overflow-x-hidden
bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50
p-8 max-[768px]:ml-[200px]"
        >
          <div className="mx-auto w-full max-w-5xl p-2">
            <h2
              className="mb-8 text-3xl font-bold tracking-wide
bg-gradient-to-r from-rose-800 via-orange-700 to-amber-600
bg-clip-text text-transparent"
            >
              Career Guidance
            </h2>

            {loading && (
              <div className="flex h-[360px] flex-col items-center justify-center gap-6">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-4 border-white/40"></div>
                  <div
                    className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4
        border-transparent border-t-rose-600 border-r-orange-500 border-b-amber-400"
                  ></div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-700">
                    Generating your personalized career insights…
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Aligning planetary influences ✨</p>
                </div>
              </div>
            )}
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
                {error}
              </p>
            )}

            {guidance && (
              <div
                className="mb-8 rounded-2xl bg-white/70 p-8
shadow-xl backdrop-blur-md border border-white/40"
              >
                <h3 className="mb-3 text-[20px] font-semibold text-rose-900">Career Advice</h3>
                {guidance.sections && Object.keys(guidance.sections).length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {guidance.sections.strengths && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">Strengths</h4>
                        <p className="text-[15px] leading-[1.6] text-slate-700">
                          {guidance.sections.strengths.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </section>
                    )}
                    {guidance.sections.suitableFields && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">
                          Suitable Fields
                        </h4>
                        <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
                          {guidance.sections.suitableFields.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </section>
                    )}
                    {guidance.sections.timing && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">Timing</h4>
                        <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
                          {guidance.sections.timing.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </section>
                    )}
                    {guidance.sections.tips && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">Tips</h4>
                        <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
                          {guidance.sections.tips.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </section>
                    )}
                    {guidance.sections.disclaimer && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">
                          Disclaimer
                        </h4>
                        <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
                          {guidance.sections.disclaimer.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </section>
                    )}
                  </div>
                ) : (
                  <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
                    {guidance.guidance.split("\n").map((line, idx) => (
                      <span key={idx}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                )}
                <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
                  Guidance generated on: {new Date(guidance.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
