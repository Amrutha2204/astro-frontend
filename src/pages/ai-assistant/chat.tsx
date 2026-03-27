import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import PageHeader from "@/components/layout/PageHeader";
import { aiAssistantApi, type ChatResponse } from "@/services/aiAssistantService";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import { selectToken, selectIsRehydrated } from "@/store/slices/authSlice";

export default function AIChatPage() {
  const router = useRouter();
  const rehydrated = useSelector(selectIsRehydrated);
  const token = useSelector(selectToken);
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState<
    "daily" | "weekly" | "relationships" | "career" | "wellness" | undefined
  >(undefined);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<
    Array<{ question: string; response: ChatResponse; timestamp: string }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!rehydrated) {
      return;
    }
    const t = token?.trim();
    if (!t || t.split(".").length !== 3) {
      router.replace("/auth/login");
    }
  }, [rehydrated, token, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      showWarning("Please enter a question");
      return;
    }

    if (question.length > 500) {
      showWarning("Question is too long. Maximum 500 characters.");
      return;
    }

    try {
      setLoading(true);
      const t = token?.trim();
      if (!t) {
        router.push("/auth/login");
        return;
      }
      const response = await aiAssistantApi.chat(t, {
        question: question.trim(),
        context,
      });

      setResponses([
        ...responses,
        {
          question: question.trim(),
          response,
          timestamp: new Date().toISOString(),
        },
      ]);

      setQuestion("");
      setContext(undefined);
      showSuccess("Response received!");
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to get AI response";
      showError(errorMessage);
      console.error("Error getting AI response:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <AppHeader />
      <div className="flex w-full">
        <AppSidebar />
        <main className="ml-[250px] h-[calc(100vh-50px)] w-full overflow-y-auto overflow-x-hidden bg-[var(--bg-main)] p-6 max-[768px]:ml-[200px]">
          <PageHeader title="AI Astrology Assistant" onBack={() => router.back()} />

          <div className="relative mx-auto max-w-[1200px]">
            <h1 className="text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#d97706] bg-clip-text text-transparent">
              AI Astrology Assistant
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Ask any astrology-related questions and get personalized insights based on your birth
              chart.
            </p>

            <div className="flex min-h-[600px] h-[calc(100vh-300px)] max-h-[800px] flex-col rounded-[12px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
                {responses.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center text-[#6b7280]">
                    <div className="mb-5 text-[64px]">💬</div>
                    <h3 className="mb-[10px] text-[20px] text-[#1f2937]">Start a conversation</h3>
                    <p>Ask questions like:</p>
                    <ul className="mt-5 text-left">
                      <li
                        onClick={() => {
                          setQuestion("Why is today important for me?");
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="mb-2 cursor-pointer rounded-[8px] bg-[#f9fafb] p-[10px] text-[#374151] transition-colors duration-200 hover:bg-[#f5ebe0]"
                      >
                        &quot;Why is today important for me?&quot;
                      </li>
                      <li
                        onClick={() => {
                          setQuestion("What should I focus on this week?");
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="mb-2 cursor-pointer rounded-[8px] bg-[#f9fafb] p-[10px] text-[#374151] transition-colors duration-200 hover:bg-[#f5ebe0]"
                      >
                        &quot;What should I focus on this week?&quot;
                      </li>
                      <li
                        onClick={() => {
                          setQuestion("How do current transits affect my relationships?");
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="mb-2 cursor-pointer rounded-[8px] bg-[#f9fafb] p-[10px] text-[#374151] transition-colors duration-200 hover:bg-[#f5ebe0]"
                      >
                        &quot;How do current transits affect my relationships?&quot;
                      </li>
                      <li
                        onClick={() => {
                          setQuestion("What are the best days for career decisions?");
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                        className="cursor-pointer rounded-[8px] bg-[#f9fafb] p-[10px] text-[#374151] transition-colors duration-200 hover:bg-[#f5ebe0]"
                      >
                        &quot;What are the best days for career decisions?&quot;
                      </li>
                    </ul>
                  </div>
                ) : (
                  responses.map((item, index) => (
                    <div key={index} className="flex flex-col gap-[10px]">
                      <div className="max-w-[70%] self-end rounded-[12px] bg-[#6b4423] px-4 py-3 text-white">
                        <div className="mb-[6px] flex items-center justify-between text-[12px] opacity-80">
                          <strong>You</strong>
                          <span className="text-[11px]">{formatTime(item.timestamp)}</span>
                        </div>
                        <div className="whitespace-pre-wrap break-words text-[14px] leading-[1.6]">
                          {item.question}
                        </div>
                      </div>
                      <div className="max-w-[70%] self-start rounded-[12px] border border-[#e5e7eb] bg-[var(--muted)] px-4 py-3">
                        <div className="mb-[6px] flex items-center justify-between text-[12px] opacity-80">
                          <strong>🤖 AI Assistant</strong>
                          <span className="text-[11px]">{formatTime(item.response.timestamp)}</span>
                        </div>
                        <div className="whitespace-pre-wrap break-words text-[14px] leading-[1.6]">
                          {item.response.answer}
                        </div>
                        {item.response.relatedTransits &&
                          item.response.relatedTransits.length > 0 && (
                            <div className="mt-3 border-t border-t-[#e5e7eb] pt-3 text-[12px]">
                              <strong>Related Transits:</strong>
                              <div className="mt-[6px] flex flex-wrap gap-[6px]">
                                {item.response.relatedTransits.map((transit, idx) => (
                                  <span
                                    key={idx}
                                    className="rounded-[6px] bg-[#f5ebe0] px-2 py-1 text-[11px] font-medium text-[#5c4033]"
                                  >
                                    {transit.planet} in {transit.sign}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="max-w-[70%] self-start rounded-[12px] border border-[#e5e7eb] bg-[var(--muted)] px-4 py-3">
                    <div className="whitespace-pre-wrap break-words text-[14px] leading-[1.6]">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#6b4423]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#6b4423] [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#6b4423] [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-t-[#e5e7eb] bg-[#f9fafb] p-4"
              >
                <div className="mb-3">
                  <label className="mr-[10px] text-[14px] font-semibold text-[#374151]">
                    Context (Optional):
                  </label>
                  <select
                    value={context || ""}
                    onChange={(e) =>
                      setContext(
                        (e.target.value || undefined) as
                          | "daily"
                          | "weekly"
                          | "relationships"
                          | "career"
                          | "wellness"
                          | undefined,
                      )
                    }
                    className="formSelect rounded-[6px] border border-[#d1d5db] bg-white px-3 py-[6px] text-[14px]"
                  >
                    <option value="">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="relationships">Relationships</option>
                    <option value="career">Career</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>
                <div className="flex items-center gap-[10px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your astrology question..."
                    className="flex-1 rounded-[8px] border border-[#d1d5db] px-4 py-3 text-[14px] focus:border-[#6b4423] focus:outline-none"
                    disabled={loading}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="rounded-[8px] bg-[#6b4423] px-5 py-3 text-[18px] text-white transition-colors duration-200 hover:bg-[#5c3a1f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "⏳" : "📤"}
                  </button>
                </div>
                <div className="mt-[6px] text-right text-[12px] text-[#6b7280]">
                  {question.length} / 500 characters
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
