import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { aiAssistantApi, type SuggestionsResponse } from "@/services/aiAssistantService";
import { showSuccess } from "@/utils/toast";
import { selectToken, selectIsRehydrated, clearToken } from "@/store/slices/authSlice";
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
    if (!rehydrated) {
      return;
    }
    if (!token?.trim() || token.trim().split(".").length !== 3) {
      dispatch(clearToken());
      setTimeout(() => router.push("/auth/login"), REDIRECT_DELAY_MS);
      return;
    }
    fetchSuggestions();
  }, [rehydrated, token, dispatch, router, fetchSuggestions]);

  const getCategoryIcon = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes("relationship")) {
      return "💕";
    }
    if (normalized.includes("career")) {
      return "💼";
    }
    if (normalized.includes("wellness") || normalized.includes("health")) {
      return "🌿";
    }
    if (normalized.includes("finance") || normalized.includes("money")) {
      return "💰";
    }
    return "✨";
  };

  const getCategoryBorderClass = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes("relationship")) {
      return "border-l-[#ec4899]";
    }
    if (normalized.includes("career")) {
      return "border-l-[#3b82f6]";
    }
    if (normalized.includes("wellness") || normalized.includes("health")) {
      return "border-l-[#10b981]";
    }
    if (normalized.includes("finance") || normalized.includes("money")) {
      return "border-l-[#f59e0b]";
    }
    return "border-l-[#9333ea]";
  };

  const getCategoryTextClass = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes("relationship")) {
      return "text-[#ec4899]";
    }
    if (normalized.includes("career")) {
      return "text-[#3b82f6]";
    }
    if (normalized.includes("wellness") || normalized.includes("health")) {
      return "text-[#10b981]";
    }
    if (normalized.includes("finance") || normalized.includes("money")) {
      return "text-[#f59e0b]";
    }
    return "text-[#9333ea]";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-[16px] text-[#6b7280]">
              <p>Loading your personalized suggestions...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
        <AppHeader />
        <div className="flex w-full">
          <AppSidebar />
          <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
            <ErrorMessage message={error} />
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={fetchSuggestions}
                className="flex items-center gap-[6px] rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
              >
                🔄 Retry
              </button>
              <button
                onClick={() => router.push("/auth/login")}
                className="flex items-center gap-[6px] rounded-[6px] bg-[#6b4423] px-4 py-2 text-[14px] font-medium text-white transition-all duration-200 hover:-translate-x-[2px] hover:bg-[#5c3a1f]"
              >
                Go to Login
              </button>
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
          <PageHeader
            onBack={() => router.back()}
            onRefresh={fetchSuggestions}
            refreshAriaLabel="Refresh suggestions"
            disableRefresh={loading}
          />

          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="mb-6 border-b-[2px] border-b-[#d4a574] pb-[14px] text-[26px] font-bold tracking-[-0.01em] text-[#6b4423]">
              Daily AI Suggestions
            </h1>
            {suggestions && (
              <>
                <div className="mb-[30px]">
                  <p className="text-sm text-gray-500 mb-2">
                    Personalized suggestions for {formatDate(suggestions.date)}
                  </p>
                  {suggestions.overallTheme && (
                    <div className="mt-5 rounded-[12px] border border-[#e8ddd0] bg-[linear-gradient(135deg,#f5ebe0_0%,#ede4d8_100%)] p-5 text-center">
                      <h3 className="text-lg font-semibold text-red-600 mb-2">Overall Theme</h3>
                      <p className="text-base text-gray-700 italic">{suggestions.overallTheme}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  {suggestions.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={`rounded-[8px] border-l-[4px] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200 hover:translate-x-1 hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${getCategoryBorderClass(suggestion.category)}`}
                    >
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[20px]">
                            {getCategoryIcon(suggestion.category)}
                          </span>
                          <span
                            className={`text-[16px] font-semibold ${getCategoryTextClass(suggestion.category)}`}
                          >
                            {suggestion.category.charAt(0).toUpperCase() +
                              suggestion.category.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="mb-[10px] text-[15px] leading-[1.7] text-[#374151]">
                          {suggestion.suggestion}
                        </p>
                        {suggestion.reason && (
                          <div className="mt-[10px] rounded-[6px] bg-[#f9fafb] p-[10px] text-[13px] text-[#6b7280]">
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
