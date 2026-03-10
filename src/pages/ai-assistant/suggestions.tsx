import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { aiAssistantApi, SuggestionsResponse } from "@/services/aiAssistantService";
import { showError, showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
import styles from "@/styles/dashboard.module.css";
import ErrorMessage from "@/components/ui/ErrorMessage";

const REDIRECT_DELAY_MS = 2000;

export default function SuggestionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSuggestions = useCallback(async () => {
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    try {
      setLoading(true);
      const data = await aiAssistantApi.getSuggestions(t);
      setSuggestions(data);
      setError(null);
      showSuccess("Daily suggestions loaded!");
    } catch (err) {
      const e = err as { message?: string };
      const msg = e.message || "Failed to load suggestions";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, router]);

  useEffect(() => {
    if (!rehydrated) return;
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchSuggestions();
  }, [rehydrated, token, dispatch, router, fetchSuggestions]);

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
          <ErrorMessage message={error} />
          <div className={styles.buttonGroup}>
            <button onClick={fetchSuggestions} className={styles.backButton}>
              🔄 Retry
            </button>
            <button onClick={() => router.push("/auth/login")} className={styles.backButton}>
              Go to Login
            </button>
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
          <PageHeader
            onBack={() => router.back()}
            onRefresh={fetchSuggestions}
            refreshAriaLabel="Refresh suggestions"
            disableRefresh={loading}
          />

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>Daily AI Suggestions</h1>
            {suggestions && (
              <>
                <div className={styles.suggestionsHeader}>
                  <p className="text-sm text-gray-500 mb-2">
                      Personalized suggestions for {formatDate(suggestions.date)}
                  </p>
                  {suggestions.overallTheme && (
                    <div className={styles.overallTheme}>
                      <h3 className="text-lg font-semibold text-red-600 mb-2">
                          Overall Theme
                      </h3>
                      <p className="text-base text-gray-700 italic">
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
