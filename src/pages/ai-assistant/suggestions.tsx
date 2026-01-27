import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { aiAssistantApi, SuggestionsResponse } from "@/services/aiAssistantService";
import { showError, showSuccess } from "@/utils/toast";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function SuggestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      if (token.split(".").length !== 3) {
        setError("Invalid token format. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
        return;
      }

      setLoading(true);
      const data = await aiAssistantApi.getSuggestions(token);
      setSuggestions(data);
      setError(null);
      showSuccess("Daily suggestions loaded!");
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to load suggestions";
      setError(errorMessage);
      showError(errorMessage);
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCategoryIcon = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('relationship')) return '💕';
    if (normalized.includes('career')) return '💼';
    if (normalized.includes('wellness') || normalized.includes('health')) return '🌿';
    if (normalized.includes('finance') || normalized.includes('money')) return '💰';
    return '✨';
  };

  const getCategoryColor = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('relationship')) return '#ec4899';
    if (normalized.includes('career')) return '#3b82f6';
    if (normalized.includes('wellness') || normalized.includes('health')) return '#10b981';
    if (normalized.includes('finance') || normalized.includes('money')) return '#f59e0b';
    return '#9333ea';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.loadingContainer}>
              <p>Loading your personalized suggestions...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <AppHeader />
        <div className={styles.dashboardContent}>
          <AppSidebar />
          <main className={styles.mainContent}>
            <div className={styles.errorContainer}>
              <p className={styles.errorText}>Error: {error}</p>
              <div className={styles.buttonGroup}>
                <button onClick={fetchSuggestions} className={styles.backButton}>
                  🔄 Retry
                </button>
                <button onClick={() => router.push("/auth/login")} className={styles.backButton}>
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
          <div className={styles.pageHeader}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← Back
            </button>
            <button onClick={fetchSuggestions} className={styles.refreshButton}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Daily AI Suggestions</h1>
            {suggestions && (
              <>
                <div className={styles.suggestionsHeader}>
                  <p style={{ color: '#6b7280', marginBottom: '10px' }}>
                    Personalized suggestions for {formatDate(suggestions.date)}
                  </p>
                  {suggestions.overallTheme && (
                    <div className={styles.overallTheme}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626', marginBottom: '10px' }}>
                        Overall Theme
                      </h3>
                      <p style={{ fontSize: '16px', color: '#374151', fontStyle: 'italic' }}>
                        {suggestions.overallTheme}
                      </p>
                    </div>
                  )}
                </div>

                <div className={styles.suggestionsList}>
                  {suggestions.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={styles.suggestionCard}
                      style={{ borderLeftColor: getCategoryColor(suggestion.category) }}
                    >
                      <div className={styles.suggestionHeader}>
                        <div className={styles.suggestionCategory}>
                          <span className={styles.categoryIcon}>{getCategoryIcon(suggestion.category)}</span>
                          <span
                            className={styles.categoryName}
                            style={{ color: getCategoryColor(suggestion.category) }}
                          >
                            {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className={styles.suggestionContent}>
                        <p className={styles.suggestionText}>{suggestion.suggestion}</p>
                        {suggestion.reason && (
                          <div className={styles.suggestionReason}>
                            <strong>Why:</strong> {suggestion.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
