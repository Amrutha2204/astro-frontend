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
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <div className="w-[75%] p-4">
            <h2 className="mb-5 text-[24px] font-bold text-[#2c2c54]">Career Guidance</h2>

            {loading && (
              <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-[var(--text-main)]">
                <div className="h-10 w-10 animate-spin rounded-full border-[4px] border-[rgba(202,167,92,0.3)] border-t-[var(--accent)]"></div>
                <p>Generating career guidance...</p>
              </div>
            )}
            {error && <p className="font-semibold text-red-600">{error}</p>}

            {guidance && (
              <div className="mb-6 rounded-[16px] bg-white p-5 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
                <h3 className="mb-3 text-[20px] font-semibold text-[#6b4423]">Career Advice</h3>
                {guidance.sections && Object.keys(guidance.sections).length > 0 ? (
                  <div className="flex flex-col gap-5">
                    {guidance.sections.strengths && (
                      <section>
                        <h4 className="mb-2 text-[17px] font-semibold text-[#6b4423]">Strengths</h4>
                        <p className="text-[15px] leading-[1.6] text-[#3b3b6d]">
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
                <p className="mt-4 text-[13px] text-[#6b5b52]">
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
