import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { aiAssistantApi, ExplainKundliResponse } from "@/services/aiAssistantService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";

export default function ExplainKundliPage() {
  const router = useRouter();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [focus, setFocus] = useState<string>('overall');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<ExplainKundliResponse | null>(null);

  useEffect(() => {
    if (!rehydrated) return;
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) router.replace("/auth/login");
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
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.kundliContainer}>
            <PageHeader onBack={() => router.back()} />
            <h1 className={styles.sectionTitle}>AI Kundli Explanation</h1>
            <p className="text-sm text-gray-500 mb-8">
  Get a detailed AI-powered explanation of your birth chart. Choose a focus area or get an overall explanation.
</p>


            <div className={styles.explainKundliForm}>
              <div className={styles.focusSelector}>
                <label className={styles.focusLabel}>Focus Area:</label>
                <select
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  className={`formSelect ${styles.focusSelect}`}
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
                className={`${styles.loginButton} max-w-[300px] mx-auto mt-5`}
              >

                {loading ? 'Generating Explanation...' : 'Explain My Kundli'}
              </button>
            </div>

            {explanation && (
              <div className={styles.explanationResult}>
                <div className={styles.chartSummary}>
                  <h3 className={styles.cardTitle}>Your Chart Summary</h3>
                  <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Sun Sign</span>
                      <span className={styles.summaryValue}>{explanation.chartSummary.sunSign}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Moon Sign</span>
                      <span className={styles.summaryValue}>{explanation.chartSummary.moonSign}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Ascendant</span>
                      <span className={styles.summaryValue}>{explanation.chartSummary.ascendant}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Nakshatra</span>
                      <span className={styles.summaryValue}>{explanation.chartSummary.nakshatra}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.explanationText}>
                  <h3 className={styles.cardTitle}>
                    Explanation ({explanation.explanation.focus.replace('-', ' ')})
                  </h3>
                  <div className={styles.explanationContent}>
                    {explanation.explanation.text.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p
                          key={index}
                          className="mb-4 leading-relaxed text-gray-700"
                        >

                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>

                  <div className="mt-5 text-center">
                  <button
                    onClick={handleExplain}
                    disabled={loading}
                    className={styles.refreshButton}
                  >
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
